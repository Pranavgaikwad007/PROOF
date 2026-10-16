export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'proof-theme';

/** Read the saved theme, falling back to the OS preference, then to light. */
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (stored === 'dark' || stored === 'light') return stored;

  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return prefersDark ? 'dark' : 'light';
}

/** Apply the theme to <html> and persist the user's explicit choice. */
export function applyTheme(theme: Theme, persist = true): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  root.setAttribute('data-theme', theme);

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable (private mode); theme still applies */
    }
  }
}
