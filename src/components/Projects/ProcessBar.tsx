import { useEffect, useRef } from 'react';
import { animate, m, useInView, useMotionValue, useTransform } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { bar } from '../MigrationPanel/bar.ts';
import styles from './Projects.module.css';

const DURATION_S = 0.8;

/** A fixed-width bar that fills once, the first time it scrolls into view, then stays full. */
export function ProcessBar() {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, bar);

  useEffect(() => {
    if (reduceMotion || !seen) return;
    const controls = animate(value, 1, { duration: DURATION_S, ease: 'easeOut' });
    return () => {
      controls.stop();
    };
  }, [reduceMotion, seen, value]);

  return (
    <m.span ref={ref} aria-hidden="true" className={styles.bar}>
      {reduceMotion ? bar(1) : text}
    </m.span>
  );
}
