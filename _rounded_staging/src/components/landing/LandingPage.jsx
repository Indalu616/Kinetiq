// Kinetiq marketing / landing page — shown at the root URL, before entering
// the clinical app shell at /app. Restyled onto the new clinical-SaaS design
// system (no serif display face, no pill buttons, a single restrained blue
// accent) and updated to lead with the platform's actual scope: structured
// movement assessments plus early-sign stroke screening — not just a rep
// counter.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/icons';
import Button from '../ui/Button';
import { ASSESSMENT_VIDEOS } from '../../config/videos';

const NAV_LINKS = [
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#screening', label: 'Stroke screening' },
  { href: '#privacy', label: 'Privacy' },
];

const CAPABILITIES = [
  {
    title: 'Structured assessment library',
    body: 'Four camera-based movement assessments — facial symmetry, arm movement, hand tapping, and sit-to-stand — each with clear instructions, positioning guidance and a demonstration clip before you start.',
    icon: 'assessments',
  },
  {
    title: 'Early-sign stroke screening',
    body: 'A dedicated screening dashboard covering the face and arm signs from the FAST protocol, plus a hand-movement check — framed as a screening aid, never a diagnosis.',
    icon: 'screening',
  },
  {
    title: 'On-device computer vision',
    body: "MediaPipe's Pose, Hand and Face Landmarker models run entirely in your browser via WebAssembly — GPU-accelerated with an automatic CPU fallback.",
    icon: 'target',
  },
  {
    title: 'Left/right symmetry comparison',
    body: 'Every assessment measures both sides and reports the difference directly — the signal clinicians actually look for — instead of a single opaque score.',
    icon: 'checkCircle',
  },
  {
    title: 'Local history & export',
    body: 'Every result is saved to your browser only. Review trends over time, or export any record as JSON or CSV whenever you want your data out.',
    icon: 'history',
  },
  {
    title: 'A real light & dark theme',
    body: 'A token-based design system with genuine light and dark themes, built for clinical readability — not a dashboard template with the colors inverted.',
    icon: 'sun',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Choose an assessment',
    body: 'Each one explains what it measures, why it matters, how long it takes, and shows a short demonstration clip.',
  },
  {
    n: '2',
    title: 'Position & calibrate',
    body: 'A guided camera step confirms you\'re positioned correctly before any measurement window starts.',
  },
  {
    n: '3',
    title: 'Get a symmetry-first result',
    body: 'Reps, timing and left/right differences are computed live and summarized in plain language — all on-device.',
  },
];

const SCREENING_ITEMS = [
  { order: 1, name: 'Facial Symmetry', measures: 'Smile & eyebrow symmetry, facial movement difference' },
  { order: 2, name: 'Arm Movement', measures: 'Range of motion, speed, left/right asymmetry' },
  { order: 3, name: 'Hand Assessment', measures: 'Finger-tap rate, amplitude, hand asymmetry' },
  { order: 4, name: 'Sit-to-Stand', measures: 'Reps, timing, knee extension, postural sway' },
];

const STATS = [
  ['5', 'camera-based assessments'],
  ['3', 'MediaPipe landmark models'],
  ['0', 'servers — fully on-device'],
  ['0', 'diagnoses claimed'],
];

function HeroVisual() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-none">
      {/* Soft glowing backdrop — a single deliberate accent, not a repeated pattern. */}
      <div
        aria-hidden="true"
        className="absolute -inset-10 -z-10 rounded-full opacity-70 blur-3xl"
        style={{
          background: 'radial-gradient(closest-side, var(--color-primary) 0%, transparent 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-8 -left-6 -z-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--color-primary)' }}
      />

      <div className="relative aspect-[14/15] w-full overflow-hidden rounded-[28px] border border-border bg-stage shadow-lg">
        {!failed ? (
          <video
            className="absolute inset-0 h-full w-full object-contain"
            src={ASSESSMENT_VIDEOS['facial-symmetry']}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Live demonstration of Kinetiq's facial symmetry screening"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <Icon name="video" className="h-6 w-6 text-stage-fg-soft" />
            <p className="text-xs text-stage-fg-soft">Demonstration unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NavBar({ theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Icon name="arm" className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-script text-[24px] leading-none text-ink">Kinetiq</span>
        </a>

        <nav
          className="hidden items-center gap-1 rounded-full border border-primary/25 bg-primary-soft/50 px-2 py-1.5 text-sm text-ink-soft md:flex"
          aria-label="Section links"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 transition hover:bg-surface hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface-hover hover:text-ink"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
          </button>
          <Button as={Link} to="/app/overview" variant="primary">
            Open Kinetiq
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-16 pt-14 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Runs 100% on-device — powered by MediaPipe
          </span>
          <h1 className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[3rem]">
            Movement assessment and <span className="text-primary">early-sign stroke screening</span>, in your browser.
          </h1>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-soft">
            Kinetiq turns any webcam into a structured clinical-style movement lab — tracking body, hand and facial
            landmarks on-device to run standardized assessments and compare left against right. No uploads, no
            accounts, no servers.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} to="/app/overview" variant="primary" size="lg">
              Open Kinetiq <Icon name="arrowRight" className="h-4 w-4" />
            </Button>
            <Button as="a" href="#how-it-works" variant="secondary" size="lg">
              See how it works
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-6">
            {STATS.map(([value, label]) => (
              <div key={label}>
                <div className="font-display text-2xl font-semibold text-ink">{value}</div>
                <div className="text-xs text-ink-faint">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    'On-device pose, hand & face detection',
    'No sign-up required',
    'No video ever uploaded',
    'Screening, not diagnosis',
    'Free & open',
  ];
  return (
    <section className="border-y border-border bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-5 text-xs font-medium text-ink-soft">
        {items.map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-[2rem] font-semibold leading-tight text-ink sm:text-[2.3rem]">
          A real clinical-style platform, <span className="text-primary">not a tech demo</span>
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          A structured assessment library, a dedicated screening dashboard, and a symmetry-first measurement
          philosophy — built to be lived in, not just looked at once.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-inset text-ink-soft">
              <Icon name={f.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-[16px] font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-surface/60">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-[2rem] font-semibold leading-tight text-ink sm:text-[2.3rem]">
            Three steps. <span className="text-primary">Zero setup.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            No install, no camera calibration wizard, no account to create — open a tab and start.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-bg-inset/50 p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-[16px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScreeningSpotlight() {
  return (
    <section id="screening" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-soft">
            <Icon name="screening" className="h-3.5 w-3.5 text-primary" />
            Stroke early-sign screening
          </span>
          <h2 className="mt-5 font-display text-[2rem] font-semibold leading-tight text-ink sm:text-[2.3rem]">
            Face, arm and hand movement, <span className="text-primary">compared side to side.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            An uneven smile or a one-sided drop in arm movement are among the earliest visible signs of stroke. The
            Screening dashboard runs the same landmark pipeline across four assessments and reports the left/right
            difference in plain language — never a diagnosis.
          </p>
          <Button as={Link} to="/app/screening" variant="ghost" className="mt-6 !px-0 text-primary hover:!bg-transparent">
            Explore the screening dashboard <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {SCREENING_ITEMS.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-inset text-[11px] font-semibold text-ink-soft">
                  {t.order}
                </span>
                <h3 className="font-display text-[14.5px] font-semibold text-ink">{t.name}</h3>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-soft">{t.measures}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section id="privacy" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="overflow-hidden rounded-2xl border border-border bg-stage px-8 py-12 text-stage-fg sm:px-14">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-stage-accent">
            <Icon name="shield" className="h-7 w-7" />
          </span>
          <div>
            <h2 className="font-display text-[1.85rem] font-semibold leading-tight text-stage-fg sm:text-[2.05rem]">
              Your camera feed never leaves your device.
            </h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-stage-fg-soft">
              Every frame is processed locally in your browser using WebAssembly — video is never streamed, recorded,
              or uploaded anywhere. Assessment history lives in your browser's local storage only, and you can export
              or delete it at any time. There's no account, no tracking, and no server that could be breached, because
              there is no server in the loop at all.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="rounded-2xl bg-primary px-8 py-14 text-center sm:px-14">
        <h2 className="font-display text-[2rem] font-semibold leading-tight text-white sm:text-[2.3rem]">
          Try Kinetiq now — no installation, no sign-up.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-white/80">
          Open the app, allow camera access, and run your first assessment in under a minute.
        </p>
        <Button as={Link} to="/app/overview" size="lg" className="mt-7 !bg-white !text-primary-strong hover:!bg-white/90">
          Open Kinetiq <Icon name="arrowRight" className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <Icon name="arm" className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <span className="font-script text-[21px] leading-none text-ink">Kinetiq</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-soft">
              On-device movement assessment and early-sign stroke screening, built with MediaPipe and React.
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
              Kinetiq is a technology prototype built to demonstrate real-time computer vision for movement assessment
              in the browser. It is not a certified medical device and does not diagnose or treat any condition.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-ink-faint sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Kinetiq. All detection runs locally in your browser.</span>
          <span>Built with React, Tailwind CSS, and MediaPipe.</span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage({ theme, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <NavBar theme={theme} onToggleTheme={onToggleTheme} />
      <Hero />
      <TrustBar />
      <Capabilities />
      <HowItWorks />
      <ScreeningSpotlight />
      <PrivacySection />
      <CTABanner />
      <Footer />
    </div>
  );
}
