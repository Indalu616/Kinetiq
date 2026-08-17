import Icon from './icons';

/**
 * The one place the app's non-diagnostic screening language lives. Every
 * screen that shows a screening/assessment result renders this instead of
 * writing its own disclaimer copy, so the wording never drifts.
 */
export default function Disclaimer({ variant = 'default', className = '' }) {
  const text =
    variant === 'screening'
      ? 'This is a screening tool, not a medical diagnosis. If you notice sudden facial drooping, arm weakness, or slurred speech, seek emergency medical care immediately.'
      : 'This result is intended for screening and progress-tracking purposes only, and should not be considered a medical diagnosis. Speak with a healthcare professional about any concerning symptoms.';

  return (
    <div className={`flex items-start gap-2.5 rounded-lg border border-warning/20 bg-warning-soft/60 px-3.5 py-3 ${className}`}>
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <p className="text-[12.5px] leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}
