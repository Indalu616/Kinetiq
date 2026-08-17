import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Disclaimer from '../components/ui/Disclaimer';
import Icon from '../components/ui/icons';
import { computeOverviewMetrics } from '../lib/dashboardMetrics';
import { describeRecord, formatRelativeTime } from '../lib/recordFormat';
import { getAssessment } from '../config/assessments';

const GROUP_ICON = { face: 'face', arms: 'arm', hands: 'hand' };

const STATUS_META = {
  'not-assessed': { label: 'Not assessed', tone: 'neutral', icon: undefined },
  completed: { label: 'Completed', tone: 'neutral', icon: 'check' },
};

export default function ScreeningPage({ sessions }) {
  const metrics = computeOverviewMetrics(sessions);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Early-sign screening"
        title="Stroke Screening"
        description="A structured, camera-based screen across face, arm and hand movement — modeled loosely on the F and A of the FAST protocol. This is a screening aid, not a diagnostic device."
      />

      <Disclaimer variant="screening" />

      {/* Overall */}
      <Card className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              metrics.screeningCompletedCount === 3 ? 'bg-success-soft text-success' : 'bg-bg-inset text-ink-faint'
            }`}
          >
            <Icon name="shield" className="h-6 w-6" />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Overall screening status</div>
            <div className="mt-0.5 font-display text-lg font-semibold text-ink">{metrics.screeningStatus}</div>
            <div className="mt-0.5 text-[13px] text-ink-soft">{metrics.screeningCompletedCount} of 3 groups completed</div>
          </div>
        </div>
        <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(metrics.screeningCompletedCount / 3) * 100}%` }}
          />
        </div>
      </Card>

      {/* Groups */}
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.screeningGroups.map((g) => {
          const meta = STATUS_META[g.status];
          const assessment = getAssessment(g.assessmentId);
          const d = g.record ? describeRecord(g.record) : null;
          return (
            <Card key={g.key} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-inset text-ink-soft">
                  <Icon name={GROUP_ICON[g.key]} className="h-5 w-5" />
                </span>
                <Badge tone={meta.tone} icon={meta.icon}>{meta.label}</Badge>
              </div>
              <h3 className="mt-3.5 font-display text-[16px] font-semibold text-ink">{g.label}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{assessment?.why}</p>

              {d ? (
                <div className="mt-4 rounded-lg border border-border bg-bg-inset/50 p-3">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-ink-soft">Last result</span>
                    <span className={`font-semibold ${d.badgeGood ? 'text-success' : 'text-warning'}`}>{d.headline}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-faint">{formatRelativeTime(g.record.endedAt)}</div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border px-3 py-3 text-center text-[12px] text-ink-faint">
                  No screening run yet
                </div>
              )}

              <Button as={Link} to={`/app/assessments/${g.assessmentId}`} variant={g.record ? 'secondary' : 'primary'} size="sm" className="mt-4 w-full">
                {g.record ? 'Run again' : 'Start screening'}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="bg-bg-inset/40">
        <div className="flex items-start gap-3">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            This screen covers the <strong className="text-ink">F</strong>ace and <strong className="text-ink">A</strong>rm signs
            from the FAST stroke-recognition protocol, plus a hand-movement check. It does not evaluate{' '}
            <strong className="text-ink">S</strong>peech, and there is no substitute for the <strong className="text-ink">T</strong>
            ime-critical step of calling emergency services for sudden, severe symptoms.
          </p>
        </div>
      </Card>
    </div>
  );
}
