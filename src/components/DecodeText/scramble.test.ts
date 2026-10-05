import { describe, expect, it } from 'vitest';
import { scrambleFrame } from './scramble.ts';

const hash = () => '#';

describe('scrambleFrame', () => {
  it('resolves nothing at progress 0', () => {
    expect(scrambleFrame('abcd', 'wxyz', 0, hash)).toBe('####');
  });

  it('returns the target at progress 1', () => {
    expect(scrambleFrame('abcd', 'wxyz', 1, hash)).toBe('wxyz');
  });

  it('keeps spaces and newlines', () => {
    expect(scrambleFrame('a b\nc', 'x y\nz', 0, hash)).toBe('# #\n#');
  });

  it('resolves a left prefix at partial progress', () => {
    expect(scrambleFrame('abcd', 'wxyz', 0.5, hash)).toBe('wx##');
  });

  it('pads to the longer length when shapes differ', () => {
    expect(scrambleFrame('abcdef', 'xy', 0, hash)).toBe('##    ');
  });
});
