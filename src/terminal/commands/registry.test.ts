import { describe, expect, it } from 'vitest';
import { lineText, outputText } from '../format.ts';
import { complete, findCommand, visibleNames } from '../parser.ts';
import { commands } from '../registry.ts';
import { fakeCtx } from '../testCtx.ts';
import { psqlSession } from './psql.ts';

const HIDDEN = ['git', 'sudo', 'psql', 'ps5'];

describe('registry', () => {
  it('has unique names and aliases', () => {
    const all = commands.flatMap((c) => [c.name, ...(c.aliases ?? [])]);
    expect(new Set(all).size).toBe(all.length);
  });

  it('hides exactly git, sudo, psql and ps5, and lists them last', () => {
    const hidden = commands.filter((c) => c.hidden).map((c) => c.name);
    expect(hidden.sort()).toEqual([...HIDDEN].sort());
    const firstHidden = commands.findIndex((c) => c.hidden);
    expect(commands.slice(firstHidden).every((c) => c.hidden)).toBe(true);
  });

  it('gives every visible command a short lowercase description', () => {
    for (const c of commands.filter((x) => !x.hidden)) {
      expect(c.description.length, c.name).toBeGreaterThan(0);
      // Lowercase apart from the pronoun I, as in the page headings.
      const withoutPronoun = c.description.replace(/\bI\b/g, 'i');
      expect(withoutPronoun, c.name).toBe(withoutPronoun.toLowerCase());
    }
  });

  it('keeps hidden commands out of help', () => {
    const help = findCommand('help', commands);
    const lines = (help?.run([], fakeCtx()) ?? []).map(lineText);
    const labels = lines.map((l) => l.split(/ {2,}/)[0] ?? '').flatMap((l) => l.split(', '));
    for (const name of HIDDEN) expect(labels).not.toContain(name);
    for (const c of commands.filter((x) => x.hidden)) {
      expect(lines.join('\n')).not.toContain(c.description);
    }
  });

  it('keeps hidden commands out of completion', () => {
    expect(visibleNames(commands)).not.toEqual(expect.arrayContaining(HIDDEN));
    for (const name of HIDDEN) {
      expect(visibleNames(commands)).not.toContain(name);
      expect(complete(name, commands)).toEqual({ value: name, candidates: [] });
      expect(complete(name.slice(0, -1), commands).value).not.toContain(name);
    }
    expect(complete('', commands).candidates.some((c) => HIDDEN.includes(c))).toBe(false);
  });

  it('finds hidden commands by name', () => {
    for (const name of HIDDEN) expect(findCommand(name, commands)?.hidden).toBe(true);
  });

  it('never prints an em-dash', () => {
    const argSets: string[][] = [
      [],
      ['x'],
      ['projects'],
      ['agent-goal'],
      ['agent'],
      ['work'],
      ['paper'],
      ['on'],
      ['log'],
      ['hire', 'ahish'],
      ['resume.pdf'],
    ];
    for (const c of commands) {
      expect(c.description + (c.usage ?? '')).not.toContain('—');
      for (const args of argSets) {
        const out = c.run(args, fakeCtx({ history: ['help', 'whoami'] }));
        for (const line of outputText(out))
          expect(line, `${c.name} ${args.join(' ')}`).not.toContain('—');
      }
    }
    for (const input of ['', '\\dt', '\\q', 'select * from skills;', 'select * from x', 'nope']) {
      for (const line of outputText(psqlSession.run(input, fakeCtx()))) {
        expect(line).not.toContain('—');
      }
    }
  });
});
