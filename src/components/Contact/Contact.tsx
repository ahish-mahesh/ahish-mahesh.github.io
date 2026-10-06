import { profile } from '../../content/profile.ts';
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
  { label: 'resume.pdf', href: profile.links.resume, text: 'resume.pdf', external: false },
] as const;

export function Contact() {
  return (
    <Section id="contact" title="saying hello">
      <div className={styles.body}>
        <p className={styles.email}>
          <a href={`mailto:${profile.email}`} className={styles.emailLink}>
            <span aria-hidden="true">[ </span>
            {profile.email}
            <span aria-hidden="true"> ]</span>
          </a>
        </p>
        <p>{profile.location}</p>
        <p>{profile.availability}</p>
        <p className={styles.auth}>{profile.workAuthorization}</p>
        <ul>
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
