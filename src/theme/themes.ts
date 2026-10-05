export const THEMES = ['phosphor', 'amber', 'paper'] as const;
export type Theme = (typeof THEMES)[number];
export const STORAGE_KEY = 'theme';

export function isTheme(v: unknown): v is Theme {
  return typeof v === 'string' && (THEMES as readonly string[]).includes(v);
}

export function readStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isTheme(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(t: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // storage unavailable; the choice just will not persist
  }
}

export function systemTheme(): Theme {
  if (typeof window.matchMedia !== 'function') return 'phosphor';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'paper' : 'phosphor';
}
