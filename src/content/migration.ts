// Generic illustrative query, not KLA code. Only the 1,200 queries and the
// 25% cost drop are real numbers.

/** Pads every line to one width and both snippets to one line count. */
function block(lines: string[], height: number, width: number): string {
  return Array.from({ length: height }, (_, i) => (lines[i] ?? '').padEnd(width)).join('\n');
}

const HEIGHT = 6;

const TSQL = [
  'SELECT TOP 10 o.id,',
  "       ISNULL(o.note, '') AS note",
  'FROM orders o WITH (NOLOCK)',
  'WHERE o.created > DATEADD(day, -7, GETDATE());',
];

const POSTGRES = [
  'SELECT o.id,',
  "       COALESCE(o.note, '') AS note",
  'FROM orders o',
  "WHERE o.created > now() - interval '7 days'",
  'LIMIT 10;',
];

/** Longest line in either snippet. The mobile CSS sizes the code block to fit this many columns. */
export const CODE_COLS = Math.max(...[...TSQL, ...POSTGRES].map((l) => l.length));

export const migration = {
  queries: 1200,
  costBefore: 100,
  costAfter: 75,
  costDropLabel: '-25%',
  label: 'illustrative: one query, as T-SQL and as PostgreSQL',
  tsql: block(TSQL, HEIGHT, CODE_COLS),
  postgres: block(POSTGRES, HEIGHT, CODE_COLS),
};
