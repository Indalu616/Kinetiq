const ACCENTS = {
  neutral: 'text-ink',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/**
 * The one numeric-tile primitive used everywhere a single measurement needs
 * a label + value (+ optional trend/sub line). Dashboard KPIs, assessment
 * results, and live in-session readouts all render through this so the same
 * number never looks different in two places.
 */
export default function MetricCard({ label, value, sub, accent = 'neutral', icon, size = 'md', className = '' }) {
  const valueSize = size === 'lg' ? 'text-[28px]' : size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div className={`rounded-lg border border-border bg-bg-inset/60 px-4 py-3.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        {icon}
        {label}
      </div>
      <div className={`mt-1 font-display tabular ${valueSize} font-semibold ${ACCENTS[accent]}`}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-ink-soft">{sub}</div> : null}
    </div>
  );
}
