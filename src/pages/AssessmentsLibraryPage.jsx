import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/icons';
import { ASSESSMENTS } from '../config/assessments';

const ICON = {
  'facial-symmetry': 'face',
  'arm-movement': 'arm',
  'hand-assessment': 'hand',
  'sit-to-stand': 'sit',
  'walking-gait': 'gait',
};

export default function AssessmentsLibraryPage() {
  const screening = ASSESSMENTS.filter((a) => a.category === 'screening');
  const general = ASSESSMENTS.filter((a) => a.category !== 'screening');

  return (
    <div className="space-y-9">
      <SectionHeader
        eyebrow="Assessment library"
        title="Choose an assessment"
        description="Every assessment tells you what's measured, why it matters, and what to expect before you start — then runs entirely on your device."
      />

      <section>
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Stroke early-sign screening</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {screening.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">General movement assessments</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {general.map((a) => (
            <AssessmentCard key={a.id} assessment={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AssessmentCard({ assessment: a }) {
  const content = (
    <Card
      className={`group flex h-full flex-col transition ${a.available ? 'hover:border-primary/40 hover:shadow-sm' : 'opacity-70'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-inset text-ink-soft">
          <Icon name={ICON[a.id] ?? 'assessments'} className="h-5 w-5" />
        </span>
        {!a.available && <Badge tone="neutral">Coming soon</Badge>}
      </div>

      <h3 className="mt-3.5 font-display text-[16px] font-semibold text-ink">{a.name}</h3>
      <p className="mt-0.5 text-[12.5px] text-ink-faint">{a.tagline}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{a.summary}</p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-ink-faint">
        <span className="inline-flex items-center gap-1">
          <Icon name="clock" className="h-3.5 w-3.5" /> {a.durationLabel}
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="camera" className="h-3.5 w-3.5" /> {a.equipment}
        </span>
      </div>

      <div className="mt-auto pt-4">
        {a.available ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-primary transition group-hover:gap-1.5">
            View assessment <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="text-[12.5px] text-ink-faint">{a.comingSoonNote}</span>
        )}
      </div>
    </Card>
  );

  if (!a.available) return <div>{content}</div>;
  return (
    <Link to={`/app/assessments/${a.id}`} className="block h-full">
      {content}
    </Link>
  );
}
