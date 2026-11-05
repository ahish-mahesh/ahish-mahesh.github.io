// Generic illustrative query, not KLA code. Only the 1,200 queries and the
// 25% cost drop are real numbers. The rewrite shows the kind of change the
// translation layer made: Babelfish does not support MERGE, so it becomes an
// UPDATE ... FROM that Babelfish runs as T-SQL.

/** Pads every line to one width and both snippets to one line count. */
function block(lines: string[], height: number, width: number): string {
  return Array.from({ length: height }, (_, i) => (lines[i] ?? '').padEnd(width)).join('\n');
}

const HEIGHT = 6;

const TSQL = [
  'MERGE stock AS t',
  'USING incoming AS s',
  '  ON t.sku = s.sku',
  'WHEN MATCHED THEN',
  '  UPDATE SET t.qty = s.qty;',
];

const BABELFISH = [
  'UPDATE t',
  '  SET t.qty = s.qty',
  'FROM stock AS t',
  'JOIN incoming AS s',
  '  ON t.sku = s.sku;',
];

/** Longest line in either snippet. The mobile CSS sizes the code block to fit this many columns. */
export const CODE_COLS = Math.max(...[...TSQL, ...BABELFISH].map((l) => l.length));

export const migration = {
  queries: 1200,
  costBefore: 100,
  costAfter: 75,
  costDropLabel: '-25%',
  label:
    'illustrative: one query, before and after the translation layer into Babelfish-supported T-SQL',
  tsql: block(TSQL, HEIGHT, CODE_COLS),
  translated: block(BABELFISH, HEIGHT, CODE_COLS),
};
