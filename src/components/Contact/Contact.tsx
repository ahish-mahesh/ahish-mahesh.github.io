import { profile } from '../../content/profile.ts';
import { sectionPrompts } from '../sections.ts';
import { Section } from '../Section/Section.tsx';
import styles from './Contact.module.css';

const bare = (url: string) => url.replace(/^https?:\/\//, '');

// The email is the prominent link above the list, so it is not repeated here.
const links = [
  {
    label: 'linkedin',
    href: profile.links.linkedin,
    text: bare(profile.links.linkedin),
    external: true,
  },
  {
    label: 'github',
    href: profile.links.github,
    text: bare(profile.links.github),
    external: true,
  },
  { label: 'résumé', href: profile.links.resume, text: 'resume.pdf', external: false },
] as const;

export function Contact() {
  return (
    <Section id="contact" title="saying hello" command={sectionPrompts.contact}>
      <div className={styles.body}>
        <div className={styles.main}>
          <p className={styles.email}>
            <a href={`mailto:${profile.email}`} className={styles.emailLink}>
              <span aria-hidden="true">[ </span>
              {profile.email}
              <span aria-hidden="true"> ]</span>
            </a>
          </p>
          <p className="prose">{profile.location}</p>
          <p className="prose">{profile.availability}</p>
          <p className={styles.auth}>
            <span aria-hidden="true" className={styles.comment}>
              # note:
            </span>
            <span className="prose">{profile.workAuthorization}</span>
          </p>
        </div>
        <ul className={styles.links}>
          {links.map((l) => (
            <li key={l.label} className={styles.item}>
              <span className="muted">{l.label}</span>
              <a href={l.href} rel={l.external ? 'noreferrer' : undefined}>
                {l.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
