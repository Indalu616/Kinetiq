import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/icons';
import DemoVideo from '../components/ui/DemoVideo';
import ProgressSteps from '../components/ui/ProgressSteps';
import Card from '../components/ui/Card';
import { getAssessment } from '../config/assessments';
import { getAssessmentVideo } from '../config/videos';
import { STEP_LABELS } from '../config/steps';
import ArmAssessmentFlow from '../components/assessments/ArmAssessmentFlow';
import HandAssessmentFlow from '../components/assessments/HandAssessmentFlow';
import SitToStandFlow from '../components/assessments/SitToStandFlow';
import FacialAssessmentFlow from '../components/assessments/FacialAssessmentFlow';

const FLOW_COMPONENTS = {
  'arm-movement': ArmAssessmentFlow,
  'hand-assessment': HandAssessmentFlow,
  'sit-to-stand': SitToStandFlow,
  'facial-symmetry': FacialAssessmentFlow,
};

export default function AssessmentDetailPage({ onSaved }) {
  const { assessmentId } = useParams();
  const [started, setStarted] = useState(false);
  const assessment = getAssessment(assessmentId);

  if (!assessment || !assessment.available) {
    return <Navigate to="/app/assessments" replace />;
  }

  const Flow = FLOW_COMPONENTS[assessment.id];

  if (started && Flow) {
    return <Flow assessment={assessment} onExit={() => setStarted(false)} onSaved={onSaved} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/app/assessments" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
          <Icon name="arrowRight" className="h-3.5 w-3.5 rotate-180" /> Assessment library
        </Link>
      </div>

      <ProgressSteps steps={STEP_LABELS} currentIndex={0} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <DemoVideo
          src={getAssessmentVideo(assessment.videoKey)}
          label="Watch the movement"
          caption={assessment.steps[assessment.steps.length - 1]?.body}
          size="wide"
        />

        <div>
          <Badge tone={assessment.category === 'screening' ? 'info' : 'neutral'}>
            {assessment.category === 'screening' ? 'Stroke screening' : 'General assessment'}
          </Badge>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink">{assessment.name}</h1>
          <p className="mt-1 text-[14px] text-ink-soft">{assessment.tagline}</p>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{assessment.why}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <InfoTile icon="clock" label="Duration" value={assessment.durationLabel} />
            <InfoTile icon="camera" label="Equipment" value={assessment.equipment} />
            <InfoTile icon="target" label="Model" value={assessment.model} small />
          </div>

          <Button variant="primary" size="lg" className="mt-6 w-full sm:w-auto" onClick={() => setStarted(true)}>
            Start assessment <Icon name="arrowRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">What's measured</h3>
          <ul className="mt-3 space-y-2">
            {assessment.measures.map((m) => (
              <li key={m} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-soft">
                <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.4} />
                {m}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Camera positioning</h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{assessment.position}</p>
          <div className="mt-4 space-y-2.5 border-t border-border pt-4">
            {assessment.steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg-inset text-[10.5px] font-semibold text-ink-soft">
                  {i + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  <span className="font-medium text-ink">{s.title} — </span>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value, small }) {
  return (
    <div className="rounded-lg border border-border bg-bg-inset/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-ink-faint">
        <Icon name={icon} className="h-3.5 w-3.5" />
        <span className="text-[10.5px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`mt-1 font-medium text-ink ${small ? 'text-[11.5px] leading-snug' : 'text-[13px]'}`}>{value}</div>
    </div>
  );
}
