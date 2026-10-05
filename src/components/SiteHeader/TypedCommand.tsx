import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import styles from './SiteHeader.module.css';

const TYPE_INTERVAL_MS = 30;

interface TypedCommandProps {
  text: string | null;
}

/** Decorative typed-out command after the prompt. Always ends in a blinking block cursor. */
export function TypedCommand({ text }: TypedCommandProps) {
  const reduced = useReducedMotion();
  const target = text ?? '';
  // Progress is tagged with the text it belongs to, so a new text restarts at 0
  // without a synchronous setState in the effect.
  const [progress, setProgress] = useState({ text: '', count: 0 });

  useEffect(() => {
    if (reduced || target.length === 0) return undefined;
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      setProgress({ text: target, count });
      if (count >= target.length) clearInterval(id);
    }, TYPE_INTERVAL_MS);
    return () => {
      clearInterval(id);
      setProgress({ text: '', count: 0 });
    };
  }, [target, reduced]);

  const shown = reduced ? target : progress.text === target ? target.slice(0, progress.count) : '';

  return (
    <span aria-hidden="true">
      <span className={styles.typed}>{shown}</span>
      <span className={styles.cursor}>▌</span>
    </span>
  );
}
