import { useEffect, useRef, useState } from 'react';
import { useSitToStandTest } from '../../hooks/useSitToStandTest';
import { saveSession, exportSessionAsJSON as exportJSON, exportRecordAsCSV } from '../../lib/storage';
import CameraFrame from '../camera/CameraFrame';
import AngleGauge from '../AngleGauge';
import MetricCard from '../ui/MetricCard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ProgressSteps from '../ui/ProgressSteps';
import DemoVideo from '../ui/DemoVideo';
import ResultSummary from '../assessment/ResultSummary';
import Icon from '../ui/icons';
import { STEP_LABELS } from '../../config/steps';
import { getAssessmentVideo } from '../../config/videos';

const REP_OPTIONS = [3, 5, 10];

export default function SitToStandFlow({ assessment, onExit, onSaved }) {
  const [targetReps, setTargetReps] = useState(5);
  const [phase, setPhase] = useState('setup'); // setup | live | summary
  const [summary, setSummary] = useState(null);
  const [toastEvent, setToastEvent] = useState(null);
  const lastRepCountRef = useRef(0);

  const test = useSitToStandTest({ targetReps, audioFeedback: true });

  useEffect(() => {
    if (test.reps.length > lastRepCountRef.current) {
      const rep = test.reps[test.reps.length - 1];
      setToastEvent({
        key: rep.id,
        tone: rep.correct ? 'good' : 'warn',
        message: rep.correct ? `Rep ${rep.index} — full stand` : `Rep ${rep.index} — stand up fully`,
      });
    }
    lastRepCountRef.current = test.reps.length;
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
    return (
      <div className="space-y-6">
        <ProgressSteps steps={STEP_LABELS} currentIndex={stepIndex} className="mx-auto max-w-3xl" />
        <ResultSummary
          assessmentName="Sit-to-Stand"
          summaryLine={`${summary.totals.total}/${summary.targetReps} reps · ${(summary.durationMs / 1000).toFixed(1)}s total`}
          statusLabel={summary.totals.formScore >= 70 ? 'Good form' : 'Needs attention'}
          statusGood={summary.totals.formScore >= 70}
          metrics={[
            { label: 'Reps completed', value: summary.totals.total },
            { label: 'Avg rep time', value: `${(summary.totals.avgRepMs / 1000).toFixed(1)}s` },
            { label: 'Avg extension', value: `${summary.totals.avgExtension}°` },
            {
              label: 'Stability score',
              value: summary.totals.stabilityScore,
              accent: summary.totals.stabilityScore >= 70 ? 'success' : 'warning',
            },
          ]}
          insight="Stability score is an approximate postural-sway heuristic derived from hip drift while standing, not a validated clinical balance measure."
          disclaimerVariant="default"
          onRepeat={handleRestart}
          onExit={onExit}
          onExportJSON={() => exportJSON(summary)}
          onExportCSV={() => exportRecordAsCSV(summary)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Sit-to-Stand</h1>
          <p className="text-[13.5px] text-ink-soft">Reuses the rep-counting engine on knee-extension angle.</p>
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
            notDetectedLabel="Step back so your hips, knees and ankles are all visible"
            toastEvent={toastEvent}
            badge={test.running ? `Rep ${test.reps.length}/${targetReps}` : null}
            positionHint={assessment?.position}
            onStart={!test.running ? handleStart : undefined}
            canStart={test.modelStatus === 'ready'}
          />
          <Card className="flex items-center gap-4">
            <p className="flex-1 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">How it works — </span>
              stand up fully, then sit back down, for {targetReps} reps as smoothly and quickly as you can. Keep your
              hips, knees and ankles in frame throughout.
            </p>
            <DemoVideo src={getAssessmentVideo('sit-to-stand')} label="Demo" size="wide" className="w-32 shrink-0 sm:w-40" />
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
              <AngleGauge label="Knee extension" angle={test.visible ? test.liveAngle : null} target={165} tolerance={15} accent="#15803d" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MetricCard label="Reps" value={test.reps.length} size="sm" />
              <MetricCard label="Target" value={targetReps} size="sm" />
            </div>
          </Card>

          <Card className="space-y-5">
            <h3 className="text-[13px] font-semibold text-ink">Test setup</h3>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Target reps</h4>
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
