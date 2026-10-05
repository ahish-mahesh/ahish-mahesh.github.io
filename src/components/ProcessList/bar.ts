const BAR_WIDTH = 18;

/** Fixed-width bar, so the string length never changes while it fills. */
export function bar(fill: number): string {
  const n = Math.round(fill * BAR_WIDTH);
  return `[${'|'.repeat(n)}${' '.repeat(BAR_WIDTH - n)}]`;
}
