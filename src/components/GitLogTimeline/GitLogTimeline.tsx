import { m, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';
import { education, experience } from '../../content/experience.ts';
import { profile } from '../../content/profile.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { cx } from '../cx.ts';
import { Section } from '../Section/Section.tsx';
import styles from './GitLogTimeline.module.css';

const FADE_IN = {
  initial: { opacity: 0, scale: 0.6 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: 0.3 },
} as const;

export function GitLogTimeline() {
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.8', 'end 0.6'],
  });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const fade = reduced ? {} : FADE_IN;
  return (
    <Section id="work" title="where I've worked">
      <div className={styles.timeline}>
        <svg
          aria-hidden="true"
          className={styles.spine}
          viewBox="0 0 1 100"
          preserveAspectRatio="none"
          data-testid="spine"
        >
          <m.path
            d="M0.5 0 V100"
            fill="none"
            stroke="var(--muted)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            style={reduced ? undefined : { pathLength: drawn }}
          />
        </svg>
        <ol ref={listRef} className={styles.list}>
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
                    {' \\'}
                  </span>
                ) : null}
                <div className={styles.commit}>
                  <span
                    aria-hidden="true"
                    className={cx(styles.graph, e.branch === 'side' && styles.side)}
                  >
                    {e.branch === 'side' ? '  ' : null}
                    <m.span className={styles.marker} {...fade}>
                      *
                    </m.span>
                  </span>
                  <article aria-labelledby={headingId} className={styles.article}>
                    <p className={styles.meta}>
                      <span className="muted">{e.graphLabel}</span>
                      {i === 0 ? (
                        <m.span aria-hidden="true" className={styles.head} {...fade}>
                          {' (HEAD -> main)'}
                        </m.span>
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
                    {' /'}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
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
