import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kinetiq.theme';

function getInitialTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies a light/dark class to <html> and persists the user's choice. */
export function useTheme() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}
