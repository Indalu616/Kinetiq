import Icon from './icons';

/**
 * Horizontal step indicator shared by every assessment flow:
 * Preparation → Calibration → Assessment → Results. Keeps the user oriented
 * ("what do I need to do right now?") across all four camera-based tests.
 */
export default function ProgressSteps({ steps, currentIndex, className = '' }) {
  return (
    <ol className={`flex items-center gap-1 sm:gap-2 ${className}`} aria-label="Assessment progress">
      {steps.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
        return (
          <li key={step} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-current={state === 'current' ? 'step' : undefined}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                  state === 'done'
                    ? 'bg-primary text-white'
                    : state === 'current'
                      ? 'bg-primary-soft text-primary ring-2 ring-primary/30'
                      : 'bg-bg-inset text-ink-faint'
                }`}
              >
                {state === 'done' ? <Icon name="check" className="h-3 w-3" strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={`hidden text-[13px] font-medium sm:inline ${
                  state === 'upcoming' ? 'text-ink-faint' : 'text-ink'
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={`h-px flex-1 ${state === 'done' ? 'bg-primary/40' : 'bg-border'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
