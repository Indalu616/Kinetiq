export default function SectionHeader({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>}
        <h2 className="mt-1 font-display text-[22px] font-semibold leading-tight text-ink">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
