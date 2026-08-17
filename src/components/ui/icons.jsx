// A single restrained line-icon set (1.75px stroke, rounded caps), reused
// across the sidebar, cards, and empty states instead of pulling in an icon
// library. Kept intentionally small — one visual language, not a kitchen
// sink of glyphs.
const PATHS = {
  overview: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.75" />
      <rect x="13.5" y="3" width="7.5" height="9.5" rx="1.75" />
      <rect x="3" y="13" width="7.5" height="8" rx="1.75" />
      <rect x="13.5" y="15" width="7.5" height="6" rx="1.75" />
    </>
  ),
  assessments: (
    <>
      <path d="M9 3v4M15 3v4" />
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M8.5 13.5l2.3 2.3L16 11" />
    </>
  ),
  screening: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.6a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.88.34l-.05.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3.9a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.05a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V3.9a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10c.14.43.62 1.06 1.55 1H20.1a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1-1.6A1 1 0 0 1 10 4h4a1 1 0 0 1 .87.5l1 1.5H17.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.2" r="3.5" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="5.5" width="13" height="13" rx="2.5" />
      <path d="M15.5 10l6-3.3v10.6l-6-3.3" />
    </>
  ),
  arm: (
    <>
      <circle cx="12" cy="5" r="2.4" />
      <path d="M12 7.5v5.5M8 9.5l-3 1.5M16 9.5l3 1.5M9 22l3-6.5L15 22M9 15.5h6" />
    </>
  ),
  hand: (
    <>
      <path d="M8 12.5V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11.3V6a1.5 1.5 0 0 1 3 0v9.5" />
      <path d="M17 12.5V9a1.5 1.5 0 0 1 3 0v6.5c0 3.6-2.7 6.5-6.5 6.5h-1c-2 0-3.3-.7-4.6-2.2L4.3 15c-.6-.8-.4-1.9.4-2.4.7-.4 1.6-.3 2.2.3L8 14" />
    </>
  ),
  face: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10.2h.01M15 10.2h.01" />
      <path d="M8.7 14.5c.9 1.1 2 1.7 3.3 1.7s2.4-.6 3.3-1.7" />
    </>
  ),
  sit: (
    <>
      <circle cx="12" cy="4.2" r="1.9" />
      <path d="M12 6.3v5.2l-3.5 2.2M12 11.5l3.5 2.2M8.5 13.7l-1 6.3M15.5 13.7l1 6.3M8.5 20h7" />
    </>
  ),
  gait: (
    <>
      <circle cx="14.5" cy="4.2" r="1.9" />
      <path d="M14.5 6.3l-1.2 5-3.8 2M13.3 11.3l2.7 1.7-1 5.2M9.5 13.3l-2 6.2M15 18.2l1.7 1.8" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="M4.5 12.5l4.5 4.5 10.5-11" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.6 2.6L16.2 9" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5l9.5 16.5H2.5z" />
      <path d="M12 9.5v4.2M12 16.8h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 8h.01" />
    </>
  ),
  chevronRight: <path d="M9 5l7 7-7 7" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  arrowRight: <path d="M4 12h16M13 5l7 7-7 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.6 2.1" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11.5M8 11.5l4 4 4-4" />
      <path d="M4.5 17v2A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" />
      <path d="M6.5 7l1 12a2 2 0 0 0 2 1.9h5a2 2 0 0 0 2-1.9l1-12" />
    </>
  ),
  bolt: <path d="M13 2.5L4.5 14h6L11 21.5 19.5 10h-6z" fill="currentColor" stroke="none" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.2" r="3" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5S15 16.7 15 20" />
      <path d="M16 8.7a2.7 2.7 0 1 0 0-5.4M18 14.8c2 .5 3.3 2.3 3.3 5.2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M5 5l14 14M19 5L5 19" />,
  moon: <path d="M20.7 14.9A8.6 8.6 0 1 1 9.1 3.3a7 7 0 1 0 11.6 11.6Z" fill="currentColor" stroke="none" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  report: (
    <>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5z" />
      <path d="M14 3.5V8h4M9 12h6M9 15.5h6M9 8.5h2" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5" />
      <path d="M20 4v4.5h-4.5" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5" />
      <path d="M4 20v-4.5h4.5" />
    </>
  ),
};

export default function Icon({ name, className = 'h-5 w-5', filled = false, strokeWidth = 1.75 }) {
  const content = PATHS[name];
  if (!content) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
