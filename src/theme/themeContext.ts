import { createContext } from 'react';
import type { Theme } from './themes.ts';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: readonly Theme[];
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
