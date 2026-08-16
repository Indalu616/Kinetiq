import { useEffect, useRef, useState } from 'react';
import { useArmAssessment } from '../../hooks/useArmAssessment';
import { saveSession, exportSessionAsJSON as exportJSON, exportRecordAsCSV } from '../../lib/storage';
import TestStage from './TestStage';
import AngleGauge from '../AngleGauge';
import StatCard from '../StatCard';

const REP_OPTIONS = [3, 5, 8];

export default function ArmAssessmentFlow({ onExit, onSaved }) {
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
          message: `${side === 'left' ? 'Left' : 'Right'} rep ${rep.index} — ${rep.correct ? 'good' : 'raise higher'}`,
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
    // test.phase flips to 'done' from inside the RAF detection loop (an
    // external system, not a user event), so reacting to it here — rather
    // than in an event handler — is the correct sync point.
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

  if (phase === 'summary' && summary) {
    const { left, right, totals } = summary;
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-ink">Arm Movement results</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {left.total + right.total} reps total · {(summary.durationMs / 1000).toFixed(1)}s
              </p>
            </div>
            <div
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                totals.asymmetryPct <= 15
                  ? 'border-forest/30 bg-forest-soft text-forest'
                  : 'border-amber/30 bg-amber-soft text-amber'
              }`}
            >
              {totals.asymmetryPct}% asymmetry
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-cream-soft p-4">
              <h3 className="text-xs font-semibold" style={{ color: '#a4681f' }}>
                Left arm
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Best ROM</div>
                  <div className="font-semibold text-ink">{left.bestROM}°</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Avg ROM</div>
                  <div className="font-semibold text-ink">{left.avgROM}°</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Avg rep time</div>
                  <div className="font-semibold text-ink">{(left.avgRepMs / 1000).toFixed(1)}s</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Form</div>
                  <div className="font-semibold text-ink">{left.formScore}%</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-cream-soft p-4">
              <h3 className="text-xs font-semibold" style={{ color: '#a4522e' }}>
                Right arm
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Best ROM</div>
                  <div className="font-semibold text-ink">{right.bestROM}°</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Avg ROM</div>
                  <div className="font-semibold text-ink">{right.avgROM}°</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Avg rep time</div>
                  <div className="font-semibold text-ink">{(right.avgRepMs / 1000).toFixed(1)}s</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Form</div>
                  <div className="font-semibold text-ink">{right.formScore}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatCard label="ROM difference (L−R)" value={`${totals.romDiffDeg > 0 ? '+' : ''}${totals.romDiffDeg}°`} />
            <StatCard
              label="Speed difference (L−R)"
              value={`${totals.speedDiffMs > 0 ? '+' : ''}${(totals.speedDiffMs / 1000).toFixed(1)}s`}
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

  const phaseLabel = test.phase === 'left' ? 'Left arm' : test.phase === 'right' ? 'Right arm' : 'Done';
  const phaseCount = test.phase === 'left' ? test.reps.left.length : test.reps.right.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-ink">Arm Movement</h2>
          <p className="text-sm text-ink-soft">Left arm, then right arm — the results are compared automatically.</p>
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
            notDetectedLabel="Step into frame, facing the camera"
            toastEvent={toastEvent}
            badge={test.running ? `Testing: ${phaseLabel} · rep ${phaseCount}/${targetReps}` : null}
          />
          <div className="rounded-2xl border border-line bg-panel p-4 text-[13px] leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">How it works —</span> raise your left arm out to the side and
            back down for {targetReps} reps, then the test automatically switches to your right arm for {targetReps}{' '}
            more. Keep both shoulders visible throughout.
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
              <AngleGauge
                label={phaseLabel}
                angle={test.visible ? test.liveAngle : null}
                target={90}
                tolerance={12}
                accent={test.phase === 'left' ? '#d9a441' : '#c1704e'}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatCard label="Left reps" value={test.reps.left.length} />
              <StatCard label="Right reps" value={test.reps.right.length} />
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-line bg-panel p-5">
            <h3 className="font-serif text-[15px] text-ink">Test setup</h3>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Reps per arm</h4>
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
