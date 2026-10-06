import { neofetchLogo, neofetchTitle, skills } from '../../content/skills.ts';
import { sectionPrompts } from '../sections.ts';
import { Section } from '../Section/Section.tsx';
import styles from './Neofetch.module.css';

const blocks = ['--fg', '--accent', '--muted'] as const;

export function Neofetch() {
  return (
    <Section id="about" title="what I reach for" command={sectionPrompts.about}>
      <div className={styles.grid}>
        <pre aria-hidden="true" className={styles.logo}>
          {neofetchLogo}
        </pre>
        <div>
          <p className={styles.title}>{neofetchTitle}</p>
          <p aria-hidden="true" className={styles.rule}>
            {'-'.repeat(neofetchTitle.length)}
          </p>
          <dl className={styles.list}>
            {skills.map((s) => (
              <div key={s.key} className={styles.row}>
                <dt className={styles.key}>{s.key}</dt>
                <dd>
                  {s.values.map((v, i) => (
                    <span key={v}>
                      {i > 0 ? ' · ' : null}
                      <span className={styles.value}>{v}</span>
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <div aria-hidden="true" className={styles.blocks} data-testid="color-blocks">
            {blocks.map((b) => (
              <span key={b} style={{ background: `var(${b})` }} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
