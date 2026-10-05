import { describe, expect, it } from 'vitest';
import { damp, FrameStats, lerp, shouldDemote, shouldRender } from './motion.ts';

function countRenders(stepMs: number, totalMs: number): number {
  let last = 0;
  let count = 0;
  for (let now = stepMs; now <= totalMs; now += stepMs) {
    if (shouldRender(now, last)) {
      count++;
      last = now;
    }
  }
  return count;
}

describe('shouldRender', () => {
  it('renders every second frame at 60Hz', () => {
    expect(shouldRender(16.7, 0)).toBe(false);
    expect(shouldRender(33.3, 0)).toBe(true);
    const n = countRenders(1000 / 60, 1000);
    expect(n).toBeGreaterThanOrEqual(29);
    expect(n).toBeLessThanOrEqual(30);
  });

  it('holds about 30fps at 144Hz', () => {
    const n = countRenders(1000 / 144, 1000);
    expect(n).toBeGreaterThanOrEqual(26);
    expect(n).toBeLessThanOrEqual(31);
  });

  it('honours a custom fps', () => {
    expect(shouldRender(100, 0, 10)).toBe(true);
    expect(shouldRender(50, 0, 10)).toBe(false);
  });
});

describe('lerp and damp', () => {
  it('lerps between endpoints', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('converges on the target', () => {
    let v = 0;
    for (let i = 0; i < 200; i++) v = damp(v, 1, 5, 1 / 60);
    expect(v).toBeCloseTo(1, 4);
  });

  it('two half steps match one full step', () => {
    const full = damp(0, 1, 6, 0.1);
    const half = damp(damp(0, 1, 6, 0.05), 1, 6, 0.05);
    expect(half).toBeCloseTo(full, 10);
  });

  it('does not move at dt 0', () => {
    expect(damp(3, 9, 6, 0)).toBe(3);
  });
});

describe('FrameStats', () => {
  it('has mean 0 and is not full when empty', () => {
    const s = new FrameStats(3);
    expect(s.mean).toBe(0);
    expect(s.full).toBe(false);
  });

  it('averages the samples present', () => {
    const s = new FrameStats(4);
    s.push(2);
    s.push(4);
    expect(s.mean).toBe(3);
    expect(s.full).toBe(false);
  });

  it('overwrites the oldest sample once full', () => {
    const s = new FrameStats(3);
    s.push(1);
    s.push(2);
    s.push(3);
    expect(s.full).toBe(true);
    expect(s.mean).toBe(2);
    s.push(10);
    expect(s.mean).toBeCloseTo((10 + 2 + 3) / 3, 10);
    s.push(10);
    expect(s.mean).toBeCloseTo((10 + 10 + 3) / 3, 10);
  });

  it('resets', () => {
    const s = new FrameStats(2);
    s.push(5);
    s.push(5);
    s.reset();
    expect(s.mean).toBe(0);
    expect(s.full).toBe(false);
    s.push(1);
    expect(s.mean).toBe(1);
  });
});

describe('shouldDemote', () => {
  it('waits for a full window', () => {
    const s = new FrameStats(3);
    s.push(50);
    expect(shouldDemote(s)).toBe(false);
  });

  it('demotes only when the mean is over the limit', () => {
    const s = new FrameStats(2);
    s.push(8);
    s.push(8);
    expect(shouldDemote(s)).toBe(false);
    s.push(9);
    s.push(9);
    expect(shouldDemote(s)).toBe(true);
    expect(shouldDemote(s, 20)).toBe(false);
  });
});
