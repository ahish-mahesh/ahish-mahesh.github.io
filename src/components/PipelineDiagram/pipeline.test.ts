import { describe, expect, it } from 'vitest';
import {
  ARROW,
  CH,
  LH,
  PACKET_R,
  edgePath,
  narrow,
  packetPath,
  viewBox,
  wide,
  x,
  y,
} from './pipeline.ts';

describe('pipeline geometry', () => {
  it('converts grid units to em', () => {
    expect(x(10)).toBeCloseTo(10 * CH);
    expect(y(4)).toBeCloseTo(4 * LH);
  });

  it.each([wide, narrow])('$id viewBox covers every node and sub-label', (layout) => {
    const { cols: COLS, rows: ROWS, nodes } = layout;
    expect(viewBox(layout)).toBe(`0 0 ${String(x(COLS))} ${String(y(ROWS))}`);
    for (const n of nodes) {
      expect(n.col + n.label.length).toBeLessThanOrEqual(COLS);
      expect(n.row).toBeLessThan(ROWS);
      if (n.sub) expect(n.sub.col + n.sub.text.length).toBeLessThanOrEqual(COLS);
    }
  });

  it.each([wide, narrow])('$id edges have at least two points inside the grid', (layout) => {
    const { cols: COLS, rows: ROWS, edges } = layout;
    for (const e of edges) {
      expect(e.points.length).toBeGreaterThanOrEqual(2);
      for (const [col, row] of e.points) {
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThanOrEqual(COLS);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThanOrEqual(ROWS);
      }
    }
  });

  it('narrow layout has the same nodes and edges as wide', () => {
    expect(narrow.nodes.map((n) => n.id).sort()).toEqual(wide.nodes.map((n) => n.id).sort());
    expect(narrow.edges.map((e) => e.id)).toEqual(wide.edges.map((e) => e.id));
  });

  it('builds an SVG path from points', () => {
    expect(
      edgePath([
        [0, 0],
        [10, 0],
      ]),
    ).toBe('M0.00 0.75 L6.00 0.75');
  });

  it('stops packets short of the arrowhead', () => {
    expect(
      packetPath([
        [0, 0],
        [10, 0],
      ]),
    ).toBe(`M0.00 0.75 L${(6 - ARROW * 0.9 - PACKET_R - 0.1).toFixed(2)} 0.75`);
  });
});
