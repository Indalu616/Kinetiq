import { useState } from 'react';
import { useExerciseSession } from './hooks/useExerciseSession';
import { useTheme } from './hooks/useTheme';
import { loadSessions, saveSession, deleteSession } from './lib/storage';
import LandingPage from './components/landing/LandingPage';
import CameraStage from './components/CameraStage';
import ControlsPanel from './components/ControlsPanel';
import LiveStats from './components/LiveStats';
import SessionSummary from './components/SessionSummary';
import HistoryPanel from './components/HistoryPanel';
import AssessmentsHome from './components/assessments/AssessmentsHome';
import SitToStandFlow from './components/assessments/SitToStandFlow';
import ArmAssessmentFlow from './components/assessments/ArmAssessmentFlow';
import HandAssessmentFlow from './components/assessments/HandAssessmentFlow';
import MovementDemo from './components/demo/MovementDemo';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
  );
}

export default function App() {
  const session = useExerciseSession();
  const { theme, toggle: toggleTheme } = useTheme();
  const [view, setView] = useState('landing'); // landing | live | summary | history | assessments
  const [completedSession, setCompletedSession] = useState(null);
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeAssessment, setActiveAssessment] = useState(null); // sit-to-stand | arm-movement | hand-assessment

  const handleStart = () => session.startSession(session.camera.deviceId);

  const handleStop = () => {
    const summary = { ...session.stopSession(), type: 'exercise', label: 'Shoulder Raise' };
    if (summary.totals.total > 0) {
      const updated = saveSession(summary);
      setSessions(updated);
    }
    setCompletedSession(summary);
    setView('summary');
  };

  const handleDiscard = () => {
    if (completedSession) {
      setSessions(deleteSession(completedSession.id));
    }
    setCompletedSession(null);
    setView('live');
  };

  const handleNewSession = () => {
    setCompletedSession(null);
    setView('live');
  };

  const canStart = session.modelStatus === 'ready';

  if (view === 'landing') {
    return <LandingPage onLaunch={setView} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-line/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button type="button" onClick={() => setView('landing')} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-cream-soft">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="5" r="2.3" />
                <path strokeLinecap="round" d="M12 7.5v5.5M8 9.5l-3 1.5M16 9.5l3 1.5M9 22l3-6.5L15 22M9 15.5h6" />
              </svg>
            </span>
            <div className="leading-tight">
              <div className="font-serif text-[17px] font-medium text-ink">Kinetiq</div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <nav className="mr-1 flex gap-1 rounded-full border border-line bg-panel p-1 text-sm">
              <button
                type="button"
                onClick={() => setView('live')}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                  view === 'live' || view === 'summary' ? 'bg-forest text-cream-soft' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Session
              </button>
              <button
                type="button"
                onClick={() => setView('assessments')}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                  view === 'assessments' ? 'bg-forest text-cream-soft' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Assessments
              </button>
              <button
                type="button"
                onClick={() => setView('history')}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                  view === 'history' ? 'bg-forest text-cream-soft' : 'text-ink-soft hover:text-ink'
                }`}
              >
                History
              </button>
            </nav>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {view === 'live' && (
          <>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-1.5 text-xs font-medium text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                Runs entirely on-device — no video ever leaves your browser
              </span>
              <h1 className="mt-5 font-serif text-[2.35rem] leading-[1.15] tracking-tight text-ink sm:text-[2.75rem]">
                Raise your arm. <em className="text-forest">We'll count the rest.</em>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                Stand in front of the camera and perform a shoulder raise. The coach tracks your joints, measures
                range of motion frame by frame, and tells you exactly what to fix.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <CameraStage
                  videoRef={session.videoRef}
                  canvasRef={session.canvasRef}
                  modelStatus={session.modelStatus}
                  modelError={session.modelError}
                  cameraStatus={session.camera.status}
                  cameraError={session.camera.error}
                  running={session.running}
                  poseDetected={session.poseDetected}
                  lastEvent={session.lastEvent}
                />
                <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4">
                  <p className="flex-1 text-[13px] leading-relaxed text-ink-soft">
                    <span className="font-medium text-ink">How it works —</span> stand facing the camera so your
                    shoulders, elbows and wrists are visible, then raise your arm(s) out to the side and back down.
                    Each full raise-and-lower is counted as one rep and scored against your target angle and arm
                    straightness.
                  </p>
                  <MovementDemo
                    type="shoulder-raise"
                    mirror={session.side === 'left'}
                    size="sm"
                    showCaption={false}
                    className="shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <LiveStats
                  side={session.side}
                  targetAngle={session.targetAngle}
                  liveSides={session.liveSides}
                  elapsedMs={session.elapsedMs}
                />
                <ControlsPanel
                  running={session.running}
                  canStart={canStart}
                  onStart={handleStart}
                  onStop={handleStop}
                  onReset={session.resetSession}
                  side={session.side}
                  onSideChange={session.setSide}
                  targetAngle={session.targetAngle}
                  onTargetAngleChange={session.setTargetAngle}
                  audioFeedback={session.audioFeedback}
                  onAudioFeedbackChange={session.setAudioFeedback}
                  speechSupported={session.speechSupported}
                  onTestVoice={session.testVoice}
                  devices={session.camera.devices}
                  deviceId={session.camera.deviceId}
                  onDeviceChange={(id) => session.startSession(id)}
                />
              </div>
            </div>
          </>
        )}

        {view === 'summary' && completedSession && (
          <SessionSummary
            session={completedSession}
            onNewSession={handleNewSession}
            onDiscard={handleDiscard}
            onViewHistory={() => setView('history')}
          />
        )}

        {view === 'history' && (
          <HistoryPanel sessions={sessions} onSessionsChange={setSessions} onBack={() => setView('live')} />
        )}

        {view === 'assessments' && !activeAssessment && <AssessmentsHome onSelect={setActiveAssessment} />}

        {view === 'assessments' && activeAssessment === 'sit-to-stand' && (
          <SitToStandFlow onExit={() => setActiveAssessment(null)} onSaved={setSessions} />
        )}

        {view === 'assessments' && activeAssessment === 'arm-movement' && (
          <ArmAssessmentFlow onExit={() => setActiveAssessment(null)} onSaved={setSessions} />
        )}

        {view === 'assessments' && activeAssessment === 'hand-assessment' && (
          <HandAssessmentFlow onExit={() => setActiveAssessment(null)} onSaved={setSessions} />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-ink-faint">
        All pose detection runs locally in your browser via MediaPipe — no video is uploaded anywhere.
      </footer>
    </div>
  );
}
