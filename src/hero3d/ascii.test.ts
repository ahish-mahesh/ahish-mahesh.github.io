import { describe, expect, it } from 'vitest';
import { activePlatter, asciiFromPixels, gridSize, pixelId, RAMP, toHtml } from './ascii.ts';

type Rgb = readonly [number, number, number];

/** RGBA buffer of `w` x `h`, every pixel coloured by `at(x, y)`. */
function pixels(w: number, h: number, at: (x: number, y: number) => Rgb): Uint8ClampedArray {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, b] = at(x, y);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  return data;
}

const P1 = (g: number): Rgb => [g, g, 0];
const P2 = (g: number): Rgb => [0, g, g];
const P3 = (g: number): Rgb => [g, g, g];
const BG: Rgb = [0, 0, 0];

describe('gridSize', () => {
  it('matches the AsciiEffect cell geometry', () => {
    expect(gridSize(370, 370)).toEqual({ cols: 55, rows: 28 });
    expect(gridSize(400, 300, 0.1)).toEqual({ cols: 40, rows: 15 });
  });

  it('is empty for an empty box', () => {
    expect(gridSize(0, 0)).toEqual({ cols: 0, rows: 0 });
  });
});

describe('pixelId', () => {
  it('decodes each platter from R and B relative to G', () => {
    expect(pixelId(...P1(200))).toBe(1);
    expect(pixelId(...P2(200))).toBe(2);
    expect(pixelId(...P3(200))).toBe(3);
  });

  it('survives dim pixels and blending with the background', () => {
    expect(pixelId(...P1(30))).toBe(1);
    expect(pixelId(...P2(30))).toBe(2);
    expect(pixelId(...P3(30))).toBe(3);
  });

  it('treats near-black as background', () => {
    expect(pixelId(...BG)).toBe(0);
    expect(pixelId(5, 5, 5)).toBe(0);
  });
});

describe('asciiFromPixels', () => {
  it('maps brightness onto the ramp and leaves background as spaces', () => {
    // 3 cells across, 1 row; cells are 2x4 px.
    const data = pixels(6, 4, (x) => (x < 2 ? BG : x < 4 ? P3(255) : P3(128)));
    const { lines, ids } = asciiFromPixels(data, 6, 4, 3, 1);
    expect(lines).toEqual([` ${RAMP.at(-1) ?? ''}${RAMP[Math.round((128 / 255) * 9)] ?? ''}`]);
    expect([...ids]).toEqual([0, 3, 3]);
  });

  it('averages every row of a cell, including the ones AsciiEffect skipped', () => {
    // One cell, 1 px wide and 4 px tall. Only odd rows are lit, so a reader that takes
    // every other row from the top would see black.
    const data = pixels(1, 4, (_x, y) => (y % 2 === 1 ? P3(255) : BG));
    const { lines } = asciiFromPixels(data, 1, 4, 1, 1);
    expect(lines[0]).toBe(RAMP[Math.round(0.5 * 9)]);
  });

  it('is stable when a thin line moves within a cell', () => {
    const at = (row: number) => pixels(2, 8, (_x, y) => (y === row ? P3(255) : BG));
    const first = asciiFromPixels(at(1), 2, 8, 1, 1).lines[0];
    for (let row = 0; row < 8; row++) {
      expect(asciiFromPixels(at(row), 2, 8, 1, 1).lines[0]).toBe(first);
    }
  });

  it('gives a cell to the platter that covers most of its lit pixels', () => {
    // 4x4 cell: 10 px platter 2, 4 px platter 1, 2 px background.
    const data = pixels(4, 4, (x, y) => {
      const n = y * 4 + x;
      if (n < 2) return BG;
      if (n < 6) return P1(200);
      return P2(200);
    });
    expect([...asciiFromPixels(data, 4, 4, 1, 1).ids]).toEqual([2]);
  });

  it('marks blank cells as id 0 even with a few faint lit pixels', () => {
    const data = pixels(4, 4, (x, y) => (x === 0 && y === 0 ? P1(20) : BG));
    const { lines, ids } = asciiFromPixels(data, 4, 4, 1, 1);
    expect(lines[0]).toBe(' ');
    expect(ids[0]).toBe(0);
  });

  it('lays ids out row-major and reuses a passed buffer', () => {
    const data = pixels(4, 4, (x, y) => (y < 2 ? (x < 2 ? P1(255) : P2(255)) : P3(255)));
    const buf = new Uint8Array(4);
    const { ids } = asciiFromPixels(data, 4, 4, 2, 2, buf);
    expect(ids).toBe(buf);
    expect([...ids]).toEqual([1, 2, 3, 3]);
  });

  it('handles sizes that are not a multiple of the grid', () => {
    const data = pixels(7, 5, () => P3(255));
    const { lines, ids } = asciiFromPixels(data, 7, 5, 3, 2);
    expect(lines).toEqual(['@@@', '@@@']);
    expect([...ids]).toEqual([3, 3, 3, 3, 3, 3]);
  });
});

describe('toHtml', () => {
  const ids = Uint8Array.from([1, 1, 2, 0, 2, 2, 2, 1]);

  it('wraps contiguous runs of the active platter, per line', () => {
    expect(toHtml(['ab:.', '=+*#'], ids, 4, 2, 'on')).toBe(
      'ab<span class="on">:</span>.\n<span class="on">=+*</span>#',
    );
    expect(toHtml(['ab:.', '=+*#'], ids, 4, 1, 'on')).toBe(
      '<span class="on">ab</span>:.\n=+*<span class="on">#</span>',
    );
  });

  it('emits plain text when nothing is active', () => {
    expect(toHtml(['ab:.', '=+*#'], ids, 4, 0, 'on')).toBe('ab:.\n=+*#');
    expect(toHtml(['ab:.', '=+*#'], ids, 4, 3, 'on')).toBe('ab:.\n=+*#');
  });

  it('escapes markup characters', () => {
    expect(toHtml(['<&>'], Uint8Array.from([0, 0, 0]), 3, 1, 'on')).toBe('&lt;&amp;&gt;');
  });
});

describe('activePlatter', () => {
  it('cycles bottom to top, period / count seconds each', () => {
    const seq = [0, 0.5, 0.9, 1.3, 1.7, 2.3, 2.5, 3.3].map((t) => activePlatter(t));
    expect(seq).toEqual([1, 1, 2, 2, 3, 3, 1, 2]);
  });

  it('stays in range for any time', () => {
    for (let t = -5; t < 20; t += 0.037) {
      const p = activePlatter(t);
      expect(p).toBeGreaterThanOrEqual(1);
      expect(p).toBeLessThanOrEqual(3);
    }
  });
});
