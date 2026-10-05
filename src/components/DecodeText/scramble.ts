export const GLYPHS = '!<>-_/[]{}=+*^?#%@$';

/** Deterministic first frame, so render stays pure and server and client agree. */
export function initialScramble(text: string): string {
  return Array.from(text, (ch, i) =>
    ch === ' ' ? ' ' : GLYPHS.charAt((i * 7 + 3) % GLYPHS.length),
  ).join('');
}

export function randomGlyph(): string {
  return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
}

/**
 * One frame of a left to right decode. Char i of `to` shows once
 * progress >= (i + 1) / length; before that it is a random glyph. Spaces and
 * newlines stay as they are. If the shapes differ, the longer one sets the
 * length and the shorter is padded with spaces.
 */
export function scrambleFrame(
  from: string,
  to: string,
  progress: number,
  glyph: () => string,
): string {
  const a = Array.from(from);
  const b = Array.from(to);
  const len = Math.max(a.length, b.length);
  let out = '';
  for (let i = 0; i < len; i++) {
    const target = b[i] ?? ' ';
    if (target === ' ' || target === '\n' || progress >= (i + 1) / len) {
      out += target;
    } else {
      out += glyph();
    }
  }
  return out;
}
