import { m, useScroll, useSpring } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { education, experience } from '../../content/experience.ts';
import { NARROW_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { cx } from '../cx.ts';
import { sectionPrompts } from '../sections.ts';
import { Section } from '../Section/Section.tsx';
import styles from './GitLogTimeline.module.css';

const FADE_IN = {
  initial: { opacity: 0, scale: 0.6 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.5 },
  transition: { duration: 0.3 },
} as const;

const DEFAULT_OPEN: readonly string[] = ['vffice', 'kla-engineer'];

export function GitLogTimeline() {
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.8', 'end 0.95'],
  });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const fade = reduced ? {} : FADE_IN;
  const narrow = useMediaQuery(NARROW_QUERY);
  // Desktop opens the two most recent jobs. A phone starts fully collapsed so the whole
  // career fits on one screen. Only the first render decides; later resizes keep the state.
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(narrow ? [] : DEFAULT_OPEN));

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  // Ctrl+F reveals a hidden="until-found" panel and fires `beforematch` on it.
  // React's types only accept a boolean for `hidden`, so the attribute is set here.
  const panelRef = useCallback(
    (id: string, isOpen: boolean) => (el: HTMLDivElement | null) => {
      if (!el) return;
      if (isOpen) el.removeAttribute('hidden');
      else el.setAttribute('hidden', 'until-found');
      const onMatch = () => {
        setOpen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      };
      el.addEventListener('beforematch', onMatch);
      return () => {
        el.removeEventListener('beforematch', onMatch);
      };
    },
    [],
  );

  return (
    <Section id="work" title="where I've worked" command={sectionPrompts.work}>
      <div className={styles.timeline}>
        <m.div
          aria-hidden="true"
          className={styles.spine}
          data-testid="spine"
          style={reduced ? undefined : { scaleY: drawn, transformOrigin: 'top' }}
        />
        <ol ref={listRef} className={styles.list}>
          {experience.map((e, i) => {
            const prev = experience[i - 1];
            const next = experience[i + 1];
            const opens = e.branch === 'side' && prev?.branch !== 'side';
            const closes = e.branch === 'side' && next?.branch !== 'side';
            const headingId = `exp-${e.id}`;
            const panelId = `exp-panel-${e.id}`;
            const isOpen = open.has(e.id);
            const now = i === 0 ? <span className="muted">{' · now'}</span> : null;
            return (
              <li key={e.id} className={styles.item}>
                {opens ? (
                  <span aria-hidden="true" className={styles.fork}>
                    {' \\'}
                  </span>
                ) : null}
                <div className={cx(styles.commit, e.branch === 'side' && styles.sideCommit)}>
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
                    <h3 id={headingId} className={styles.heading}>
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => {
                          toggle(e.id);
                        }}
                      >
                        {narrow ? (
                          <>
                            <span className={styles.line}>
                              <span className={styles.org}>{e.org}</span>
                              <span aria-hidden="true" className={styles.disclosure}>
                                {isOpen ? '[-]' : '[+]'}
                              </span>
                            </span>
                            <span className={cx(styles.line, styles.sub2)}>
                              {e.role}&nbsp;· <span className={styles.nowrap}>{e.graphLabel}</span>
                              {now}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className={styles.titleRow}>
                              <span className={styles.org}>{e.org}</span> · {e.role}
                              {now}
                            </span>
                            <span className={cx(styles.date, 'muted')}>{e.dateLabel}</span>
                          </>
                        )}
                      </button>
                    </h3>
                    <div id={panelId} ref={panelRef(e.id, isOpen)} className={styles.panel}>
                      {narrow ? (
                        <p>
                          <time dateTime={e.start}>{e.dateLabel}</time>
                          {e.location ? <span className="muted">{` · ${e.location}`}</span> : null}
                        </p>
                      ) : e.location ? (
                        <p className="muted">{e.location}</p>
                      ) : null}
                      {e.note ? <p className="muted">{e.note}</p> : null}
                      <ul className={cx('prose', styles.bullets)}>
                        {e.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                      {e.link ? (
                        <p>
                          <a href={e.link.href}>{e.link.label}</a>
                        </p>
                      ) : null}
                      {e.tag ? (
                        <p>
                          <span className="muted">award: </span>
                          {e.tag.text}
                        </p>
                      ) : null}
                    </div>
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
    </Section>
  );
}
