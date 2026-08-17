import StatCard from './StatCard';
import { exportSessionAsCSV, exportSessionAsJSON } from '../lib/storage';

function formatDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

export default function SessionSummary({ session, onNewSession, onDiscard, onViewHistory }) {
  const { totals, reps, side, targetAngle, durationMs } = session;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-line bg-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-ink">Session summary</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {side === 'both' ? 'Both arms' : side === 'left' ? 'Left arm' : 'Right arm'} · target {targetAngle}° ·{' '}
              {formatDuration(durationMs)}
            </p>
          </div>
          <div
            className={`rounded-full border px-3 py-1 text-sm font-medium ${
              totals.formScore >= 70 ? 'border-forest/30 bg-forest-soft text-forest' : 'border-amber/30 bg-amber-soft text-amber'
            }`}
          >
            {totals.formScore}% form score
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total reps" value={totals.total} />
          <StatCard label="Correct" value={totals.correct} accent="text-forest" />
          <StatCard label="Incorrect" value={totals.incorrect} accent="text-amber" />
          <StatCard label="Best ROM" value={`${totals.bestROM}°`} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Average ROM" value={`${totals.avgROM}°`} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onNewSession}
            className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream-soft transition hover:bg-forest-strong"
          >
            Start new session
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
          >
            View history
          </button>
          <button
            type="button"
            onClick={() => exportSessionAsJSON(session)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => exportSessionAsCSV(session)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="ml-auto rounded-full px-4 py-2 text-sm font-medium text-rust transition hover:opacity-80"
          >
            Discard session
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6">
        <h3 className="font-serif text-[15px] text-ink">Rep-by-rep breakdown</h3>
        {reps.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No reps were recorded this session.</p>
        ) : (
          <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-cream-soft text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Side</th>
                  <th className="px-3 py-2">ROM</th>
                  <th className="px-3 py-2">Elbow</th>
                  <th className="px-3 py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((r, i) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-3 py-2 text-ink-faint">{i + 1}</td>
                    <td className="px-3 py-2 capitalize text-ink-soft">{r.side}</td>
                    <td className="px-3 py-2 text-ink">{r.romMax}°</td>
                    <td className="px-3 py-2 text-ink">{r.elbowAngleAtPeak}°</td>
                    <td className={`px-3 py-2 font-medium ${r.correct ? 'text-forest' : 'text-amber'}`}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
