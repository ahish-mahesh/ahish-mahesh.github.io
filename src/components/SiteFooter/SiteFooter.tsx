import styles from './SiteFooter.module.css';

import { cx } from '../cx.ts';
const repo = 'https://github.com/ahish-mahesh/ahish-mahesh.github.io';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={cx(styles.inner, 'muted')}>
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
    </footer>
  );
}
