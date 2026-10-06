import { useEffect } from 'react';
import { animate, m, useMotionValue, useTransform } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { bar } from './bar.ts';
import styles from './ProcessList.module.css';

const DURATION_S = 0.8;

interface ProcessBarProps {
  /** False until the row has been opened once; then the bar fills and stays full. */
  run: boolean;
}

export function ProcessBar({ run }: ProcessBarProps) {
  const reduceMotion = useReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, bar);

  useEffect(() => {
    if (reduceMotion || !run) return;
    const controls = animate(value, 1, { duration: DURATION_S, ease: 'easeOut' });
    return () => {
      controls.stop();
    };
  }, [reduceMotion, run, value]);

  return (
    <m.span aria-hidden="true" className={styles.bar}>
      {reduceMotion ? bar(run ? 1 : 0) : text}
    </m.span>
  );
}
