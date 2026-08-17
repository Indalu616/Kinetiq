import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/icons';
import { computeOverviewMetrics } from '../lib/dashboardMetrics';
import { describeRecord, formatRelativeTime } from '../lib/recordFormat';
import { getAssessment, AVAILABLE_ASSESSMENTS } from '../config/assessments';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function OverviewPage({ sessions }) {
  const metrics = computeOverviewMetrics(sessions);
  const recent = sessions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-inset px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              Session active — on-device
            </span>
            <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight text-ink">
              {greeting()}. Here's where your screening stands.
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              {metrics.latest
                ? `Last activity: ${metrics.latestAssessmentName} · ${formatRelativeTime(metrics.latest.endedAt)}.`
                : 'You haven\'t completed an assessment yet — run your first one to start building a screening history.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button as={Link} to="/app/assessments" variant="primary">
                <Icon name="bolt" className="h-4 w-4" /> Start an assessment
              </Button>
              <Button as={Link} to="/app/screening" variant="secondary">
                Go to Stroke Screening
              </Button>
            </div>
          </div>

          <div className="w-full max-w-[220px] shrink-0 rounded-lg border border-border bg-bg-inset/60 p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Screening progress</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-semibold text-ink">{metrics.screeningCompletedCount}</span>
              <span className="text-sm text-ink-faint">/ 3 groups</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(metrics.screeningCompletedCount / 3) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-ink-soft">{metrics.screeningStatus}</div>
          </div>
        </div>
      </Card>

      {/* Key metrics */}
      <section>
        <SectionHeader eyebrow="At a glance" title="Key metrics" className="mb-4" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile
            icon="assessments"
            label="Assessments completed"
            value={metrics.assessmentsCompleted}
            sub={metrics.assessmentsCompleted === 0 ? 'Run your first test' : 'All time'}
          />
          <KpiTile
            icon="target"
            label="Movement symmetry"
            value={metrics.symmetry ? `${metrics.symmetry.pct}% diff` : '—'}
            sub={metrics.symmetry ? `From ${metrics.symmetry.source}` : 'No data yet'}
            accent={metrics.symmetry ? (metrics.symmetry.good ? 'success' : 'warning') : 'neutral'}
          />
          <KpiTile
            icon="arm"
            label="Range of motion"
            value={metrics.rangeOfMotion ? `${metrics.rangeOfMotion.deg}°` : '—'}
            sub={metrics.rangeOfMotion ? `Best · ${metrics.rangeOfMotion.source}` : 'No data yet'}
          />
          <KpiTile
            icon="checkCircle"
            label="Movement consistency"
            value={metrics.consistency ? `${metrics.consistency.pct}%` : '—'}
            sub={metrics.consistency ? `From ${metrics.consistency.source}` : 'No data yet'}
            accent={metrics.consistency ? (metrics.consistency.pct >= 70 ? 'success' : 'warning') : 'neutral'}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Recent activity */}
        <section>
          <SectionHeader eyebrow="Timeline" title="Recent activity" className="mb-4" />
          <Card padded={false}>
            {recent.length === 0 ? (
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
              <ul className="divide-y divide-border">
                {recent.map((s) => {
                  const d = describeRecord(s);
                  return (
                    <li key={s.id} className="flex items-center gap-3.5 px-5 py-3.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          d.badgeGood ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                        }`}
                      >
                        <Icon name={d.badgeGood ? 'checkCircle' : 'alert'} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-medium text-ink">{d.typeLabel}</div>
                        <div className="text-xs text-ink-faint">
                          Completed · {formatRelativeTime(s.endedAt)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[13px] font-semibold text-ink">{d.headline}</div>
                        <div className="text-xs text-ink-faint">{d.subtitle}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        {/* Quick assessment */}
        <section>
          <SectionHeader eyebrow="Quick start" title="Run an assessment" className="mb-4" />
          <Card padded={false} className="divide-y divide-border">
            {AVAILABLE_ASSESSMENTS.slice(0, 4).map((a) => (
              <Link
                key={a.id}
                to={`/app/assessments/${a.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-surface-hover"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-inset text-ink-soft">
                  <Icon name={iconFor(a.id)} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-ink">{a.name}</div>
                  <div className="truncate text-xs text-ink-faint">{a.durationLabel}</div>
                </div>
                <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-ink-faint" />
              </Link>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}

function iconFor(id) {
  return getAssessment(id)?.id === 'facial-symmetry'
    ? 'face'
    : id === 'arm-movement'
      ? 'arm'
      : id === 'hand-assessment'
        ? 'hand'
        : id === 'sit-to-stand'
          ? 'sit'
          : 'assessments';
}

function KpiTile({ icon, label, value, sub, accent = 'neutral' }) {
  const accentClass = { neutral: 'text-ink', success: 'text-success', warning: 'text-warning' }[accent];
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-2 text-ink-faint">
        <Icon name={icon} className="h-4 w-4" />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`mt-2 font-display text-2xl font-semibold tabular ${accentClass}`}>{value}</div>
      <div className="mt-0.5 text-xs text-ink-faint">{sub}</div>
    </Card>
  );
}
