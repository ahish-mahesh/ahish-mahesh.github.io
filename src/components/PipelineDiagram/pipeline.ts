/** JetBrains Mono advance width, in em. */
export const CH = 0.6;
/** Line height in em: matches `--rhythm` (1.5rem) at a 16px font. */
export const LH = 1.5;

export type Point = readonly [col: number, row: number];

export interface Sub {
  text: string;
  col: number;
  row: number;
}

export interface PipelineNode {
  id: string;
  label: string;
  col: number;
  row: number;
  sub?: Sub;
}

export interface PipelineEdge {
  id: string;
  points: readonly Point[];
  label?: Sub;
}

export const x = (col: number): number => col * CH;
export const y = (row: number): number => row * LH;

/** Centre of a grid cell, for edge endpoints. */
export const px = ([col, row]: Point): readonly [number, number] => [x(col), y(row + 0.5)];

export interface Layout {
  id: 'wide' | 'narrow';
  cols: number;
  rows: number;
  nodes: readonly PipelineNode[];
  edges: readonly PipelineEdge[];
}

export const viewBox = (l: Layout): string => `0 0 ${String(x(l.cols))} ${String(y(l.rows))}`;

/** Arrowhead length in user units; the tip sits at the end of the edge. */
export const ARROW = 0.5;
export const PACKET_R = 0.2;
/** Space between a packet and the arrowhead it stops at. */
const PACKET_GAP = 0.1;

function toPath(coords: readonly (readonly [number, number])[]): string {
  return coords
    .map(([cx, cy], i) => `${i === 0 ? 'M' : 'L'}${cx.toFixed(2)} ${cy.toFixed(2)}`)
    .join(' ');
}

export function edgePath(points: readonly Point[]): string {
  return toPath(points.map(px));
}

/** The edge minus its arrowhead, so a packet stops just short of the arrow. */
export function packetPath(points: readonly Point[]): string {
  const coords = points.map(px);
  const end = coords.at(-1);
  const prev = coords.at(-2);
  if (!end || !prev) return toPath(coords);
  const len = Math.hypot(end[0] - prev[0], end[1] - prev[1]);
  const cut = Math.min(len, ARROW * 0.9 + PACKET_R + PACKET_GAP);
  const k = (len - cut) / len;
  const stop = [prev[0] + (end[0] - prev[0]) * k, prev[1] + (end[1] - prev[1]) * k] as const;
  return toPath([...coords.slice(0, -1), stop]);
}

const wideNodes: readonly PipelineNode[] = [
  { id: 'mic', label: 'mic', col: 0, row: 0 },
  {
    id: 'capture',
    label: 'AudioCapture',
    col: 8,
    row: 0,
    sub: { text: '(RtAudio/PA)', col: 8, row: 1 },
  },
  { id: 'ring', label: 'ring buffer', col: 25, row: 0 },
  {
    id: 'whisper',
    label: 'WhisperTranscriber',
    col: 41,
    row: 0,
    sub: { text: '(whisper.cpp)', col: 41, row: 1 },
  },
  {
    id: 'llm',
    label: 'LLMClient',
    col: 41,
    row: 6,
    sub: { text: '(llama.cpp, Qwen 2.5 0.5B)', col: 51, row: 6 },
  },
  { id: 'summary', label: 'summary', col: 29, row: 6 },
  { id: 'db', label: 'DBHelper', col: 16, row: 6 },
  { id: 'sqlite', label: 'SQLite', col: 5, row: 6 },
];

const wideEdges: readonly PipelineEdge[] = [
  {
    id: 'mic-capture',
    points: [
      [3.5, 0],
      [7.5, 0],
    ],
  },
  {
    id: 'capture-ring',
    points: [
      [20.5, 0],
      [24.5, 0],
    ],
  },
  {
    id: 'ring-whisper',
    points: [
      [36.5, 0],
      [40.5, 0],
    ],
  },
  {
    id: 'whisper-llm',
    points: [
      [56.5, 0.5],
      [56.5, 3],
      [45.5, 3],
      [45.5, 5.5],
    ],
    label: { text: 'transcript', col: 46, row: 4 },
  },
  {
    id: 'llm-summary',
    points: [
      [40.5, 6],
      [36.5, 6],
    ],
  },
  {
    id: 'summary-db',
    points: [
      [28.5, 6],
      [24.5, 6],
    ],
  },
  {
    id: 'db-sqlite',
    points: [
      [15.5, 6],
      [11.5, 6],
    ],
  },
];

/** The README layout: two rows, 78 columns. */
export const wide: Layout = { id: 'wide', cols: 78, rows: 7, nodes: wideNodes, edges: wideEdges };

/** Phone layout: the same pipeline as one column, top to bottom. */
const SPINE = 1.5;

const down = (id: string, from: number, to: number, label?: Sub): PipelineEdge => ({
  id,
  points: [
    [SPINE, from + 0.4],
    [SPINE, to - 0.4],
  ],
  ...(label ? { label } : {}),
});

export const narrow: Layout = {
  id: 'narrow',
  cols: 26,
  rows: 19,
  nodes: [
    { id: 'mic', label: 'mic', col: 0, row: 0 },
    {
      id: 'capture',
      label: 'AudioCapture',
      col: 0,
      row: 2,
      sub: { text: '(RtAudio/PA)', col: 0, row: 3 },
    },
    { id: 'ring', label: 'ring buffer', col: 0, row: 5 },
    {
      id: 'whisper',
      label: 'WhisperTranscriber',
      col: 0,
      row: 7,
      sub: { text: '(whisper.cpp)', col: 0, row: 8 },
    },
    {
      id: 'llm',
      label: 'LLMClient',
      col: 0,
      row: 11,
      sub: { text: '(llama.cpp, Qwen 2.5 0.5B)', col: 0, row: 12 },
    },
    { id: 'summary', label: 'summary', col: 0, row: 14 },
    { id: 'db', label: 'DBHelper', col: 0, row: 16 },
    { id: 'sqlite', label: 'SQLite', col: 0, row: 18 },
  ],
  edges: [
    down('mic-capture', 0, 2),
    down('capture-ring', 3, 5),
    down('ring-whisper', 5, 7),
    down('whisper-llm', 8, 11, { text: 'transcript', col: 3, row: 9.5 }),
    down('llm-summary', 12, 14),
    down('summary-db', 14, 16),
    down('db-sqlite', 16, 18),
  ],
};
