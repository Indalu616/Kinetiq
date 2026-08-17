import { latestOfType, countOfType } from './recordFormat';
import { SCREENING_GROUPS, getAssessment } from '../config/assessments';

const ASSESSMENT_TYPES = ['sit-to-stand', 'arm-movement', 'hand-assessment', 'facial-symmetry'];

/**
 * Derives the Overview page's KPI tiles and the Stroke Screening dashboard's
 * per-group status entirely from real saved records (lib/storage.js) — no
 * invented numbers. A metric with no supporting record renders as an empty
 * state rather than a placeholder value.
 */
export function computeOverviewMetrics(sessions) {
  const assessmentsCompleted = ASSESSMENT_TYPES.reduce((sum, t) => sum + countOfType(sessions, t), 0);
  const latest = sessions[0] ?? null;

  const latestArm = latestOfType(sessions, 'arm-movement');
  const latestHand = latestOfType(sessions, 'hand-assessment');
  const latestSts = latestOfType(sessions, 'sit-to-stand');
  const latestFace = latestOfType(sessions, 'facial-symmetry');

  const symmetry = latestArm
    ? { pct: latestArm.totals.asymmetryPct, good: latestArm.totals.asymmetryPct <= 15, source: 'Arm Movement' }
    : latestFace?.totals?.confident
      ? { pct: latestFace.totals.overallAsymmetryPct, good: latestFace.totals.overallAsymmetryPct <= 15, source: 'Facial Symmetry' }
      : null;

  const rangeOfMotion = latestArm
    ? { deg: Math.max(latestArm.left?.bestROM ?? 0, latestArm.right?.bestROM ?? 0), source: 'Arm Movement' }
    : null;

  const consistency = latestSts
    ? { pct: latestSts.totals.formScore, source: 'Sit-to-Stand' }
    : latestHand
      ? { pct: Math.round(((latestHand.left?.ratePerSec ?? 0) > 0 && (latestHand.right?.ratePerSec ?? 0) > 0
          ? 100 - Math.min(100, Math.abs((latestHand.left.ratePerSec - latestHand.right.ratePerSec) / Math.max(latestHand.left.ratePerSec, latestHand.right.ratePerSec)) * 100)
          : 0)), source: 'Hand Assessment' }
      : null;

  const screeningGroups = SCREENING_GROUPS.map((g) => {
    const record = latestOfType(sessions, g.assessmentId);
    return {
      ...g,
      status: record ? 'completed' : 'not-assessed',
      record,
    };
  });
  const screeningCompletedCount = screeningGroups.filter((g) => g.status === 'completed').length;
  const screeningStatus =
    screeningCompletedCount === 0 ? 'Not started' : screeningCompletedCount === screeningGroups.length ? 'Completed' : 'In progress';

  return {
    assessmentsCompleted,
    latest,
    latestAssessmentName: latest ? getAssessment(latest.type)?.name ?? latest.label : null,
    symmetry,
    rangeOfMotion,
    consistency,
    screeningGroups,
    screeningStatus,
    screeningCompletedCount,
  };
}
