// Generic version of the Phase-1 FeedbackToast — same CSS-driven fade
// pattern (remounting on `event.key` restarts the animation), but takes a
// plain message/tone instead of a rep object, so any assessment can use it.
export default function TestToast({ event }) {
  if (!event) return null;
  const good = event.tone !== 'warn';

  return (
    <div
      key={event.key}
      className={`animate-toast-fade pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 transform rounded-full border px-5 py-2 text-sm font-medium shadow-lg backdrop-blur ${
        good ? 'border-forest/30 bg-forest-soft/95 text-forest' : 'border-amber/30 bg-amber-soft/95 text-amber'
      }`}
    >
      {good ? '✓' : '!'} {event.message}
    </div>
  );
}
