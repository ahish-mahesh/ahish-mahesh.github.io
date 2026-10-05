import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { activePlatter, asciiFromPixels, gridSize, toHtml } from './ascii.ts';

/** Readback pixels per character cell. Cells are 1:2, so 4x8 keeps them square-ish. */
const SUB_X = 4;
const SUB_Y = 8;

interface AsciiPassProps {
  /** Writes the frame's markup into the <pre> that lives outside the WebGL canvas. */
  write: (html: string) => void;
  /** Class for runs of the pulsing platter. */
  activeClass: string;
  resolution: number;
  /** Log the first frame as plain text (DEV ?snapshot). */
  snapshot?: boolean;
}

/**
 * Renders the scene, reads it back at a small size and hands cell-averaged ASCII to `write`,
 * only when the markup changed.
 * Positive priority, so R3F skips its own render and this is the only one per frame.
 */
export function AsciiPass({ write, activeClass, resolution, snapshot = false }: AsciiPassProps) {
  const size = useThree((s) => s.size);
  const { cols, rows } = gridSize(size.width, size.height, resolution);

  // Reused across frames: one 2D canvas for the readback and one id buffer per grid size.
  const buf = useRef<{
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    ids: Uint8Array;
    html: string;
    logged: boolean;
  }>({ canvas: null, ctx: null, ids: new Uint8Array(0), html: '', logged: false });

  useFrame(({ gl, scene, camera, clock }) => {
    gl.render(scene, camera);

    const w = cols * SUB_X;
    const h = rows * SUB_Y;
    if (w === 0 || h === 0) return;

    const b = buf.current;
    if (!b.canvas) {
      b.canvas = document.createElement('canvas');
      b.ctx = b.canvas.getContext('2d', { willReadFrequently: true });
    }
    const { canvas, ctx } = b;
    if (!ctx) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (b.ids.length !== cols * rows) b.ids = new Uint8Array(cols * rows);

    // Same task as the render, so the drawing buffer is still intact without preserveDrawingBuffer.
    ctx.drawImage(gl.domElement, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    const { lines, ids } = asciiFromPixels(data, w, h, cols, rows, b.ids);

    if (snapshot && !b.logged) {
      b.logged = true;
      console.log(lines.join('\n'));
    }

    const html = toHtml(lines, ids, cols, activePlatter(clock.elapsedTime), activeClass);
    if (html !== b.html) {
      b.html = html;
      write(html);
    }
  }, 1);

  return null;
}
