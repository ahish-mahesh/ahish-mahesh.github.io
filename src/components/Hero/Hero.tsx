import { profile } from '../../content/profile.ts';
import { cx } from '../cx.ts';
import { DecodeText } from '../DecodeText/DecodeText.tsx';
import { HeroVisual } from './HeroVisual.tsx';
import styles from './Hero.module.css';

const buttons = [
  { label: 'email', href: `mailto:${profile.email}`, external: false },
  { label: 'résumé', href: profile.links.resume, external: false },
  { label: 'linkedin', href: profile.links.linkedin, external: true },
] as const;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.text}>
        <h1 id="hero-heading" className={styles.name}>
          <DecodeText text={profile.name} />
        </h1>
        <p>{profile.oneLiner}</p>
        <p className="muted">{profile.background}</p>
        <p className={cx('prose', styles.status)}>
          <span aria-hidden="true" className={styles.dot}>
            ●
          </span>{' '}
          {profile.status}
        </p>
        <ul className={styles.buttons}>
          {buttons.map((b) => (
            <li key={b.label}>
              <a
                href={b.href}
                className={styles.button}
                rel={b.external ? 'noreferrer' : undefined}
              >
                <span aria-hidden="true">[ </span>
                {b.label}
                <span aria-hidden="true"> ]</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <HeroVisual className={styles.visual} />
    </section>
  );
}
