import { useEffect, useState } from 'react';

/**
 * Index of the section the reader is in: the last one whose top has reached
 * `line`. Falls back to 0, and to the last section when scrolled to the bottom
 * (short final sections never reach the line otherwise).
 */
export function pickActive(tops: readonly number[], line: number, atBottom: boolean): number {
  if (atBottom) return Math.max(tops.length - 1, 0);
  let active = 0;
  tops.forEach((top, i) => {
    if (top <= line) active = i;
  });
  return active;
}

/** The reading line sits this far down the viewport. */
const LINE_FRACTION = 0.4;

/** Id of the section currently in focus. */
export function useActiveSection<T extends string>(ids: readonly [T, ...T[]]): T {
  const [index, setIndex] = useState(0);
  const key = ids.join('|');

  useEffect(() => {
    const list = key.split('|');
    let frame = 0;

    const compute = () => {
      frame = 0;
      const line = window.innerHeight * LINE_FRACTION;
      const tops = list.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      });
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setIndex(pickActive(tops, line, atBottom));
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [key]);

  return ids[index] ?? ids[0];
}
