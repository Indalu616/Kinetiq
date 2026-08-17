import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Icon from '../components/ui/icons';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle color theme"
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface-hover hover:text-ink"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
    </button>
  );
}

/**
 * The application shell every internal page renders inside: a fixed sidebar
 * for primary navigation, and a slim topbar carrying the mobile menu
 * trigger, theme toggle, and a link back to the marketing site. Page
 * content renders via <Outlet /> so each route stays a plain page
 * component with no shell boilerplate of its own.
 */
export default function AppShell({ theme, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-surface-hover lg:hidden"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1" />
          <Link
            to="/"
            className="hidden text-[13px] font-medium text-ink-soft transition hover:text-ink sm:inline-flex sm:items-center sm:gap-1.5"
          >
            <Icon name="arrowRight" className="h-3.5 w-3.5 rotate-180" />
            About Kinetiq
          </Link>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </header>

        <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-7 sm:px-8 sm:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
