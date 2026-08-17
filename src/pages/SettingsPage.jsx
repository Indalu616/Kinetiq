import { useState } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/icons';
import { clearSessions, exportAllSessionsAsJSON } from '../lib/storage';

export default function SettingsPage({ theme, onToggleTheme, sessions, onSessionsChange }) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    clearSessions();
    onSessionsChange([]);
    setConfirmingClear(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <SectionHeader eyebrow="Preferences" title="Settings" description="Appearance and local data controls for this browser." />

      <Card>
        <CardHeader title="Appearance" description="Kinetiq supports a real light and dark theme, not an inverted overlay." />
        <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-bg-inset/50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Icon name={theme === 'dark' ? 'moon' : 'sun'} className="h-4 w-4 text-ink-soft" />
            <span className="text-[13.5px] font-medium text-ink">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            onClick={onToggleTheme}
            className={`h-6 w-11 shrink-0 rounded-full transition ${theme === 'dark' ? 'bg-primary' : 'bg-border-strong'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 transform rounded-full bg-white shadow-sm transition ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Your data"
          description="Session and assessment history lives only in this browser's local storage — nothing is uploaded."
        />
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-lg border border-border bg-bg-inset/50 px-4 py-3">
            <div>
              <div className="text-[13.5px] font-medium text-ink">{sessions.length} saved record{sessions.length === 1 ? '' : 's'}</div>
              <div className="text-xs text-ink-faint">Export everything as a single JSON file</div>
            </div>
            <Button variant="secondary" size="sm" onClick={exportAllSessionsAsJSON} disabled={sessions.length === 0}>
              <Icon name="download" className="h-3.5 w-3.5" /> Export all
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-danger/20 bg-danger-soft/40 px-4 py-3">
            <div>
              <div className="text-[13.5px] font-medium text-ink">Clear all local data</div>
              <div className="text-xs text-ink-faint">Permanently deletes every saved session on this device</div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClear}
              onBlur={() => setConfirmingClear(false)}
              disabled={sessions.length === 0}
            >
              {confirmingClear ? 'Click again to confirm' : 'Clear data'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-bg-inset/40">
        <CardHeader title="About Kinetiq" />
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
          Kinetiq is a technology prototype for on-device movement assessment and early-sign stroke screening. It is not a
          certified medical device and does not diagnose, treat, or monitor any medical condition. All camera processing
          runs locally via MediaPipe/WebAssembly — no video ever leaves your browser.
        </p>
      </Card>
    </div>
  );
}
