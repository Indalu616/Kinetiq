/**
 * Local persistence for session results.
 *
 * The prototype needs no backend, so completed sessions are written as JSON
 * to localStorage (bounded history) and can also be exported as a standalone
 * .json or .csv file the user downloads to disk — this mirrors the "local
 * JSON/CSV file, no database" requirement from the desktop/Python version of
 * this prototype, adapted to the browser.
 */

const STORAGE_KEY = 'kinetiq.sessions.v1';
const MAX_STORED_SESSIONS = 100;

export function loadSessions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read sessions from localStorage', err);
    return [];
  }
}

export function saveSession(session) {
  const sessions = loadSessions();
  sessions.unshift(session);
  const trimmed = sessions.slice(0, MAX_STORED_SESSIONS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to persist session to localStorage', err);
  }
  return trimmed;
}

export function clearSessions() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function deleteSession(id) {
  const sessions = loadSessions().filter((s) => s.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportSessionAsJSON(session) {
  const filename = `kinetiq-session-${session.id}.json`;
  downloadBlob(JSON.stringify(session, null, 2), filename, 'application/json');
}

export function exportSessionAsCSV(session) {
  const header = ['side', 'repIndex', 'romMaxDeg', 'elbowAngleAtPeakDeg', 'correct', 'note', 'timestamp'];
  const rows = session.reps.map((r) => [
    r.side,
    r.index,
    r.romMax,
    r.elbowAngleAtPeak,
    r.correct,
    r.note,
    new Date(r.timestamp).toISOString(),
  ]);
  const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
  downloadBlob(csv, `kinetiq-session-${session.id}.csv`, 'text/csv');
}

export function exportAllSessionsAsJSON() {
  downloadBlob(JSON.stringify(loadSessions(), null, 2), 'kinetiq-sessions.json', 'application/json');
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCSV(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  return lines.join('\n');
}

/**
 * Generic per-record export used by the Motor Assessment tests (sit-to-stand,
 * arm movement, hand assessment). Each record stores its raw event log under
 * `reps` or `events`; this just flattens whichever is present to CSV rows.
 */
export function exportRecordAsCSV(record) {
  const rows = record.reps ?? record.events ?? [];
  const csv = rowsToCSV(rows);
  downloadBlob(csv, `kinetiq-${record.type ?? 'record'}-${record.id}.csv`, 'text/csv');
}
