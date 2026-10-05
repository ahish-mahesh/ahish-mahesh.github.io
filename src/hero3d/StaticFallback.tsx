import { STATIC_FRAME } from './staticFrame.ts';

// Wider and taller than the box (which clips it), so this text always covers the whole box.
// The live ASCII grid is then never a larger LCP candidate than this frame.
const COLS = 64;
const ROWS = 32;

function padFrame(frame: string, cols: number, rows: number): string {
  const lines = frame.split('\n');
  while (lines.length < rows) lines.push('');
  return lines.map((l) => l.padEnd(cols, ' ')).join('\n');
}

const FRAME = padFrame(STATIC_FRAME, COLS, ROWS);

/** Pre-rendered ASCII frame. Stays in the DOM and fades out once the live render has drawn. */
export function StaticFallback({ hidden, className }: { hidden: boolean; className?: string }) {
  return (
    <pre className={className} data-hidden={hidden ? 'true' : 'false'} data-testid="static-frame">
      {FRAME}
    </pre>
  );
}
