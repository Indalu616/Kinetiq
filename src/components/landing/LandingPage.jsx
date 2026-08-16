// Kinetiq marketing / landing page — shown before the user launches the app
// itself. Built as one page with a handful of local section components
// (nav, hero, trust bar, feature grid, how-it-works, assessment spotlight,
// tech stack, privacy note, CTA banner, footer) rather than many tiny files,
// since every section is used exactly once and lives only here.

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#assessments', label: 'Assessments' },
  { href: '#privacy', label: 'Privacy' },
];

const FEATURES = [
  {
    title: 'Real-time pose detection',
    body: "MediaPipe's Pose Landmarker tracks 33 body keypoints per frame, GPU-accelerated with an automatic CPU fallback so it keeps working even without WebGL.",
    icon: 'target',
  },
  {
    title: 'Hysteresis rep-counting engine',
    body: 'A custom enter/exit-threshold state machine turns noisy joint angles into clean, jitter-proof rep counts — the same engine powers every exercise and assessment.',
    icon: 'pulse',
  },
  {
    title: 'Live voice coaching',
    body: 'Spoken feedback via the Web Speech API tells you to raise higher, straighten your arm, or stand fully — without ever taking your eyes off the screen.',
    icon: 'wave',
  },
  {
    title: 'Motor assessment suite',
    body: 'Four standardized-style clinical tests — sit-to-stand, arm movement, hand tapping, and gait — built on the same landmark-to-angle pipeline.',
    icon: 'grid',
  },
  {
    title: 'Local history & export',
    body: 'Every session is saved to your browser only. Review trends over time, or export any record as JSON or CSV whenever you want your data out.',
    icon: 'history',
  },
  {
    title: 'Considered, accessible UI',
    body: 'A token-based design system with real light and dark themes, built for readability first — not another dark-mode gradient dashboard.',
    icon: 'sun',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Position your camera',
    body: 'Stand back so the joints the test needs are in frame — shoulders and elbows for exercises, or hips, knees and ankles for sit-to-stand.',
  },
  {
    n: '2',
    title: 'Move naturally',
    body: 'Kinetiq tracks your landmarks and recomputes joint angles on every video frame, entirely inside your browser tab.',
  },
  {
    n: '3',
    title: 'Get instant feedback',
    body: 'Reps are counted, form is scored against a target range, and you hear it out loud — all computed and stored locally, nothing uploaded.',
  },
];

const ASSESSMENTS = [
  {
    order: 1,
    name: 'Sit-to-Stand',
    measures: 'Reps, timing, knee extension, postural sway',
    available: true,
  },
  {
    order: 2,
    name: 'Arm Movement',
    measures: 'Range of motion, speed, left/right asymmetry',
    available: true,
  },
  {
    order: 3,
    name: 'Hand Assessment',
    measures: 'Finger-tap rate, pinch amplitude, hand asymmetry',
    available: true,
  },
  {
    order: 4,
    name: 'Walking / Gait',
    measures: 'Step count, symmetry, stride, stability',
    available: false,
  },
];

const TECH = [
  ['React 19', 'Component architecture, RAF-driven render loop'],
  ['MediaPipe Tasks Vision', 'On-device Pose & Hand Landmarker models, WASM runtime'],
  ['Tailwind CSS v4', 'CSS-first token theme, runtime light/dark toggle'],
  ['Web Speech API', 'Synthesized voice coaching, no network round-trip'],
  ['Vite', 'Sub-second dev server, hashed production build'],
  ['LocalStorage', 'Session history and export — zero backend, zero database'],
];

const STATS = [
  ['33', 'pose landmarks / frame'],
  ['21', 'hand keypoints / hand'],
  ['4', 'assessment modes'],
  ['0', 'servers — fully on-device'],
];

function Icon({ name, className = 'h-5 w-5' }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'target':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case 'pulse':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M2 12h4l2.5-7L13 19l2.5-7H22" />
        </svg>
      );
    case 'wave':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 12c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0 3 3 4.5 0" />
        </svg>
      );
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
        </svg>
      );
    case 'history':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v4h4" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
}

function HeroIllustration() {
  // Abstract pose-skeleton + angle-measurement graphic — deliberately drawn
  // rather than a fake product screenshot, echoing the AngleGauge / skeleton
  // overlay visual language used inside the live app.
  return (
    <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[28px] border border-line bg-stage shadow-[0_1px_2px_rgba(0,0,0,0.08)] sm:max-w-none">
      <svg viewBox="0 0 320 400" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="heroGlow" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#2c5a45" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#17140f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="400" fill="url(#heroGlow)" />

        {/* joint-connection skeleton */}
        <g stroke="rgba(241,236,221,0.35)" strokeWidth="3" strokeLinecap="round">
          <path d="M160 70v70M160 140l-45 30M160 140l45 30M118 250l42-40 42 40M138 250l-8 80M182 250l8 80" fill="none" />
        </g>
        {/* raised arm highlighted in gold, matching AngleGauge accent */}
        <path d="M160 140l45 30" stroke="#d9a441" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <g fill="#f1ecdd">
          <circle cx="160" cy="55" r="16" />
          <circle cx="160" cy="140" r="5" />
          <circle cx="115" cy="170" r="5" />
          <circle cx="205" cy="170" r="5" />
          <circle cx="118" cy="250" r="5" />
          <circle cx="202" cy="250" r="5" />
          <circle cx="160" cy="250" r="5" />
          <circle cx="130" cy="330" r="5" />
          <circle cx="190" cy="330" r="5" />
        </g>
        {/* angle arc + readout, echoing the live AngleGauge */}
        <g transform="translate(205 170)">
          <path d="M0 0 A 32 32 0 0 1 -18 -27" stroke="#d9a441" strokeWidth="2.5" fill="none" />
          <text x="10" y="-6" fill="#d9a441" fontSize="13" fontFamily="Inter, sans-serif" fontWeight="600">
            97°
          </text>
        </g>

        <g transform="translate(24 24)" fill="none" stroke="rgba(241,236,221,0.5)" strokeWidth="1.6">
          <rect x="0" y="0" width="272" height="352" rx="18" />
        </g>
      </svg>

      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-medium text-stage-fg/85 backdrop-blur">
        Rep 4 · good form
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-[11px] leading-relaxed text-stage-fg/70 backdrop-blur">
        33 landmarks tracked live, entirely on-device — nothing shown here ever leaves your browser.
      </div>
    </div>
  );
}

function NavBar({ theme, onToggleTheme, onLaunch }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-cream-soft">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="2.3" />
              <path strokeLinecap="round" d="M12 7.5v5.5M8 9.5l-3 1.5M16 9.5l3 1.5M9 22l3-6.5L15 22M9 15.5h6" />
            </svg>
          </span>
          <span className="font-serif text-[17px] font-medium text-ink">Kinetiq</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream-soft hover:text-ink"
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4.5" />
                <path
                  strokeLinecap="round"
                  d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.7 14.9A8.6 8.6 0 1 1 9.1 3.3a7 7 0 1 0 11.6 11.6Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => onLaunch('live')}
            className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream-soft transition hover:bg-forest-strong"
          >
            Launch app
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onLaunch }) {
  return (
    <section id="top" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-16 pt-14 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            Runs 100% on-device — powered by MediaPipe
          </span>
          <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.12] tracking-tight text-ink sm:text-[3.2rem]">
            Movement intelligence, <em className="text-forest">right in your browser.</em>
          </h1>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-soft">
            Kinetiq turns any webcam into a real-time movement lab — tracking 33 body landmarks on-device to count
            reps, score form, and run clinical-style motor assessments. No uploads, no accounts, no servers.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onLaunch('live')}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream-soft shadow-sm transition hover:bg-forest-strong"
            >
              Launch Kinetiq →
            </button>
            <a
              href="#how-it-works"
              className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6">
            {STATS.map(([value, label]) => (
              <div key={label}>
                <div className="font-serif text-2xl text-ink">{value}</div>
                <div className="text-xs text-ink-faint">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    'On-device pose detection',
    'No sign-up required',
    'No video ever uploaded',
    'Works in any modern browser',
    'Free & open',
  ];
  return (
    <section className="border-y border-line/70 bg-panel/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-5 text-xs font-medium text-ink-soft">
        {items.map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-forest" />
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-[2rem] leading-tight text-ink sm:text-[2.3rem]">
          Everything you'd expect from a <em className="text-forest">production</em> movement app
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Not a tech demo bolted onto a slideshow — a real interaction loop, a rep-counting engine with real edge
          cases handled, and a UI built to be lived in.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-panel p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-soft text-forest">
              <Icon name={f.icon} />
            </span>
            <h3 className="mt-4 font-serif text-lg text-ink">{f.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line/70 bg-panel/60">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-[2rem] leading-tight text-ink sm:text-[2.3rem]">
            Three steps. <em className="text-forest">Zero setup.</em>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            No install, no camera calibration wizard, no account to create — open a tab and start moving.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-cream-soft p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-sm font-semibold text-cream-soft">
                {s.n}
              </span>
              <h3 className="mt-4 font-serif text-[17px] text-ink">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AssessmentsSpotlight({ onLaunch }) {
  return (
    <section id="assessments" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            Motor assessment module
          </span>
          <h2 className="mt-5 font-serif text-[2rem] leading-tight text-ink sm:text-[2.3rem]">
            Standardized-style tests, <em className="text-forest">built on the same engine.</em>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            The same landmark → angle → rep pipeline that powers the shoulder-raise coach is generalized across four
            clinical-style movement tests, each with its own scoring model.
          </p>
          <button
            type="button"
            onClick={() => onLaunch('assessments')}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest transition hover:underline"
          >
            Explore the assessment suite →
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ASSESSMENTS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-soft text-[11px] font-semibold text-ink-soft">
                    {t.order}
                  </span>
                  <h3 className="font-serif text-[15px] text-ink">{t.name}</h3>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    t.available ? 'border-forest/30 bg-forest-soft text-forest' : 'border-line bg-cream-soft text-ink-faint'
                  }`}
                >
                  {t.available ? 'Available' : 'Soon'}
                </span>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-soft">{t.measures}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="border-y border-line/70 bg-panel/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="font-serif text-[2rem] leading-tight text-ink sm:text-[2.3rem]">
              Under the <em className="text-forest">hood.</em>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
              Kinetiq is a real single-page app, not a wrapper around a cloud API: pose inference runs as WebAssembly
              in a Web Worker-friendly pipeline, rep detection is a hand-rolled hysteresis state machine, and the
              whole UI is a token-driven design system that re-themes at runtime.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {TECH.map(([name, desc]) => (
              <div key={name} className="rounded-xl border border-line bg-cream-soft p-4">
                <div className="text-sm font-semibold text-ink">{name}</div>
                <div className="mt-1 text-[12px] leading-relaxed text-ink-soft">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section id="privacy" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="overflow-hidden rounded-[28px] border border-line bg-stage px-8 py-12 text-stage-fg sm:px-14">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-stage-accent">
            <Icon name="shield" className="h-7 w-7" />
          </span>
          <div>
            <h2 className="font-serif text-[1.9rem] leading-tight text-stage-fg sm:text-[2.1rem]">
              Your camera feed never leaves your device.
            </h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-stage-fg/70">
              Every frame is processed locally in your browser using WebAssembly — video is never streamed,
              recorded, or uploaded anywhere. Session history lives in your browser's local storage only, and you
              can export or delete it at any time. There's no account, no tracking pixel, and no server that could
              be breached, because there is no server in the loop at all.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABanner({ onLaunch }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="rounded-[28px] bg-forest px-8 py-14 text-center sm:px-14">
        <h2 className="font-serif text-[2rem] leading-tight text-cream-soft sm:text-[2.4rem]">
          Try Kinetiq now — <em>no installation, no sign-up.</em>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-cream-soft/75">
          Open the app, allow camera access, and you're tracking your first rep in under a minute.
        </p>
        <button
          type="button"
          onClick={() => onLaunch('live')}
          className="mt-7 rounded-full bg-cream-soft px-6 py-3 text-sm font-medium text-forest-strong shadow-sm transition hover:bg-white"
        >
          Launch Kinetiq →
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-cream-soft">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="2.3" />
                  <path strokeLinecap="round" d="M12 7.5v5.5M8 9.5l-3 1.5M16 9.5l3 1.5M9 22l3-6.5L15 22M9 15.5h6" />
                </svg>
              </span>
              <span className="font-serif text-[15px] font-medium text-ink">Kinetiq</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-soft">
              Real-time, on-device movement intelligence — rep counting, form scoring, and clinical-style motor
              assessments, built with MediaPipe and React.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Product</h4>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">About</h4>
            <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-ink-faint">
              Kinetiq is a technology demonstration built to showcase real-time computer vision in the browser. It is
              not a certified medical device and does not diagnose or treat any condition.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Kinetiq. All pose detection runs locally in your browser.</span>
          <span>Built with React, Tailwind CSS, and MediaPipe.</span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ onLaunch, theme, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <NavBar theme={theme} onToggleTheme={onToggleTheme} onLaunch={onLaunch} />
      <Hero onLaunch={onLaunch} />
      <TrustBar />
      <Features />
      <HowItWorks />
      <AssessmentsSpotlight onLaunch={onLaunch} />
      <TechStack />
      <PrivacySection />
      <CTABanner onLaunch={onLaunch} />
      <Footer />
    </div>
  );
}
