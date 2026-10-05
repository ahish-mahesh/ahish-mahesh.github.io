import { education, experience } from '../../content/experience.ts';
import { profile } from '../../content/profile.ts';
import { cx } from '../cx.ts';
import { Section } from '../Section/Section.tsx';
import styles from './GitLogTimeline.module.css';

export function GitLogTimeline() {
  return (
    <Section id="work" title="where I've worked">
      <ol className={styles.list}>
        {experience.map((e, i) => {
          const prev = experience[i - 1];
          const next = experience[i + 1];
          const opens = e.branch === 'side' && prev?.branch !== 'side';
          const closes = e.branch === 'side' && next?.branch !== 'side';
          const headingId = `exp-${e.id}`;
          return (
            <li key={e.id} className={styles.item}>
              {opens ? (
                <span aria-hidden="true" className={styles.fork}>
                  {'|\\'}
                </span>
              ) : null}
              <div className={styles.commit}>
                <span
                  aria-hidden="true"
                  className={cx(styles.graph, e.branch === 'side' && styles.side)}
                >
                  {e.branch === 'side' ? '| *' : '*'}
                </span>
                <article aria-labelledby={headingId} className={styles.article}>
                  <p className={styles.meta}>
                    <span className="muted">{e.graphLabel}</span>
                    {i === 0 ? (
                      <span aria-hidden="true" className={styles.head}>
                        {' (HEAD -> main)'}
                      </span>
                    ) : null}
                  </p>
                  <h3 id={headingId} className={styles.title}>
                    {e.org} · {e.role}
                  </h3>
                  <p>
                    <time dateTime={e.start}>{e.dateLabel}</time>
                    {e.location ? <span className="muted">{` · ${e.location}`}</span> : null}
                  </p>
                  {e.note ? <p className="muted">{e.note}</p> : null}
                  <ul className={styles.bullets}>
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  {e.link ? (
                    <p>
                      <a href={e.link.href}>{e.link.label}</a>
                    </p>
                  ) : null}
                </article>
              </div>
              {closes ? (
                <span aria-hidden="true" className={styles.fork}>
                  {'|/'}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <h3 className={styles.sub}>education</h3>
      <ul className={styles.edu}>
        {education.map((ed) => (
          <li key={ed.school}>
            {ed.degree}, {ed.school}
            <span className="muted">
              {` · ${ed.dates}`}
              {ed.gpa ? ` · ${ed.gpa}` : ''}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.award}>
        <span className="muted">award: </span>
        {profile.award}
      </p>
    </Section>
  );
}
