import { useTheme } from '../../theme/useTheme.ts';
import styles from './ThemeSwitch.module.css';

export function ThemeSwitch() {
  const { theme, setTheme, themes } = useTheme();
  const next = themes[(themes.indexOf(theme) + 1) % themes.length] ?? theme;
  const label = `theme: ${theme}, switch to ${next}`;
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      title={label}
      onClick={() => {
        setTheme(next);
      }}
    >
      <span aria-hidden="true">◐</span>
    </button>
  );
}
