import { useEffect, useRef } from 'react';
import { animate, m, useInView, useMotionValue, useTransform } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { bar } from './bar.ts';
import styles from './ProcessList.module.css';

const DURATION_S = 0.8;
const STAGGER_S = 0.1;

interface ProcessBarProps {
  fill: number;
  index: number;
}

export function ProcessBar({ fill, index }: ProcessBarProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const value = useMotionValue(0);
  const text = useTransform(value, bar);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const controls = animate(value, fill, {
      duration: DURATION_S,
      ease: 'easeOut',
      delay: index * STAGGER_S,
    });
    return () => {
      controls.stop();
    };
  }, [reduceMotion, inView, value, fill, index]);

  return (
    <m.span ref={ref} aria-hidden="true" className={styles.bar}>
      {reduceMotion ? bar(fill) : text}
    </m.span>
  );
}
