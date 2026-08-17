import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/icons';
import { deleteSession, exportAllSessionsAsJSON, exportSessionAsCSV, exportSessionAsJSON, exportRecordAsCSV } from '../lib/storage';
import { describeRecord, formatDate, TYPE_LABELS } from '../lib/recordFormat';

function exportCSVFor(record) {
  const type = record.type ?? 'exercise';
  if (type === 'exercise') exportSessionAsCSV(record);
  else exportRecordAsCSV(record);
}

export default function HistoryPage({ sessions, onSessionsChange }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const aggregate = useMemo(() => {
    if (sessions.length === 0) return null;
    const byType = sessions.reduce((acc, s) => {
      const label = TYPE_LABELS[s.type ?? 'exercise'] ?? 'Other';
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
    return { total: sessions.length, byType };
  }, [sessions]);

  const filtered = filter === 'all' ? sessions : sessions.filter((s) => (s.type ?? 'exercise') === filter);
  const filterTypes = ['all', ...new Set(sessions.map((s) => s.type ?? 'exercise'))];

  const handleDelete = (id) => onSessionsChange(deleteSession(id));

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Progress"
        title="History"
        description="Every assessment and session, stored locally in this browser only."
        action={
          sessions.length > 0 && (
            <Button variant="secondary" size="sm" onClick={exportAllSessionsAsJSON}>
              <Icon name="download" className="h-3.5 w-3.5" /> Export all
            </Button>
          )
        }
      />

      {aggregate && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="!p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Total records</div>
            <div className="mt-1 font-display text-2xl font-semibold text-ink">{aggregate.total}</div>
          </Card>
          {Object.entries(aggregate.byType).slice(0, 3).map(([label, count]) => (
            <Card key={label} className="!p-4">
              <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</div>
              <div className="mt-1 font-display text-2xl font-semibold text-ink">{count}</div>
            </Card>
          ))}
        </div>
      )}

      {sessions.length === 0 ? (
        <EmptyState
          icon="history"
          title="No assessments yet"
          body="Complete your first assessment to begin tracking movement patterns over time."
          action={
            <Button as={Link} to="/app/assessments" variant="primary" size="sm">
              Start assessment
            </Button>
          }
        />
      ) : (
        <>
          {filterTypes.length > 2 && (
            <div className="flex flex-wrap gap-1.5">
              {filterTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilter(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    filter === t
                      ? 'border-primary/30 bg-primary-soft text-primary'
                      : 'border-border bg-surface text-ink-soft hover:text-ink'
                  }`}
                >
                  {t === 'all' ? 'All' : TYPE_LABELS[t] ?? t}
                </button>
              ))}
            </div>
          )}

          <Card padded={false} className="divide-y divide-border">
            {filtered.map((s) => {
              const d = describeRecord(s);
              const expanded = expandedId === s.id;
              return (
                <div key={s.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : s.id)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-surface-hover"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          d.badgeGood ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                        }`}
                      >
                        <Icon name={d.badgeGood ? 'checkCircle' : 'alert'} className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone="neutral">{d.typeLabel}</Badge>
                          <span className="text-[13px] font-medium text-ink">{formatDate(s.endedAt)}</span>
                        </div>
                        <div className="mt-1 text-xs text-ink-soft">{d.subtitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[13.5px] font-semibold text-ink">{d.headline}</div>
                        <div className={`text-xs font-medium ${d.badgeGood ? 'text-success' : 'text-warning'}`}>{d.badge}</div>
                      </div>
                      <Icon name="chevronDown" className={`h-4 w-4 text-ink-faint transition ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {expanded && (
                    <div className="space-y-3 border-t border-border bg-bg-inset/40 px-5 py-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {d.metrics.map((m) => (
                          <div key={m.label} className="rounded-lg border border-border bg-surface px-3 py-2">
                            <div className="text-[10.5px] font-medium uppercase tracking-wide text-ink-faint">{m.label}</div>
                            <div className="mt-0.5 text-[13px] font-semibold text-ink">{m.value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => exportSessionAsJSON(s)}>
                          <Icon name="download" className="h-3.5 w-3.5" /> JSON
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => exportCSVFor(s)}>
                          <Icon name="download" className="h-3.5 w-3.5" /> CSV
                        </Button>
                        <Button variant="danger" size="sm" className="ml-auto" onClick={() => handleDelete(s.id)}>
                          <Icon name="trash" className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}
