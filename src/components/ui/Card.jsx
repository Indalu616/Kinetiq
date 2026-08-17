export default function Card({ as: Comp = 'div', padded = true, className = '', children, ...props }) {
  return (
    <Comp
      className={`rounded-xl border border-border bg-surface ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{eyebrow}</p>}
        {title && <h3 className="mt-0.5 font-display text-[17px] font-semibold text-ink">{title}</h3>}
        {description && <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
