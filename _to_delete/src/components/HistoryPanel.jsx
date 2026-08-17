import { useMemo, useState } from 'react';
import {
  deleteSession,
  exportAllSessionsAsJSON,
  exportSessionAsCSV,
  exportSessionAsJSON,
  exportRecordAsCSV,
} from '../lib/storage';

const TYPE_LABELS = {
  exercise: 'Shoulder Raise',
  'sit-to-stand': 'Sit-to-Stand',
  'arm-movement': 'Arm Movement',
  'hand-assessment': 'Hand Assessment',
};

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Every record type stores a different shape (Phase-1 exercise sessions vs.
// the three assessment tests), so this maps each one to a common
// {subtitle, headline, badge, badgeGood, metrics[]} shape the list can
// render uniformly instead of branching all through the JSX below.
function describeRecord(s) {
  const type = s.type ?? 'exercise';
  const totals = s.totals ?? {};

  if (type === 'sit-to-stand') {
    return {
      typeLabel: TYPE_LABELS[type],
      subtitle: `${totals.total ?? 0}/${s.targetReps ?? totals.total ?? 0} reps`,
      headline: `${totals.total ?? 0} reps`,
      badge: `${totals.formScore ?? 0}% form`,
      badgeGood: (totals.formScore ?? 0) >= 70,
      metrics: [
        { label: 'Correct', value: totals.correct ?? 0, accent: 'text-forest' },
        { label: 'Avg rep time', value: `${((totals.avgRepMs ?? 0) / 1000).toFixed(1)}s` },
        { label: 'Avg extension', value: `${totals.avgExtension ?? 0}°` },
        { label: 'Stability', value: totals.stabilityScore ?? 0 },
      ],
    };
  }

  if (type === 'arm-movement') {
    const left = s.left ?? {};
    const right = s.right ?? {};
    return {
      typeLabel: TYPE_LABELS[type],
      subtitle: `${(left.total ?? 0) + (right.total ?? 0)} reps · left vs right`,
      headline: `${totals.asymmetryPct ?? 0}% asymmetry`,
      badge: `${totals.formScore ?? 0}% form`,
      badgeGood: (totals.asymmetryPct ?? 100) <= 15,
      metrics: [
        { label: 'Left best ROM', value: `${left.bestROM ?? 0}°` },
        { label: 'Right best ROM', value: `${right.bestROM ?? 0}°` },
        { label: 'ROM diff', value: `${totals.romDiffDeg ?? 0}°` },
        { label: 'Speed diff', value: `${((totals.speedDiffMs ?? 0) / 1000).toFixed(1)}s` },
      ],
    };
  }

  if (type === 'hand-assessment') {
    const left = s.left ?? {};
    const right = s.right ?? {};
    return {
      typeLabel: TYPE_LABELS[type],
      subtitle: `${totals.totalTaps ?? 0} taps`,
      headline: `${totals.totalTaps ?? 0} taps`,
      badge: `${left.ratePerSec ?? 0} / ${right.ratePerSec ?? 0} taps·s⁻¹`,
      badgeGood: true,
      metrics: [
        { label: 'Left taps', value: left.taps ?? 0 },
        { label: 'Right taps', value: right.taps ?? 0 },
        { label: 'Left rate', value: `${left.ratePerSec ?? 0}/s` },
        { label: 'Right rate', value: `${right.ratePerSec ?? 0}/s` },
      ],
    };
  }

  // 'exercise' (Phase-1 shoulder raise) and any legacy record without a type.
  return {
    typeLabel: TYPE_LABELS.exercise,
    subtitle: `${s.side === 'both' ? 'Both arms' : `${s.side ?? ''} arm`} · target ${s.targetAngle ?? '—'}°`,
    headline: `${totals.total ?? 0} reps`,
    badge: `${totals.formScore ?? 0}% form`,
    badgeGood: (totals.formScore ?? 0) >= 70,
    metrics: [
      { label: 'Correct', value: totals.correct ?? 0, accent: 'text-forest' },
      { label: 'Incorrect', value: totals.incorrect ?? 0, accent: 'text-amber' },
      { label: 'Avg ROM', value: `${totals.avgROM ?? 0}°` },
      { label: 'Best ROM', value: `${totals.bestROM ?? 0}°` },
    ],
  };
}

function exportCSVFor(record) {
  const type = record.type ?? 'exercise';
  if (type === 'exercise') exportSessionAsCSV(record);
  else exportRecordAsCSV(record);
}

export default function HistoryPanel({ sessions, onSessionsChange, onBack }) {
  const [expandedId, setExpandedId] = useState(null);

  const aggregate = useMemo(() => {
    if (sessions.length === 0) return null;
    const byType = sessions.reduce((acc, s) => {
      const label = TYPE_LABELS[s.type ?? 'exercise'] ?? 'Other';
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
    return { total: sessions.length, byType };
  }, [sessions]);

  const handleDelete = (id) => {
    onSessionsChange(deleteSession(id));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-ink">History</h2>
          <p className="text-sm text-ink-soft">Exercise sessions and assessment results, stored locally in this browser.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink-faint hover:text-ink"
          >
            Back
          </button>
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={exportAllSessionsAsJSON}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink-faint hover:text-ink"
            >
              Export all
            </button>
          )}
        </div>
      </div>

      {aggregate && (
        <div className="rounded-xl border border-line bg-panel px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Total records</div>
          <div className="mt-1 text-xl font-semibold text-ink">{aggregate.total}</div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
            {Object.entries(aggregate.byType).map(([label, count]) => (
              <span key={label}>
                {label}: <span className="font-medium text-ink">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-ink-soft">
          No sessions saved yet. Complete a session or assessment to see it here.
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const d = describeRecord(s);
            return (
              <div key={s.id} className="rounded-xl border border-line bg-panel p-4">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-line bg-cream-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
                        {d.typeLabel}
                      </span>
                      <span className="text-sm font-medium text-ink">{formatDate(s.endedAt)}</span>
                    </div>
                    <div className="mt-1 text-xs text-ink-soft">{d.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-ink">{d.headline}</div>
                      <div className={`text-xs font-medium ${d.badgeGood ? 'text-forest' : 'text-amber'}`}>
                        {d.badge}
                      </div>
                    </div>
                    <span className="text-ink-faint">{expandedId === s.id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedId === s.id && (
                  <div className="mt-4 space-y-3 border-t border-line pt-4">
                    <div className="grid grid-cols-2 gap-2 text-xs text-ink-soft sm:grid-cols-4">
                      {d.metrics.map((m) => (
                        <div key={m.label}>
                          {m.label}: <span className={`font-medium ${m.accent ?? 'text-ink'}`}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => exportSessionAsJSON(s)}
                        className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink-faint hover:text-ink"
                      >
                        Export JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => exportCSVFor(s)}
                        className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-ink-faint hover:text-ink"
                      >
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="ml-auto rounded-full px-3 py-1.5 text-xs font-medium text-rust hover:opacity-80"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
