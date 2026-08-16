import { useEffect, useState } from 'react';
import { useHandAssessment } from '../../hooks/useHandAssessment';
import { saveSession, exportSessionAsJSON as exportJSON, exportRecordAsCSV } from '../../lib/storage';
import TestStage from './TestStage';
import StatCard from '../StatCard';
import MovementDemo from '../demo/MovementDemo';

const DURATION_OPTIONS = [10, 15, 20];

export default function HandAssessmentFlow({ onExit, onSaved }) {
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
    // autoFinished flips from inside the RAF detection loop's countdown
    // timer (an external system), so this is the correct sync point.
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
    const { left, right, totals } = summary;
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-ink">Hand Assessment results</h2>
              <p className="mt-1 text-sm text-ink-soft">{durationSec}s tapping window</p>
            </div>
            <div className="rounded-full border border-line bg-cream-soft px-3 py-1 text-sm font-medium text-ink">
              {totals.totalTaps} total taps
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-cream-soft p-4">
              <h3 className="text-xs font-semibold" style={{ color: '#a4681f' }}>
                Left hand
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Taps</div>
                  <div className="font-semibold text-ink">{left.taps}</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Rate</div>
                  <div className="font-semibold text-ink">{left.ratePerSec}/s</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-cream-soft p-4">
              <h3 className="text-xs font-semibold" style={{ color: '#a4522e' }}>
                Right hand
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Taps</div>
                  <div className="font-semibold text-ink">{right.taps}</div>
                </div>
                <div>
                  <div className="text-ink-faint text-[11px] uppercase">Rate</div>
                  <div className="font-semibold text-ink">{right.ratePerSec}/s</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <StatCard label="Left/right tap difference" value={totals.asymmetryTaps} />
          </div>

          <p className="mt-4 text-[11px] text-ink-faint">
            Pinch thresholds are an approximate heuristic, not a clinically validated measurement.
          </p>

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
          <h2 className="font-serif text-xl text-ink">Hand Assessment</h2>
          <p className="text-sm text-ink-soft">Tap thumb to index finger as fast as you can.</p>
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
            detected={test.handsVisible.left || test.handsVisible.right}
            notDetectedLabel="Hold a hand up, 30–50cm from the camera"
            badge={test.running ? `${test.remainingSec}s left` : null}
          />
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4">
            <p className="flex-1 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">How it works —</span> hold one or both hands up so your thumb
              and fingers are visible, then tap your thumb and index finger together as many times as you can before
              the timer runs out.
            </p>
            <MovementDemo type="hand-tap" size="sm" showCaption={false} className="shrink-0" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[15px] text-ink">Live</h3>
              <span className="rounded-full border border-line bg-cream-soft px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink-soft">
                {test.running ? `${test.remainingSec}s` : `${durationSec}s`}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatCard label="Left taps" value={test.reps.left.length} accent="text-ink" />
              <StatCard label="Right taps" value={test.reps.right.length} accent="text-ink" />
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-line bg-panel p-5">
            <h3 className="font-serif text-[15px] text-ink">Test setup</h3>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Duration</h4>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-full border border-line bg-cream-soft p-1">
                {DURATION_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={test.running}
                    onClick={() => setDurationSec(n)}
                    className={`rounded-full px-2 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      durationSec === n ? 'bg-forest text-cream-soft' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {n}s
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
