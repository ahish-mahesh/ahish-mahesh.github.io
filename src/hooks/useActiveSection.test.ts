import { describe, expect, it } from 'vitest';
import { pickActive } from './useActiveSection.ts';

describe('pickActive', () => {
  it('returns 0 when every section is below the line', () => {
    expect(pickActive([100, 500, 900], 50, false)).toBe(0);
  });

  it('returns the last section whose top has passed the line', () => {
    expect(pickActive([-800, -200, 40, 600], 60, false)).toBe(2);
  });

  it('counts a top exactly on the line as passed', () => {
    expect(pickActive([-100, 60, 400], 60, false)).toBe(1);
  });

  it('returns the last index at the bottom of the page', () => {
    expect(pickActive([-800, -200, 300, 600], 60, true)).toBe(3);
  });

  it('skips missing (Infinity) sections', () => {
    expect(pickActive([-10, Number.POSITIVE_INFINITY], 60, false)).toBe(0);
  });
});
