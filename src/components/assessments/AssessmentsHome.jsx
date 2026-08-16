import MovementDemo from '../demo/MovementDemo';

const TESTS = [
  {
    id: 'sit-to-stand',
    order: 1,
    name: 'Sit-to-Stand',
    measures: 'Repetitions, time taken, movement consistency, approximate knee extension, postural sway',
    tech: 'MediaPipe Pose Landmarker — same pipeline as the shoulder-raise coach, pointed at the knee',
    available: true,
    note: 'Needs your hips, knees and ankles in frame — step back or lower the camera.',
    demo: 'sit-to-stand',
  },
  {
    id: 'arm-movement',
    order: 2,
    name: 'Arm Movement',
    measures: 'Maximum elevation, range of motion, movement speed, left/right difference',
    tech: 'MediaPipe Pose Landmarker — runs the Phase-1 shoulder pipeline once per arm, then compares sides',
    available: true,
    note: 'Runs left arm, then right arm, back to back — keep both shoulders visible.',
    demo: 'shoulder-raise',
  },
  {
    id: 'hand-assessment',
    order: 3,
    name: 'Hand Assessment',
    measures: 'Finger-tapping speed, pinch amplitude, left/right hand difference',
    tech: 'MediaPipe Hand Landmarker (21 keypoints/hand)',
    available: true,
    note: 'Hold your hand(s) 30–50cm from the camera and tap thumb to index finger repeatedly.',
    demo: 'hand-tap',
  },
  {
    id: 'walking-gait',
    order: 4,
    name: 'Walking / Gait',
    measures: 'Step count, walking speed, step symmetry, stride length, gait stability',
    tech: 'Optical-flow or landmark-trajectory analysis across frames; a tripod / fixed side-on camera',
    available: false,
    note: 'Needs a side-on, multi-frame camera setup rather than a single stationary desk camera — flagged in the spec as optional/stretch and the least camera-friendly test.',
    demo: 'gait',
  },
];

export default function AssessmentsHome({ onSelect }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs font-medium text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-forest" />
          Same landmark → angle pipeline as the shoulder-raise coach
        </span>
        <h1 className="mt-5 font-serif text-[2.1rem] leading-[1.15] tracking-tight text-ink sm:text-[2.4rem]">
          Motor <em className="text-forest">assessment</em> module
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          Standardized clinical-style tests built one at a time on top of the same detection engine. Pick a test
          below to run it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TESTS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => t.available && onSelect(t.id)}
            disabled={!t.available}
            className={`group flex flex-col rounded-2xl border border-line bg-panel p-5 text-left transition ${
              t.available ? 'hover:border-forest/40 hover:shadow-sm cursor-pointer' : 'cursor-not-allowed opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-soft text-[11px] font-semibold text-ink-soft">
                  {t.order}
                </span>
                <h2 className="font-serif text-lg text-ink">{t.name}</h2>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  t.available
                    ? 'border-forest/30 bg-forest-soft text-forest'
                    : 'border-line bg-cream-soft text-ink-faint'
                }`}
              >
                {t.available ? 'Available' : 'Coming soon'}
              </span>
            </div>

            <div className="mt-3 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-relaxed text-ink-soft">{t.measures}</p>
                <p className="mt-2 text-[11px] text-ink-faint">{t.tech}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-amber">{t.note}</p>

                {t.available && (
                  <span className="mt-4 inline-block text-xs font-medium text-forest transition group-hover:underline">
                    Run this test →
                  </span>
                )}
              </div>
              <MovementDemo type={t.demo} size="sm" showCaption={false} className="shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
