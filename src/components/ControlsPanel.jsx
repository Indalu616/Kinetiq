const SIDE_OPTIONS = [
  { value: 'left', label: 'Left arm' },
  { value: 'right', label: 'Right arm' },
  { value: 'both', label: 'Both arms' },
];

export default function ControlsPanel({
  running,
  canStart,
  onStart,
  onStop,
  onReset,
  side,
  onSideChange,
  targetAngle,
  onTargetAngleChange,
  audioFeedback,
  onAudioFeedbackChange,
  speechSupported = true,
  onTestVoice,
  devices,
  deviceId,
  onDeviceChange,
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-line bg-panel p-5">
      <div>
        <h2 className="font-serif text-[15px] text-ink">Session controls</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {!running ? (
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart}
              className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream-soft transition hover:bg-forest-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint"
            >
              Start session
            </button>
          ) : (
            <button
              type="button"
              onClick={onStop}
              className="rounded-full bg-rust px-4 py-2 text-sm font-medium text-cream-soft transition hover:opacity-90"
            >
              End session
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            disabled={!running}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset reps
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Track</h3>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-full border border-line bg-cream-soft p-1">
          {SIDE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSideChange(opt.value)}
              className={`rounded-full px-2 py-1.5 text-xs font-medium transition ${
                side === opt.value ? 'bg-forest text-cream-soft' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Target raise angle</h3>
          <span className="text-xs font-semibold text-forest">{targetAngle}°</span>
        </div>
        <input
          type="range"
          min={45}
          max={170}
          step={5}
          value={targetAngle}
          onChange={(e) => onTargetAngleChange(Number(e.target.value))}
          className="mt-2 w-full accent-forest"
        />
        <p className="mt-1 text-[11px] text-ink-faint">
          Peak shoulder-abduction angle a rep must reach to be scored "good".
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Voice feedback</h3>
            <p className="text-[11px] text-ink-faint">
              {speechSupported ? 'Speaks form cues after each rep.' : "Not supported in this browser."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAudioFeedbackChange(!audioFeedback)}
            disabled={!speechSupported}
            aria-label="Toggle voice feedback"
            className={`h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${
              audioFeedback ? 'bg-forest' : 'bg-line'
            }`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 transform rounded-full bg-white shadow-sm transition ${
                audioFeedback ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {speechSupported && (
          <button
            type="button"
            onClick={onTestVoice}
            className="mt-2 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
          >
            Test voice
          </button>
        )}
      </div>

      {devices?.length > 1 && (
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Camera</h3>
          <select
            value={deviceId ?? ''}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-cream-soft px-3 py-2 text-xs text-ink"
          >
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
