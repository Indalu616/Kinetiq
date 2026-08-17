// Purely CSS-driven toast: remounting the element on each new event (via the
// `key`) restarts the fade animation, so no timers or extra render state are
// needed to show/hide it.
export default function FeedbackToast({ event }) {
  if (!event) return null;

  const { rep, side } = event;
  const good = rep.correct;

  return (
    <div
      key={event.key}
      className={`animate-toast-fade pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 transform rounded-full border px-5 py-2 text-sm font-medium shadow-lg backdrop-blur ${
        good ? 'border-forest/30 bg-forest-soft/95 text-forest' : 'border-amber/30 bg-amber-soft/95 text-amber'
      }`}
    >
      {good ? '✓' : '!'} {side === 'left' ? 'Left' : 'Right'} arm — {rep.note} · {rep.romMax}°
    </div>
  );
}
