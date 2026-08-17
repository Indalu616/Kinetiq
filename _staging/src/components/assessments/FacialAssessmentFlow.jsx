import { useEffect, useState } from 'react';
import { useFacialAssessment } from '../../hooks/useFacialAssessment';
import { saveSession, exportSessionAsJSON as exportJSON, exportRecordAsCSV } from '../../lib/storage';
import CameraFrame from '../camera/CameraFrame';
import MetricCard from '../ui/MetricCard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ProgressSteps from '../ui/ProgressSteps';
import DemoVideo from '../ui/DemoVideo';
import ResultSummary from '../assessment/ResultSummary';
import SymmetryBar from '../ui/SymmetryBar';
import Icon from '../ui/icons';
import { STEP_LABELS } from '../../config/steps';
import { getAssessmentVideo } from '../../config/videos';

export default function FacialAssessmentFlow({ assessment, onExit, onSaved }) {
  const [phase, setPhase] = useState('setup'); // setup | live | summary
  const [summary, setSummary] = useState(null);

  const test = useFacialAssessment({ durationSec: 6, audioFeedback: true });

  const handleFinish = () => {
    const result = test.finish();
    setSummary(result);
    const updated = saveSession(result);
    onSaved?.(updated);
    setPhase('summary');
  };

  const handleStart = async () => {
    setPhase('live');
    await test.start(test.camera.deviceId);
  };

  useEffect(() => {
    // autoFinished flips from inside the RAF detection loop's countdown
    // timer (an external system), so this is the correct sync point.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (test.autoFinished) handleFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.autoFinished]);

  const handleRestart = () => {
    setSummary(null);
    setPhase('setup');
  };

  const stepIndex = phase === 'setup' ? 1 : phase === 'live' ? 2 : 3;

  if (phase === 'summary' && summary) {
    const { totals, pairs } = summary;
    const smile = pairs.find((p) => p.key === 'smile');
    const brow = pairs.find((p) => p.key === 'brow');

    if (!totals.confident) {
      return (
        <div className="space-y-6">
          <ProgressSteps steps={STEP_LABELS} currentIndex={stepIndex} className="mx-auto max-w-3xl" />
          <ResultSummary
            assessmentName="Facial Symmetry"
            summaryLine="We couldn't get a clear enough read this time"
            statusLabel="Inconclusive"
            statusGood={false}
            insight="No confident smile was detected in this window. Make sure your face is well-lit, centered in frame, and try smiling a bit more clearly on your next attempt."
            disclaimerVariant="screening"
            onRepeat={handleRestart}
            onExit={onExit}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <ProgressSteps steps={STEP_LABELS} currentIndex={stepIndex} className="mx-auto max-w-3xl" />
        <ResultSummary
          assessmentName="Facial Symmetry"
          summaryLine="Smile-hold screening · peak facial movement compared left vs. right"
          statusLabel={totals.overallAsymmetryPct <= 15 ? 'Symmetric' : 'Difference observed'}
          statusGood={totals.overallAsymmetryPct <= 15}
          metrics={[
            { label: 'Overall difference', value: `${totals.overallAsymmetryPct}%`, accent: totals.overallAsymmetryPct <= 15 ? 'success' : 'warning' },
            { label: 'Smile symmetry', value: `${smile?.asymmetryPct ?? 0}% diff` },
            { label: 'Eyebrow symmetry', value: `${brow?.asymmetryPct ?? 0}% diff` },
            { label: 'Resting baseline', value: totals.neutralAsymmetryPct != null ? `${totals.neutralAsymmetryPct}% diff` : '—' },
          ]}
          visual={
            <div className="space-y-4">
              <SymmetryBar
                label="Smile activation (mouth-corner movement)"
                leftValue={Math.round((smile?.left ?? 0) * 100)}
                rightValue={Math.round((smile?.right ?? 0) * 100)}
                unit="%"
                max={100}
              />
              <SymmetryBar
                label="Eyebrow-raise activation"
                leftValue={Math.round((brow?.left ?? 0) * 100)}
                rightValue={Math.round((brow?.right ?? 0) * 100)}
                unit="%"
                max={100}
              />
            </div>
          }
          insight={
            totals.overallAsymmetryPct <= 15
              ? 'Facial movement on the left and right side of your face was closely matched while smiling.'
              : `A measurable difference between left and right facial movement was observed (${totals.overallAsymmetryPct}%). Uneven smile or facial movement is one of the early signs used in stroke screening protocols — consider a follow-up screening or speaking with a healthcare professional.`
          }
          disclaimerVariant="screening"
          onRepeat={handleRestart}
          onExit={onExit}
          onExportJSON={() => exportJSON(summary)}
          onExportCSV={() => exportRecordAsCSV(summary)}
        />
      </div>
    );
  }

  const instruction =
    test.phase === 'smile' ? 'Smile naturally and hold it' : test.phase === 'neutral' ? 'Hold a relaxed, neutral expression' : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Facial Symmetry</h1>
          <p className="text-[13.5px] text-ink-soft">Early-sign screening — reads facial-movement symmetry while you smile.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          <Icon name="x" className="h-3.5 w-3.5" /> Exit
        </Button>
      </div>

      <ProgressSteps steps={STEP_LABELS} currentIndex={stepIndex} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <CameraFrame
            videoRef={test.videoRef}
            canvasRef={test.canvasRef}
            modelStatus={test.modelStatus}
            modelError={test.modelError}
            cameraStatus={test.camera.status}
            cameraError={test.camera.error}
            running={test.running}
            detected={test.visible}
            notDetectedLabel="Center your face in the frame, in good lighting"
            badge={test.running ? (instruction ?? `${test.remainingSec}s remaining`) : null}
            positionHint={assessment?.position}
            onStart={!test.running ? handleStart : undefined}
            canStart={test.modelStatus === 'ready'}
          />
          <Card className="flex items-center gap-4">
            <p className="flex-1 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">How it works — </span>
              center your face in frame and hold still for a moment, then smile naturally and hold it. The screening
              compares peak movement on the left and right side of your face.
            </p>
            <DemoVideo src={getAssessmentVideo('facial-symmetry')} label="Demo" className="w-24 shrink-0" />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-ink">Live</h3>
              <span className="rounded-full border border-border bg-bg-inset px-2.5 py-0.5 text-xs font-medium tabular text-ink-soft">
                {test.running ? `${test.remainingSec}s` : '6s'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MetricCard label="Face" value={test.visible ? 'Detected' : '—'} size="sm" accent={test.visible ? 'success' : 'neutral'} />
              <MetricCard label="Phase" value={test.phase === 'smile' ? 'Smiling' : test.phase === 'neutral' ? 'Neutral' : '—'} size="sm" />
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-[13px] font-semibold text-ink">Before you start</h3>
            <ul className="space-y-2">
              {assessment?.steps.map((s) => (
                <li key={s.title} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                  <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.4} />
                  <span>
                    <span className="font-medium text-ink">{s.title}. </span>
                    {s.body}
                  </span>
                </li>
              ))}
            </ul>

            {!test.running ? (
              <Button variant="primary" className="w-full" onClick={handleStart} disabled={test.modelStatus !== 'ready'}>
                Start assessment
              </Button>
            ) : (
              <Button variant="dangerSolid" className="w-full" onClick={handleFinish}>
                End assessment
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
