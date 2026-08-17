import { NavLink } from 'react-router-dom';
import Icon from '../components/ui/icons';

const NAV_ITEMS = [
  { to: '/app/overview', label: 'Overview', icon: 'overview' },
  { to: '/app/assessments', label: 'Assessments', icon: 'assessments' },
  { to: '/app/screening', label: 'Stroke Screening', icon: 'screening' },
  { to: '/app/history', label: 'Progress / History', icon: 'history' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
];

function Logo() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="5" r="2.3" />
        <path d="M12 7.5v5.5M8 9.5l-3 1.5M16 9.5l3 1.5M9 22l3-6.5L15 22M9 15.5h6" />
      </svg>
    </span>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] shrink-0 -translate-x-full flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : ''
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <Logo />
          <div className="leading-tight">
            <div className="-mb-0.5 font-script text-[22px] leading-none text-sidebar-ink">Kinetiq</div>
            <div className="text-[10.5px] text-sidebar-ink-soft">Movement &amp; screening</div>
          </div>
        </div>

        <nav
          className="mx-3 my-4 flex-1 space-y-1 overflow-y-auto rounded-[22px] border border-primary/25 bg-primary-soft/40 p-2.5"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[13.5px] font-medium transition ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-sidebar-ink-soft hover:bg-surface hover:text-sidebar-ink'
                }`
              }
            >
              <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-medium text-sidebar-ink">On-device session</div>
              <div className="truncate text-[11px] text-sidebar-ink-soft">Nothing leaves your browser</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
