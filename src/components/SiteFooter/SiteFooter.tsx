import { profile } from '../../content/profile.ts';
import { useTerminal } from '../../terminal/useTerminal.ts';
import { cx } from '../cx.ts';
import styles from './SiteFooter.module.css';

const repo = 'https://github.com/ahish-mahesh/ahish-mahesh.github.io';

export function SiteFooter() {
  const terminal = useTerminal();
  return (
    <footer className={styles.footer}>
      <div className={cx(styles.inner, 'muted')}>
        <p>
          <button
            type="button"
            className={styles.hint}
            aria-haspopup="dialog"
            onClick={terminal.openTerminal}
            onMouseEnter={terminal.preload}
            onFocus={terminal.preload}
          >
            {/* One variant is display:none per device, so only one is ever announced. */}
            <span className={styles.hintKeys}>
              Press <kbd>`</kbd> for the backend of this site.
            </span>
            <span className={styles.hintTouch}>Tap here for the backend of this site.</span>
          </button>
        </p>
        <p>
          <a href={repo} rel="noreferrer">
            source on github
          </a>
          {' · '}
          <a href={`${repo}/blob/main/CREDITS.md`} rel="noreferrer">
            credits
          </a>
          {' · built with '}
          <a href="https://claude.com/claude-code" rel="noreferrer">
            Claude Code
          </a>
        </p>
        <p>ps5: {profile.signOff}</p>
      </div>
    </footer>
  );
}
