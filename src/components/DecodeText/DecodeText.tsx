import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { initialScramble, randomGlyph, scrambleFrame } from './scramble.ts';

const DURATION_MS = 900;

interface DecodeTextProps {
  text: string;
  className?: string;
}

/**
 * Text that decodes left to right on mount. The real text is always in the DOM
 * for assistive tech; the animated copy is aria-hidden. Monospace font keeps
 * the width fixed, so there is no layout shift.
 */
export function DecodeText({ text, className }: DecodeTextProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(() => (reduced ? text : initialScramble(text)));

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let frame = 0;

    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= DURATION_MS) {
        setDisplay(text);
        return;
      }
      setDisplay(scrambleFrame(text, text, elapsed / DURATION_MS, randomGlyph));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [text, reduced]);

  return (
    <>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true" className={className}>
        {reduced ? text : display}
      </span>
    </>
  );
}
