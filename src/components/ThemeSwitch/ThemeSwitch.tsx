import { useTheme } from '../../theme/useTheme.ts';
import styles from './ThemeSwitch.module.css';

export function ThemeSwitch() {
  const { theme, setTheme, themes } = useTheme();
  const next = themes[(themes.indexOf(theme) + 1) % themes.length] ?? theme;
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`theme: ${theme}, switch to ${next}`}
      onClick={() => {
        setTheme(next);
      }}
    >
      <span aria-hidden="true">[</span>
      {theme}
      <span aria-hidden="true">]</span>
    </button>
  );
}
