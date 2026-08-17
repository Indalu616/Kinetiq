import { useEffect, useState } from 'react';
import { useHandAssessment } from '../../hooks/useHandAssessment';
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

const DURATION_OPTIONS = [10, 15, 20];

export default function HandAssessmentFlow({ assessment, onExit, onSaved }) {
  const [durationSec, setDurationSec] = useState(10);
  const [phase, setPhase] = useState('setup'); // setup | live | summary
  const [summary, setSummary] = useState(null);

  const test = useHandAssessment({ durationSec, audioFeedback: true });

  const handleFinish = () => {
    const result = test.finish();
    setSummary(result);
    const updated = saveSession(result);
    onSaved?.(updated);
    setPhase('summary');
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (test.autoFinished) handleFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.autoFinished]);

  const handleStart = async () => {
    setPhase('live');
    await test.start(test.camera.deviceId);
  };

  const handleRestart = () => {
    setSummary(null);
    setPhase('setup');
  };

  const stepIndex = phase === 'setup' ? 1 : phase === 'live' ? 2 : 3;

  if (phase === 'summary' && summary) {
    const { left, right, totals } = summary;
    const diffPct = left.taps + right.taps > 0 ? Math.round((totals.asymmetryTaps / Math.max(left.taps, right.taps, 1)) * 100) : 0;
    return (
      <div className="space-y-6">
        <ProgressSteps steps={STEP_LABELS} currentIndex={stepIndex} className="mx-auto max-w-3xl" />
        <ResultSummary
          assessmentName="Hand Assessment"
          summaryLine={`${durationSec}s tapping window`}
          statusLabel={diffPct <= 20 ? 'Symmetric' : 'Difference observed'}
          statusGood={diffPct <= 20}
          metrics={[
            { label: 'Left taps', value: left.taps },
            { label: 'Right taps', value: right.taps },
            { label: 'Left rate', value: `${left.ratePerSec}/s` },
            { label: 'Right rate', value: `${right.ratePerSec}/s` },
          ]}
          visual={<SymmetryBar label="Tapping speed" leftValue={left.ratePerSec} rightValue={right.ratePerSec} unit=" taps/s" />}
          insight={
            diffPct <= 20
              ? 'Tapping speed and repetition count were closely matched between hands.'
              : `A measurable difference between left and right hand tapping was observed (${totals.asymmetryTaps} tap difference).`
          }
          disclaimerVariant="screening"
          onRepeat={handleRestart}
          onExit={onExit}
          onExportJSON={() => exportJSON(summary)}
          onExportCSV={() => exportRecordAsCSV(summary)}
        />
        <p className="mx-auto max-w-3xl text-center text-[11.5px] text-ink-faint">
          Pinch thresholds are an approximate heuristic, not a clinically validated measurement.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Hand Assessment</h1>
          <p className="text-[13.5px] text-ink-soft">Tap thumb to index finger as fast as you can.</p>
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
            detected={test.handsVisible.left || test.handsVisible.right}
            notDetectedLabel="Hold a hand up, 30–50cm from the camera"
            badge={test.running ? `${test.remainingSec}s remaining` : null}
            positionHint={assessment?.position}
            onStart={!test.running ? handleStart : undefined}
            canStart={test.modelStatus === 'ready'}
          />
          <Card className="flex items-center gap-4">
            <p className="flex-1 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">How it works — </span>
              hold one or both hands up so your thumb and fingers are visible, then tap your thumb and index finger
              together as evenly and quickly as you can until the timer runs out.
            </p>
            <div className="flex shrink-0 gap-2">
              <DemoVideo src={getAssessmentVideo('hand-assessment-prep')} label="Loosen up" className="w-20" />
              <DemoVideo src={getAssessmentVideo('hand-assessment')} label="Tap" className="w-20" />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-ink">Live</h3>
              <span className="rounded-full border border-border bg-bg-inset px-2.5 py-0.5 text-xs font-medium tabular text-ink-soft">
                {test.running ? `${test.remainingSec}s` : `${durationSec}s`}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MetricCard label="Left taps" value={test.reps.left.length} size="sm" />
              <MetricCard label="Right taps" value={test.reps.right.length} size="sm" />
            </div>
          </Card>

          <Card className="space-y-5">
            <h3 className="text-[13px] font-semibold text-ink">Test setup</h3>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Duration</h4>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-border bg-bg-inset p-1">
                {DURATION_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={test.running}
                    onClick={() => setDurationSec(n)}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      durationSec === n ? 'bg-primary text-white' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {n}s
                  </button>
                ))}
              </div>
            </div>

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
