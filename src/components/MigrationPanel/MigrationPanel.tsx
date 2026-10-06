import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { animate, m, useInView, useMotionValue, useMotionValueEvent } from 'motion/react';
import { CODE_COLS, migration } from '../../content/migration.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { randomGlyph, scrambleFrame } from '../DecodeText/scramble.ts';
import { bar } from './bar.ts';
import styles from './MigrationPanel.module.css';

const TOTAL_S = 2.5;
// Phases as fractions of the timeline: counter 0-1.2s, morph 0.6-2.0s, cost 1.8-2.5s.
const COUNT_END = 1.2 / TOTAL_S;
const MORPH_START = 0.6 / TOTAL_S;
const MORPH_END = 2.0 / TOTAL_S;
const COST_START = 1.8 / TOTAL_S;

const fmt = (n: number) => n.toLocaleString('en-US');
const COUNT_WIDTH = fmt(migration.queries).length;
const END_FILL = migration.costAfter / migration.costBefore;

interface View {
  count: number;
  code: string;
  fill: number;
  done: boolean;
}

const START_VIEW: View = { count: 0, code: migration.tsql, fill: 1, done: false };

const span = (t: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (t - from) / (to - from)));

/** Pure except for the random glyphs, so only call it from handlers. */
function viewAt(t: number): View {
  const morph = span(t, MORPH_START, MORPH_END);
  const cost = span(t, COST_START, 1);
  let code = migration.postgres;
  if (morph <= 0) code = migration.tsql;
  else if (morph < 1) code = scrambleFrame(migration.tsql, migration.postgres, morph, randomGlyph);
  return {
    count: Math.round(span(t, 0, COUNT_END) * migration.queries),
    code,
    fill: 1 - cost * (1 - END_FILL),
    done: cost >= 1,
  };
}

function Body({ view }: { view: View }) {
  return (
    <div aria-hidden="true">
      <p className={styles.counter}>
        queries translated:{' '}
        <span className={styles.keep}>
          <span className={styles.value}>{fmt(view.count).padStart(COUNT_WIDTH)}</span> /{' '}
          {fmt(migration.queries)}
        </span>
      </p>
      <pre className={styles.code} style={{ '--code-cols': CODE_COLS } as CSSProperties}>
        {view.code}
      </pre>
      <p className={styles.cost}>
        product cost{' '}
        <span className={styles.keep}>
          <span className={styles.value}>{bar(view.fill)}</span>{' '}
          <span className={view.done ? styles.drop : styles.dropHidden}>
            {migration.costDropLabel}
          </span>
        </span>
      </p>
    </div>
  );
}

export function MigrationPanel() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const t = useMotionValue(0);
  const [view, setView] = useState<View>(START_VIEW);
  const [run, setRun] = useState(0);

  useMotionValueEvent(t, 'change', (latest) => {
    setView(viewAt(latest));
  });

  useEffect(() => {
    if (reduced || !inView) return;
    t.set(0);
    const controls = animate(t, 1, { duration: TOTAL_S, ease: 'linear' });
    return () => {
      controls.stop();
    };
  }, [reduced, inView, run, t]);

  const finalView: View = {
    count: migration.queries,
    code: migration.postgres,
    fill: END_FILL,
    done: true,
  };

  return (
    <m.figure ref={ref} className={styles.figure}>
      <Body view={reduced ? finalView : view} />
      <div className="visually-hidden">
        <p>{fmt(migration.queries)} queries translated</p>
        <pre>{migration.tsql}</pre>
        <pre>{migration.postgres}</pre>
        <p>product cost down 25%</p>
      </div>
      <figcaption className="muted">{migration.label}</figcaption>
      {!reduced && (
        <button
          type="button"
          className={styles.replay}
          onClick={() => {
            setRun((n) => n + 1);
          }}
        >
          [ replay ]
        </button>
      )}
    </m.figure>
  );
}
