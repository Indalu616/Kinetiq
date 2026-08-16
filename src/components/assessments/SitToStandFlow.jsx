import { useEffect, useRef, useState } from 'react';
import { useSitToStandTest } from '../../hooks/useSitToStandTest';
import { saveSession, exportSessionAsJSON as exportJSON, exportRecordAsCSV } from '../../lib/storage';
import TestStage from './TestStage';
import AngleGauge from '../AngleGauge';
import StatCard from '../StatCard';
import MovementDemo from '../demo/MovementDemo';

const REP_OPTIONS = [3, 5, 10];

export default function SitToStandFlow({ onExit, onSaved }) {
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
    // autoFinished flips from inside the RAF detection loop's target-reps
    // check (an external system), so this is the correct sync point.
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

  if (phase === 'summary' && summary) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-ink">Sit-to-Stand results</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {summary.totals.total}/{summary.targetReps} reps · {(summary.durationMs / 1000).toFixed(1)}s total
              </p>
            </div>
            <div
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                summary.totals.formScore >= 70
                  ? 'border-forest/30 bg-forest-soft text-forest'
                  : 'border-amber/30 bg-amber-soft text-amber'
              }`}
            >
              {summary.totals.formScore}% form score
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Reps" value={summary.totals.total} />
            <StatCard label="Correct" value={summary.totals.correct} accent="text-forest" />
            <StatCard label="Avg rep time" value={`${(summary.totals.avgRepMs / 1000).toFixed(1)}s`} />
            <StatCard label="Fastest rep" value={`${(summary.totals.bestRepMs / 1000).toFixed(1)}s`} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Avg extension" value={`${summary.totals.avgExtension}°`} />
            <StatCard
              label="Stability score"
              value={`${summary.totals.stabilityScore}`}
              sub="Approximate — not a validated clinical measure"
              accent={summary.totals.stabilityScore >= 70 ? 'text-forest' : 'text-amber'}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream-soft transition hover:bg-forest-strong"
            >
              Run again
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
            >
              Back to assessments
            </button>
            <button
              type="button"
              onClick={() => exportJSON(summary)}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => exportRecordAsCSV(summary)}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-ink">Sit-to-Stand</h2>
          <p className="text-sm text-ink-soft">Reuses the rep-counting engine on knee-extension angle.</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink-faint hover:text-ink"
        >
          Back
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <TestStage
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
          />
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4">
            <p className="flex-1 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">How it works —</span> stand up fully, then sit back down, for{' '}
              {targetReps} reps as smoothly and quickly as you can. Position the camera so your hips, knees and
              ankles stay in frame throughout — this test needs more of your body visible than the shoulder raise
              does.
            </p>
            <MovementDemo type="sit-to-stand" size="sm" showCaption={false} className="shrink-0" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[15px] text-ink">Live</h3>
              <span className="rounded-full border border-line bg-cream-soft px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink-soft">
                {(test.elapsedMs / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="mt-3 flex justify-center">
              <AngleGauge label="Knee extension" angle={test.visible ? test.liveAngle : null} target={165} tolerance={15} accent="#d9a441" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatCard label="Reps" value={test.reps.length} accent="text-ink" />
              <StatCard label="Target" value={targetReps} />
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-line bg-panel p-5">
            <h3 className="font-serif text-[15px] text-ink">Test setup</h3>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Target reps</h4>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-full border border-line bg-cream-soft p-1">
                {REP_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={test.running}
                    onClick={() => setTargetReps(n)}
                    className={`rounded-full px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      targetReps === n ? 'bg-forest text-cream-soft' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {!test.running ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={test.modelStatus !== 'ready'}
                className="w-full rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream-soft transition hover:bg-forest-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint"
              >
                Start test
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="w-full rounded-full bg-rust px-4 py-2 text-sm font-medium text-cream-soft transition hover:opacity-90"
              >
                End test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
