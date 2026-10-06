import { describe, expect, it } from 'vitest';
import { projects } from '../content/projects.ts';
import {
  error,
  lineText,
  matchProject,
  muted,
  outputText,
  plural,
  psqlTable,
  stripScheme,
  timelineOutput,
} from './format.ts';

describe('line helpers', () => {
  it('builds toned lines', () => {
    expect(muted('a')).toEqual([{ text: 'a', tone: 'muted' }]);
    expect(error('a')).toEqual([{ text: 'a', tone: 'error' }]);
  });

  it('flattens lines to text', () => {
    expect(lineText('plain')).toBe('plain');
    expect(lineText([{ text: 'a' }, { text: 'b', tone: 'muted', href: '/x' }])).toBe('ab');
    expect(outputText(['x', [{ text: 'y' }]])).toEqual(['x', 'y']);
  });

  it('strips url schemes', () => {
    expect(stripScheme('https://github.com/a')).toBe('github.com/a');
    expect(stripScheme('http://a.b')).toBe('a.b');
    expect(stripScheme('/resume.pdf')).toBe('/resume.pdf');
  });

  it('pluralises', () => {
    expect(plural(1, 'row')).toBe('1 row');
    expect(plural(0, 'row')).toBe('0 rows');
    expect(plural(8, 'row')).toBe('8 rows');
  });
});

describe('matchProject', () => {
  it('prefers an exact slug over a prefix', () => {
    const slug = projects[0]?.slug ?? '';
    expect(matchProject(slug.toUpperCase(), 'cat')).toMatchObject({
      ok: true,
      project: { slug },
    });
  });

  it('accepts a unique prefix', () => {
    expect(matchProject('kla', 'open')).toMatchObject({
      ok: true,
      project: { slug: 'kla-pg-migration' },
    });
  });

  it('names the command in failures', () => {
    const r = matchProject('zzzzzz', 'open');
    expect(r.ok).toBe(false);
    expect(!r.ok && lineText(r.output[0] ?? '')).toBe('open: zzzzzz: no such project');
  });
});

describe('psqlTable', () => {
  it('centres headers, rules with -+-, and counts rows', () => {
    expect(
      psqlTable(
        ['a', 'bbb'],
        [
          ['xxxxx', '1'],
          ['y', '22'],
        ],
      ),
    ).toEqual(['   a   | bbb', '-------+-----', ' xxxxx | 1', ' y     | 22', '(2 rows)', '']);
  });

  it('centres a title over the table and uses the singular', () => {
    const out = psqlTable(['abcdefgh'], [['1']], 'Title');
    expect(out[0]).toBe('  Title');
    expect(out.at(-2)).toBe('(1 row)');
  });
});

describe('timelineOutput', () => {
  it('is newest first and ends with a hint', () => {
    const text = outputText(timelineOutput());
    expect(text[0]).toMatch(/^\* 2026-05 {2}vffice \(HEAD -> main\)/);
    expect(text.at(-1)).toBe('cd work for the details');
  });
});
