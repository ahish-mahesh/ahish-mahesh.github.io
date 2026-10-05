import { useTheme } from '../../theme/useTheme.ts';
import styles from './ThemeSwitch.module.css';

export function ThemeSwitch() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div role="group" aria-label="theme" className={styles.group}>
      {themes.map((t) => (
        <button
          key={t}
          type="button"
          className={styles.button}
          aria-pressed={theme === t}
          onClick={() => {
            setTheme(t);
          }}
        >
          <span aria-hidden="true">[</span>
          {t}
          <span aria-hidden="true">]</span>
        </button>
      ))}
    </div>
  );
}
