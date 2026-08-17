import Icon from '../ui/icons';

// Purely CSS-driven toast: remounting the element on each new event (via the
// `key`) restarts the fade animation, so no timers or extra render state are
// needed to show/hide it. Shared by every assessment flow (rep feedback,
// tap feedback, etc.) instead of each one rolling its own.
export default function AssessmentToast({ event }) {
  if (!event) return null;
  const good = event.tone !== 'warn';

  return (
    <div
      key={event.key}
      className={`animate-toast-fade pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 transform rounded-full border px-4 py-2 text-[13px] font-medium shadow-lg backdrop-blur ${
        good ? 'border-success/30 bg-success-soft/95 text-success' : 'border-warning/30 bg-warning-soft/95 text-warning'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        <Icon name={good ? 'checkCircle' : 'alert'} className="h-3.5 w-3.5" strokeWidth={2.2} />
        {event.message}
      </span>
    </div>
  );
}
