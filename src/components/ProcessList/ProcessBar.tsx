import { useEffect, useRef } from 'react';
import { animate, m, useInView, useMotionValue, useTransform } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { bar } from './bar.ts';
import styles from './ProcessList.module.css';

const DURATION_S = 0.8;
const STAGGER_S = 0.1;

interface ProcessBarProps {
  index: number;
}

/** Every process here is complete, so the bar always fills from empty to full. */
export function ProcessBar({ index }: ProcessBarProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const value = useMotionValue(0);
  const text = useTransform(value, bar);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const controls = animate(value, 1, {
      duration: DURATION_S,
      ease: 'easeOut',
      delay: index * STAGGER_S,
    });
    return () => {
      controls.stop();
    };
  }, [reduceMotion, inView, value, index]);

  return (
    <m.span ref={ref} aria-hidden="true" className={styles.bar}>
      {reduceMotion ? bar(1) : text}
    </m.span>
  );
}
