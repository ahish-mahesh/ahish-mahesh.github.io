// Cell-averaged ASCII conversion for the 3D hero. Pure and DOM-free so it can be unit-tested.
// The character ramp is taken from three's AsciiEffect (see CREDITS.md); the sampling is not:
// AsciiEffect reads every other row of a bilinear downscale, which let thin rims and gaps
// alias in and out as the stack moved. Here every pixel of a cell contributes to its glyph.

/** Darkest to brightest. Brightness 0 is a space. */
export const RAMP = ' .:-=+*#%@';

/** G at or below this (0..255) counts as background when voting on a cell's platter. */
const LIT = 8;

/**
 * Character grid for a box of `width` x `height` CSS px. A cell is 1/res px wide and
 * 2/res px tall (the same geometry AsciiEffect used, so the static frame CSS still matches).
 */
export function gridSize(
  width: number,
  height: number,
  res = 0.15,
): { cols: number; rows: number } {
  const cols = Math.max(0, Math.floor(width * res));
  const rows = Math.max(0, Math.ceil(Math.floor(height * res) / 2));
  return { cols, rows };
}

/**
 * Platter id of one lit pixel from its colour code. Each platter's material is tinted so
 * G always carries brightness and R/B mark the platter:
 * 1 = (1,1,0), 2 = (0,1,1), 3 = (1,1,1). A channel counts as "on" above half of G.
 */
export function pixelId(r: number, g: number, b: number): number {
  if (g <= LIT) return 0;
  const hasR = r * 2 > g;
  const hasB = b * 2 > g;
  if (hasR && hasB) return 3;
  if (hasR) return 1;
  if (hasB) return 2;
  return 0;
}

/**
 * Converts an RGBA buffer (top row first) to `rows` lines of `cols` characters.
 * Each character is the average G of every pixel in its cell; each cell's id is the
 * majority platter among its lit pixels, or 0 when the cell is background or blank.
 * Pass `ids` (length cols*rows) to reuse a buffer across frames.
 */
export function asciiFromPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cols: number,
  rows: number,
  ids: Uint8Array = new Uint8Array(cols * rows),
): { lines: string[]; ids: Uint8Array } {
  const lines: string[] = [];
  const maxIdx = RAMP.length - 1;

  for (let cy = 0; cy < rows; cy++) {
    const y0 = Math.floor((cy * height) / rows);
    const y1 = Math.max(y0 + 1, Math.floor(((cy + 1) * height) / rows));
    let line = '';

    for (let cx = 0; cx < cols; cx++) {
      const x0 = Math.floor((cx * width) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((cx + 1) * width) / cols));
      let sum = 0;
      let n = 0;
      let v1 = 0;
      let v2 = 0;
      let v3 = 0;

      for (let y = y0; y < y1 && y < height; y++) {
        let i = (y * width + x0) * 4;
        for (let x = x0; x < x1 && x < width; x++, i += 4) {
          const g = data[i + 1] ?? 0;
          sum += g;
          n++;
          const id = pixelId(data[i] ?? 0, g, data[i + 2] ?? 0);
          if (id === 1) v1++;
          else if (id === 2) v2++;
          else if (id === 3) v3++;
        }
      }

      const brightness = n > 0 ? sum / n / 255 : 0;
      const ch = RAMP[Math.round(brightness * maxIdx)] ?? ' ';
      line += ch;

      let id = 0;
      if (ch !== ' ' && v1 + v2 + v3 > 0) {
        // Ties go to the higher platter, which sits in front of the lower one's rim.
        id = v3 >= v2 && v3 >= v1 ? 3 : v2 >= v1 ? 2 : 1;
      }
      ids[cy * cols + cx] = id;
    }
    lines.push(line);
  }
  return { lines, ids };
}

function escapeChar(ch: string): string {
  if (ch === '&') return '&amp;';
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  return ch;
}

/**
 * Joins lines with '\n' and wraps each contiguous run of cells whose id is `active`
 * in `<span class="${className}">`. No other markup. Runs never cross a line break.
 */
export function toHtml(
  lines: string[],
  ids: Uint8Array,
  cols: number,
  active: number,
  className: string,
): string {
  const open = `<span class="${escapeChar(className).replaceAll('"', '&quot;')}">`;
  let out = '';
  for (let r = 0; r < lines.length; r++) {
    if (r > 0) out += '\n';
    const line = lines[r] ?? '';
    let inRun = false;
    for (let c = 0; c < line.length; c++) {
      const on = active > 0 && ids[r * cols + c] === active;
      if (on && !inRun) out += open;
      else if (!on && inRun) out += '</span>';
      inRun = on;
      out += escapeChar(line.charAt(c));
    }
    if (inRun) out += '</span>';
  }
  return out;
}

/** 1-based platter lit by the colour pulse, cycling bottom to top, period/count seconds each. */
export function activePlatter(t: number, count = 3, period = 2.4): number {
  const phase = (((t / period) % 1) + 1) % 1;
  return Math.min(count, Math.floor(phase * count) + 1);
}
