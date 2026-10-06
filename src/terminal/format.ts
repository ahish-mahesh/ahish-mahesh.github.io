import { education, experience } from '../content/experience.ts';
import { projects } from '../content/projects.ts';
import type { Project } from '../content/types.ts';
import { neofetchLogo, neofetchTitle, skills } from '../content/skills.ts';
import { suggest } from './parser.ts';
import type { Line, Output, Span } from './types.ts';

export function muted(text: string): Line {
  return [{ text, tone: 'muted' }];
}

export function error(text: string): Line {
  return [{ text, tone: 'error' }];
}

/** The text of a line with tones and links stripped. */
export function lineText(line: Line): string {
  return typeof line === 'string' ? line : line.map((s) => s.text).join('');
}

export function outputText(output: Output): string[] {
  return output.map(lineText);
}

/** A URL as people read it: no scheme. */
export function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

export function plural(n: number, word: string): string {
  return `${String(n)} ${word}${n === 1 ? '' : 's'}`;
}

export type ProjectMatch =
  | { readonly ok: true; readonly project: Project }
  | { readonly ok: false; readonly output: Output };

/**
 * Find a project by exact slug, else by unique prefix (both case-insensitive).
 * On failure the output is ready to print, prefixed with `command`.
 */
export function matchProject(arg: string, command: string): ProjectMatch {
  const q = arg.toLowerCase();
  const exact = projects.find((p) => p.slug === q);
  if (exact) return { ok: true, project: exact };

  const prefixed = projects.filter((p) => p.slug.startsWith(q));
  const [only] = prefixed;
  if (only && prefixed.length === 1) return { ok: true, project: only };

  if (prefixed.length > 1) {
    return {
      ok: false,
      output: [
        error(`${command}: ${arg}: ambiguous`),
        muted(`could be ${prefixed.map((p) => p.slug).join(' ')}`),
      ],
    };
  }
  const guess = suggest(
    q,
    projects.map((p) => p.slug),
  );
  return {
    ok: false,
    output: [
      error(`${command}: ${arg}: no such project`),
      muted(guess === undefined ? 'try: ls' : `did you mean ${guess}?`),
    ],
  };
}

/** `git log --graph` as plain text, then education. Newest first, from the same data as the page. */
export function timelineOutput(): Output {
  const dateWidth = Math.max(...experience.map((e) => e.graphLabel.length));
  const headFor = (org: string, i: number) =>
    i === 0 ? `${org.toLowerCase()} (HEAD -> main)` : org.toLowerCase();
  const headWidth = Math.max(...experience.map((e, i) => headFor(e.org, i).length));
  const indent = ' '.repeat(dateWidth + 2);

  const out: Line[] = [];
  experience.forEach((e, i) => {
    const side = e.branch === 'side';
    const last = i === experience.length - 1;
    if (side && experience[i - 1]?.branch !== 'side') out.push('|\\');

    // The side branch's graph is two columns wider; take them out of the padding
    // so every entry's columns line up.
    const rail = side ? '| | ' : last ? '  ' : '| ';
    const pad = side ? indent.slice(2) : indent;
    const where = [e.role.toLowerCase(), e.location?.toLowerCase()].filter(Boolean).join(', ');
    out.push([
      { text: side ? '| * ' : '* ' },
      { text: e.graphLabel.padEnd(dateWidth - (side ? 2 : 0)), tone: 'muted' },
      { text: `  ${headFor(e.org, i).padEnd(headWidth)}  ${where}` },
    ]);
    out.push(muted(`${rail}${pad}${e.dateLabel}`));
    if (e.note) out.push(muted(`${rail}${pad}${e.note}`));
    if (e.tag) out.push([{ text: `${rail}${pad}tag: ${e.tag.text}`, tone: 'accent' }]);

    if (side && experience[i + 1]?.branch !== 'side') out.push('|/');
  });

  out.push('', 'education');
  for (const ed of education) {
    const detail = [ed.dates, ed.gpa].filter(Boolean).join(' · ');
    out.push([{ text: `  ${ed.degree}, ${ed.school}` }, { text: ` · ${detail}`, tone: 'muted' }]);
  }
  out.push('', muted('cd work for the details'));
  return out;
}

/** The logo on the left, `title`, a rule and the skill rows on the right. */
export function neofetchOutput(): Output {
  const logo = neofetchLogo.split('\n');
  const logoWidth = Math.max(...logo.map((l) => l.length));
  const keyWidth = Math.max(...skills.map((s) => s.key.length));
  const right: Span[][] = [
    [{ text: neofetchTitle, tone: 'accent' }],
    [{ text: '-'.repeat(neofetchTitle.length), tone: 'muted' }],
    ...skills.map((s): Span[] => [
      { text: s.key.padEnd(keyWidth), tone: 'accent' },
      { text: `  ${s.values.join(' · ')}` },
    ]),
  ];
  const rows = Math.max(logo.length, right.length);
  return Array.from({ length: rows }, (_, i): Line => [
    { text: (logo[i] ?? '').padEnd(logoWidth + 3), tone: 'accent' },
    ...(right[i] ?? []),
  ]);
}

function center(text: string, width: number): string {
  const space = width - text.length;
  const left = Math.floor(space / 2);
  return ' '.repeat(left) + text + ' '.repeat(space - left);
}

/** A psql-style aligned table: centred header, `-+-` rule, row-count footer. */
export function psqlTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
  title?: string,
): Output {
  const widths = headers.map((h, c) => Math.max(h.length, ...rows.map((r) => r[c]?.length ?? 0)));
  const total = widths.reduce((sum, w) => sum + w + 2, 0) + widths.length - 1;
  const lastCol = headers.length - 1;

  const out: string[] = [];
  if (title !== undefined) {
    out.push(' '.repeat(Math.max(0, Math.floor((total - title.length) / 2))) + title);
  }
  out.push(
    headers
      .map((h, c) => ` ${center(h, widths[c] ?? 0)} `)
      .join('|')
      .trimEnd(),
    widths.map((w) => '-'.repeat(w + 2)).join('+'),
  );
  for (const row of rows) {
    out.push(
      headers
        .map((_, c) => {
          const cell = row[c] ?? '';
          return ` ${c === lastCol ? cell : cell.padEnd(widths[c] ?? 0)} `;
        })
        .join('|')
        .trimEnd(),
    );
  }
  out.push(`(${plural(rows.length, 'row')})`, '');
  return out;
}
