import Icon from './icons';

const TONES = {
  neutral: 'border-border bg-bg-inset text-ink-soft',
  primary: 'border-primary/20 bg-primary-soft text-primary',
  success: 'border-success/25 bg-success-soft text-success',
  warning: 'border-warning/25 bg-warning-soft text-warning',
  danger: 'border-danger/25 bg-danger-soft text-danger',
  info: 'border-info/20 bg-info-soft text-info',
};

/** Small status pill — used for "Available", "Symmetric", "Attention", record types, etc. */
export default function Badge({ tone = 'neutral', icon, dot = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {icon && <Icon name={icon} className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
      {children}
    </span>
  );
}
