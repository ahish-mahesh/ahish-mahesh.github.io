import { profile } from '../../content/profile.ts';
import { cx } from '../cx.ts';
import styles from './SiteFooter.module.css';

const repo = 'https://github.com/ahish-mahesh/ahish-mahesh.github.io';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={cx(styles.inner, 'muted')}>
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
