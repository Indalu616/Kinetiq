import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { loadSessions } from './lib/storage';
import LandingPage from './components/landing/LandingPage';
import AppShell from './app/AppShell';
import OverviewPage from './pages/OverviewPage';
import AssessmentsLibraryPage from './pages/AssessmentsLibraryPage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import ScreeningPage from './pages/ScreeningPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [sessions, setSessions] = useState(() => loadSessions());

  return (
    <Routes>
      <Route path="/" element={<LandingPage theme={theme} onToggleTheme={toggleTheme} />} />

      <Route path="/app" element={<AppShell theme={theme} onToggleTheme={toggleTheme} />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage sessions={sessions} />} />
        <Route path="assessments" element={<AssessmentsLibraryPage />} />
        <Route path="assessments/:assessmentId" element={<AssessmentDetailPage onSaved={setSessions} />} />
        <Route path="screening" element={<ScreeningPage sessions={sessions} />} />
        <Route path="history" element={<HistoryPage sessions={sessions} onSessionsChange={setSessions} />} />
        <Route
          path="settings"
          element={<SettingsPage theme={theme} onToggleTheme={toggleTheme} sessions={sessions} onSessionsChange={setSessions} />}
        />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
