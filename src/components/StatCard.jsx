export default function StatCard({ label, value, sub, accent = 'text-ink' }) {
  return (
    <div className="rounded-xl border border-line bg-cream-soft px-4 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-ink-soft">{sub}</div> : null}
    </div>
  );
}
