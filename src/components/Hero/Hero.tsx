import { profile } from '../../content/profile.ts';
import { useActiveSectionId } from '../../hooks/ActiveSectionContext.ts';
import { useTerminal } from '../../terminal/useTerminal.ts';
import { DecodeText } from '../DecodeText/DecodeText.tsx';
import { HeroVisual } from './HeroVisual.tsx';
import styles from './Hero.module.css';

const buttons = [
  { label: 'email', href: `mailto:${profile.email}` },
  { label: 'resume.pdf', href: profile.links.resume },
] as const;

export function Hero() {
  const active = useActiveSectionId();
  const terminal = useTerminal();
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className={styles.hero}
      data-dim={active === null ? undefined : String(active !== 'top')}
    >
      <div className={styles.text}>
        <h1 id="hero-heading" className={styles.name}>
          <DecodeText text={profile.name} />
        </h1>
        <p>{profile.oneLiner}</p>
        <p className="muted">{profile.subLine}</p>
        <p className="muted">
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
      <HeroVisual className={styles.visual} />
      <a href="#projects" className={styles.next}>
        <span aria-hidden="true">$ </span>
        cd projects
      </a>
    </section>
  );
}
