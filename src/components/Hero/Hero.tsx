import { profile } from '../../content/profile.ts';
import { DecodeText } from '../DecodeText/DecodeText.tsx';
import styles from './Hero.module.css';

const buttons = [
  { label: 'view projects', href: '#projects' },
  { label: 'resume.pdf', href: profile.links.resume },
  { label: 'email', href: `mailto:${profile.email}` },
] as const;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.text}>
        <h1 id="hero-heading" className={styles.name}>
          <DecodeText text={profile.name} />
        </h1>
        <p>{profile.oneLiner}</p>
        <p className="muted">{profile.subLine}</p>
        <ul className={styles.buttons}>
          {buttons.map((b) => (
            <li key={b.label}>
              <a href={b.href} className={styles.button}>
                <span aria-hidden="true">[ </span>
                {b.label}
                <span aria-hidden="true"> ]</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className={styles.visual} />
    </section>
  );
}
