import { profile } from '../../content/profile.ts';
import { Section } from '../Section/Section.tsx';
import styles from './Contact.module.css';

const links = [
  { label: 'email', href: `mailto:${profile.email}`, text: profile.email, external: false },
  { label: 'linkedin', href: profile.links.linkedin, text: 'ahish-mahesh', external: true },
  { label: 'github', href: profile.links.github, text: 'ahish-mahesh', external: true },
  { label: 'resume.pdf', href: profile.links.resume, text: 'resume.pdf', external: false },
] as const;

export function Contact() {
  return (
    <Section id="contact" title="saying hello">
      <div className={styles.body}>
        <p>{profile.location}</p>
        <p>{profile.availability}</p>
        <p>{profile.workAuthorization}</p>
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
