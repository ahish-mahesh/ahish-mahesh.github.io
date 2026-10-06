import { profile } from '../../content/profile.ts';
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
        <dl className={styles.facts}>
          {profile.facts.map((f) => (
            <div key={f.key} className={styles.fact} data-key={f.key}>
              <dt className="muted">{f.key}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
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
