// Shared formatting for saved assessment/session records (localStorage, via
// lib/storage.js). The Dashboard, History page, and Stroke Screening
// dashboard all need the same "what type is this, what's the headline
// number, is it good or attention-worthy" logic, so it lives here once
// instead of being re-derived per page.

export const TYPE_LABELS = {
  exercise: 'Shoulder Raise',
  'sit-to-stand': 'Sit-to-Stand',
  'arm-movement': 'Arm Movement',
  'hand-assessment': 'Hand Assessment',
  'facial-symmetry': 'Facial Symmetry',
};

export function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(ts) {
  const diffMs = Date.now() - ts;
  const min = Math.round(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day} days ago`;
  return formatDate(ts);
}

/**
 * Maps any saved record shape to a common
 * { typeLabel, subtitle, headline, badge, badgeGood, metrics[] } shape so
 * list views can render uniformly instead of branching per record type.
 */
export function describeRecord(s) {
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
        { label: 'Correct', value: totals.correct ?? 0, accent: 'success' },
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

  if (type === 'facial-symmetry') {
    const confident = totals.confident;
    return {
      typeLabel: TYPE_LABELS[type],
      subtitle: confident ? 'Smile-hold symmetry screen' : 'No clear smile detected',
      headline: confident ? `${totals.overallAsymmetryPct ?? 0}% difference` : 'Inconclusive',
      badge: confident ? (totals.overallAsymmetryPct <= 15 ? 'Symmetric' : 'Difference observed') : 'Retry suggested',
      badgeGood: confident ? (totals.overallAsymmetryPct ?? 100) <= 15 : false,
      metrics: [
        { label: 'Smile symmetry', value: confident ? `${totals.smileAsymmetryPct ?? 0}% diff` : '—' },
        { label: 'Eyebrow symmetry', value: confident ? `${totals.browAsymmetryPct ?? 0}% diff` : '—' },
        { label: 'Baseline (neutral)', value: totals.neutralAsymmetryPct != null ? `${totals.neutralAsymmetryPct}% diff` : '—' },
        { label: 'Read quality', value: confident ? 'Good' : 'Low' },
      ],
    };
  }

  // 'exercise' (legacy free-practice session) and any unrecognized record.
  return {
    typeLabel: TYPE_LABELS.exercise,
    subtitle: `${s.side === 'both' ? 'Both arms' : `${s.side ?? ''} arm`} · target ${s.targetAngle ?? '—'}°`,
    headline: `${totals.total ?? 0} reps`,
    badge: `${totals.formScore ?? 0}% form`,
    badgeGood: (totals.formScore ?? 0) >= 70,
    metrics: [
      { label: 'Correct', value: totals.correct ?? 0, accent: 'success' },
      { label: 'Incorrect', value: totals.incorrect ?? 0, accent: 'warning' },
      { label: 'Avg ROM', value: `${totals.avgROM ?? 0}°` },
      { label: 'Best ROM', value: `${totals.bestROM ?? 0}°` },
    ],
  };
}

/** Most recent saved record for a given assessment type, or null. */
export function latestOfType(sessions, type) {
  return sessions.find((s) => (s.type ?? 'exercise') === type) ?? null;
}

/** Count of saved records for a given assessment type. */
export function countOfType(sessions, type) {
  return sessions.filter((s) => (s.type ?? 'exercise') === type).length;
}
