import type { Command } from './types.ts';

export type TokenizeResult =
  | { readonly ok: true; readonly argv: readonly string[] }
  | { readonly ok: false; readonly error: string };

/**
 * Split a command line into words. Whitespace separates words; single or double
 * quotes group them; a backslash escapes the next character (except inside
 * single quotes, as in sh).
 */
export function tokenize(input: string): TokenizeResult {
  const argv: string[] = [];
  let word = '';
  let inWord = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charAt(i);
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < input.length) {
        i += 1;
        word += input.charAt(i);
      } else word += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      inWord = true;
    } else if (ch === '\\') {
      if (i + 1 < input.length) {
        i += 1;
        word += input.charAt(i);
      }
      inWord = true;
    } else if (/\s/.test(ch)) {
      if (inWord) argv.push(word);
      word = '';
      inWord = false;
    } else {
      word += ch;
      inWord = true;
    }
  }

  if (quote)
    return { ok: false, error: `unterminated ${quote === '"' ? 'double' : 'single'} quote` };
  if (inWord) argv.push(word);
  return { ok: true, argv };
}

/** Names and aliases a visitor may see: the vocabulary for completion and suggestions. */
export function visibleNames(commands: readonly Command[]): string[] {
  return commands.filter((c) => !c.hidden).flatMap((c) => [c.name, ...(c.aliases ?? [])]);
}

export function findCommand(name: string, commands: readonly Command[]): Command | undefined {
  const n = name.toLowerCase();
  return commands.find((c) => c.name === n || (c.aliases ?? []).includes(n));
}

export type ResolveResult =
  | { readonly found: true; readonly command: Command; readonly args: readonly string[] }
  | { readonly found: false; readonly name: string; readonly suggestion?: string };

export function resolve(argv: readonly string[], commands: readonly Command[]): ResolveResult {
  const [name = '', ...args] = argv;
  const command = findCommand(name, commands);
  if (command) return { found: true, command, args };
  const suggestion = suggest(name, visibleNames(commands));
  return suggestion === undefined ? { found: false, name } : { found: false, name, suggestion };
}

/** Optimal string alignment distance: Levenshtein plus adjacent transpositions. */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  const at = (i: number, j: number) => d[i]?.[j] ?? 0;
  for (let i = 1; i < rows; i += 1) {
    const row = d[i];
    if (!row) continue;
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, at(i - 2, j - 2) + 1);
      }
      row[j] = best;
    }
  }
  return at(a.length, b.length);
}

/**
 * The closest candidate within a small edit distance, or undefined. Short words
 * get a tighter limit so `xy` does not "mean" `ls`. Ties go to the earlier candidate.
 */
export function suggest(word: string, candidates: readonly string[]): string | undefined {
  const w = word.toLowerCase();
  if (w.length === 0) return undefined;
  const limit = Math.min(2, Math.max(1, Math.floor(w.length / 2)));
  let best: string | undefined;
  let bestDistance = limit + 1;
  for (const c of candidates) {
    const dist = editDistance(w, c.toLowerCase());
    if (dist < bestDistance) {
      best = c;
      bestDistance = dist;
    }
  }
  return best;
}

function commonPrefix(words: readonly string[]): string {
  const [first = '', ...rest] = words;
  let end = first.length;
  for (const w of rest) {
    let i = 0;
    while (i < end && i < w.length && w[i]?.toLowerCase() === first[i]?.toLowerCase()) i += 1;
    end = i;
  }
  return first.slice(0, end);
}

export interface Completion {
  /** The new input value. Unchanged when there is nothing to add. */
  readonly value: string;
  /** Set when several candidates remain and nothing could be added: print them. */
  readonly candidates: readonly string[];
}

/**
 * Tab completion. The first word completes against visible command names and
 * aliases; later words use the command's own `complete()`. One match is filled in
 * with a trailing space; several are filled to their common prefix.
 */
export function complete(input: string, commands: readonly Command[]): Completion {
  const words = input.trimStart().split(/\s+/);
  const current = words[words.length - 1] ?? '';
  const before = input.slice(0, input.length - current.length);
  const unchanged: Completion = { value: input, candidates: [] };

  let pool: readonly string[];
  if (words.length <= 1) {
    pool = visibleNames(commands);
  } else {
    const command = findCommand(words[0] ?? '', commands);
    if (!command?.complete) return unchanged;
    pool = command.complete(words.slice(1, -1));
  }

  const lower = current.toLowerCase();
  const matches = [...new Set(pool.filter((p) => p.toLowerCase().startsWith(lower)))];
  const [only] = matches;
  if (only === undefined) return unchanged;
  if (matches.length === 1) return { value: `${before}${only} `, candidates: [] };

  const prefix = commonPrefix(matches);
  if (prefix.length > current.length) return { value: `${before}${prefix}`, candidates: [] };
  return { value: input, candidates: matches };
}
