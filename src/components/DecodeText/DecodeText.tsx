import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

const GLYPHS = '!<>-_/[]{}=+*^?#%@$';
const DURATION_MS = 900;

interface DecodeTextProps {
  text: string;
  className?: string;
}

/** Deterministic first frame, so render stays pure and server and client agree. */
function initialScramble(text: string): string {
  return Array.from(text, (ch, i) =>
    ch === ' ' ? ' ' : GLYPHS.charAt((i * 7 + 3) % GLYPHS.length),
  ).join('');
}

function randomGlyph(): string {
  return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
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
    const chars = Array.from(text);
    const start = performance.now();
    let frame = 0;

    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= DURATION_MS) {
        setDisplay(text);
        return;
      }
      setDisplay(
        chars
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            const resolveAt = ((i + 1) / chars.length) * DURATION_MS;
            return elapsed >= resolveAt ? ch : randomGlyph();
          })
          .join(''),
      );
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
