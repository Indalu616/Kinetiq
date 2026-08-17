import Icon from './icons';

/**
 * Thoughtful empty state — every list/section in the app that can be empty
 * routes through this instead of a bare "No data found." string.
 */
export default function EmptyState({ icon = 'assessments', title, body, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center rounded-xl border border-dashed border-border bg-bg-inset/40 px-6 py-12 text-center ${className}`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink-faint ring-1 ring-border">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
      {body && <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
