import { useEffect, useRef, useState } from 'react';
import { useArmAssessment } from '../../hooks/useArmAssessment';
import { saveSession, exportSessionAsJSON as exportJSON, exportRecordAsCSV } from '../../lib/storage';
import CameraFrame from '../camera/CameraFrame';
import AngleGauge from '../AngleGauge';
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

const REP_OPTIONS = [3, 5, 8];
const LEFT_ACCENT = '#15803d';
const RIGHT_ACCENT = '#c2660e';

export default function ArmAssessmentFlow({ assessment, onExit, onSaved }) {
  const [targetReps, setTargetReps] = useState(5);
  const [phase, setPhase] = useState('setup'); // setup | live | summary
  const [summary, setSummary] = useState(null);
  const [toastEvent, setToastEvent] = useState(null);
  const lastCountsRef = useRef({ left: 0, right: 0 });

  const test = useArmAssessment({ targetReps, audioFeedback: true });

  useEffect(() => {
    for (const side of ['left', 'right']) {
      const list = test.reps[side];
      if (list.length > lastCountsRef.current[side]) {
        const rep = list[list.length - 1];
        setToastEvent({
          key: rep.id,
          tone: rep.correct ? 'good' : 'warn',
          message: `${side === 'left' ? 'Left' : 'Right'} rep ${rep.index} — ${rep.correct ? 'good range' : 'raise higher'}`,
        });
      }
      lastCountsRef.current[side] = list.length;
    }
  }, [test.reps]);

  const handleFinish = () => {
    const result = test.finish();
    setSummary(result);
    const updated = saveSession(result);
    onSaved?.(updated);
    setPhase('summary');
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (test.phase === 'done' && phase === 'live') handleFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.phase]);

  const handleStart = async () => {
    setPhase('live');
    lastCountsRef.current = { left: 0, right: 0 };
    await test.start(test.camera.deviceId);
  };

  const handleRestart = () => {
    setSummary(null);
    setPhase('setup');
  };

  const stepIndex = phase === 'setup' ? 1 : phase === 'live' ? 2 : 3;

  if (phase === 'summary' && summary) {
    const { left, right, totals } = summary;
    return (
      <div className="space-y-6">
        <ProgressSteps steps={STEP_LABELS} currentIndex={stepIndex} className="mx-auto max-w-3xl" />
        <ResultSummary
          assessmentName="Arm Movement"
          summaryLine={`${left.total + right.total} reps total · ${(summary.durationMs / 1000).toFixed(1)}s`}
          statusLabel={totals.asymmetryPct <= 15 ? 'Symmetric' : 'Difference observed'}
          statusGood={totals.asymmetryPct <= 15}
          metrics={[
            { label: 'Left best ROM', value: `${left.bestROM}°` },
            { label: 'Right best ROM', value: `${right.bestROM}°` },
            { label: 'Asymmetry', value: `${totals.asymmetryPct}%`, accent: totals.asymmetryPct <= 15 ? 'success' : 'warning' },
            { label: 'Avg form score', value: `${totals.formScore}%` },
          ]}
          visual={
            <div className="space-y-4">
              <SymmetryBar label="Best range of motion" leftValue={left.bestROM} rightValue={right.bestROM} unit="°" />
              <SymmetryBar label="Average rep time" leftValue={+(left.avgRepMs / 1000).toFixed(1)} rightValue={+(right.avgRepMs / 1000).toFixed(1)} unit="s" />
            </div>
          }
          insight={
            totals.asymmetryPct <= 15
              ? 'Your left and right arm range of motion were closely matched during this test.'
              : `A measurable difference between left and right arm movement was observed (${totals.asymmetryPct}%).`
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

  const phaseLabel = test.phase === 'left' ? 'Left arm' : test.phase === 'right' ? 'Right arm' : 'Done';
  const phaseCount = test.phase === 'left' ? test.reps.left.length : test.reps.right.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Arm Movement</h1>
          <p className="text-[13.5px] text-ink-soft">Left arm, then right arm — results are compared automatically.</p>
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
            notDetectedLabel="Step into frame, facing the camera"
            toastEvent={toastEvent}
            badge={test.running ? `Testing: ${phaseLabel} · rep ${phaseCount}/${targetReps}` : null}
            positionHint={assessment?.position}
            onStart={!test.running ? handleStart : undefined}
            canStart={test.modelStatus === 'ready'}
          />
          <Card className="flex items-center gap-4">
            <p className="flex-1 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">How it works — </span>
              raise your left arm out to the side and back down for {targetReps} reps, then the test automatically
              switches to your right arm for {targetReps} more. Keep both shoulders visible throughout.
            </p>
            <DemoVideo
              src={getAssessmentVideo('arm-movement')}
              label="Demo"
              size="wide"
              className="w-32 shrink-0 sm:w-40"
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-ink">Live</h3>
              <span className="rounded-full border border-border bg-bg-inset px-2.5 py-0.5 text-xs font-medium tabular text-ink-soft">
                {(test.elapsedMs / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="mt-3 flex justify-center">
              <AngleGauge
                label={phaseLabel}
                angle={test.visible ? test.liveAngle : null}
                target={90}
                tolerance={12}
                accent={test.phase === 'left' ? LEFT_ACCENT : RIGHT_ACCENT}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MetricCard label="Left reps" value={test.reps.left.length} size="sm" />
              <MetricCard label="Right reps" value={test.reps.right.length} size="sm" />
            </div>
          </Card>

          <Card className="space-y-5">
            <h3 className="text-[13px] font-semibold text-ink">Test setup</h3>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Reps per arm</h4>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-border bg-bg-inset p-1">
                {REP_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={test.running}
                    onClick={() => setTargetReps(n)}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      targetReps === n ? 'bg-primary text-white' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {n}
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
