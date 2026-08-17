/** Inline skeleton block — used while session history / async data is loading. */
export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function SkeletonRows({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

/**
 * Full-frame loading state for the camera stage / model warm-up — states
 * what is happening rather than a bare spinner, per the "communicate what's
 * happening" requirement.
 */
export function StageLoading({ message = 'Preparing…' }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative h-9 w-9">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-stage-accent" />
      </div>
      <p className="text-sm text-stage-fg-soft">{message}</p>
    </div>
  );
}
