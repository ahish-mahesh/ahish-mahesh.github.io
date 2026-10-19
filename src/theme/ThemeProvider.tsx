import { flushSync } from 'react-dom';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion.ts';
import './transitions.css';
import { ThemeContext, type ThemeContextValue } from './themeContext.ts';
import {
  DEFAULT_THEME,
  THEMES,
  isTheme,
  readStoredTheme,
  writeStoredTheme,
  type Theme,
} from './themes.ts';

function initialTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return isTheme(attr) ? attr : (readStoredTheme() ?? DEFAULT_THEME);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    const apply = () => {
      setThemeState(t);
      document.documentElement.dataset.theme = t;
      writeStoredTheme(t);
    };
    const animate =
      typeof document.startViewTransition === 'function' &&
      !prefersReducedMotion() &&
      document.documentElement.dataset.theme !== t;
    if (animate) {
      document.startViewTransition(() => {
        flushSync(apply);
      });
    } else {
      apply();
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, themes: THEMES }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
