import { profile } from '../../content/profile.ts';
import { ThemeSwitch } from '../ThemeSwitch/ThemeSwitch.tsx';
import styles from './SiteHeader.module.css';

const links = [
  { label: 'projects', href: '#projects' },
  { label: 'work', href: '#work' },
  { label: 'about', href: '#about' },
  { label: 'contact', href: '#contact' },
  { label: 'resume', href: profile.links.resume },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <nav aria-label="primary" className={styles.nav}>
        <a href="#top" className={styles.prompt}>
          ahish@montreal:~$
        </a>
        <ul className={styles.links}>
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className={styles.link}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <ThemeSwitch />
      </nav>
    </header>
  );
}
