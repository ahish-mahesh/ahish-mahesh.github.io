import { describe, expect, it } from 'vitest';
import { complete, editDistance, resolve, suggest, tokenize, visibleNames } from './parser.ts';
import type { Command } from './types.ts';

function cmd(name: string, extra: Partial<Command> = {}): Command {
  return { name, description: name, run: () => [], ...extra };
}

const commands: readonly Command[] = [
  cmd('help'),
  cmd('history'),
  cmd('skills', { aliases: ['neofetch'] }),
  cmd('theme', { complete: () => ['phosphor', 'amber', 'paper'] }),
  cmd('cat', { complete: () => ['agent-notes-cpp', 'agent-goal', 'kla-pg-migration'] }),
  cmd('psql', { hidden: true }),
];

describe('tokenize', () => {
  it('splits on any whitespace and drops empties', () => {
    expect(tokenize('  cat \t agent-goal  ')).toEqual({ ok: true, argv: ['cat', 'agent-goal'] });
  });

  it('returns no words for blank input', () => {
    expect(tokenize('   ')).toEqual({ ok: true, argv: [] });
  });

  it('groups quoted words', () => {
    expect(tokenize(`echo "a b" 'c d'`)).toEqual({ ok: true, argv: ['echo', 'a b', 'c d'] });
  });

  it('joins quotes touching a word and keeps empty quotes', () => {
    expect(tokenize(`a"b c"d ''`)).toEqual({ ok: true, argv: ['ab cd', ''] });
  });

  it('honours backslash escapes outside quotes and in double quotes', () => {
    expect(tokenize(String.raw`a\ b "x\"y"`)).toEqual({ ok: true, argv: ['a b', 'x"y'] });
  });

  it('keeps backslashes literal inside single quotes', () => {
    expect(tokenize(String.raw`'a\b'`)).toEqual({ ok: true, argv: [String.raw`a\b`] });
  });

  it('reports an unterminated quote', () => {
    expect(tokenize('cat "agent')).toEqual({ ok: false, error: 'unterminated double quote' });
    expect(tokenize("cat 'agent")).toEqual({ ok: false, error: 'unterminated single quote' });
  });
});

describe('visibleNames', () => {
  it('includes aliases and leaves hidden commands out', () => {
    const names = visibleNames(commands);
    expect(names).toContain('neofetch');
    expect(names).not.toContain('psql');
  });
});

describe('resolve', () => {
  it('finds a command by name, case-insensitively, with its args', () => {
    const r = resolve(['THEME', 'paper'], commands);
    expect(r).toMatchObject({ found: true, args: ['paper'] });
    expect(r.found && r.command.name).toBe('theme');
  });

  it('finds a command by alias', () => {
    const r = resolve(['neofetch'], commands);
    expect(r.found && r.command.name).toBe('skills');
  });

  it('finds hidden commands', () => {
    expect(resolve(['psql'], commands).found).toBe(true);
  });

  it('suggests the closest visible command', () => {
    expect(resolve(['hlep'], commands)).toEqual({ found: false, name: 'hlep', suggestion: 'help' });
  });

  it('never suggests a hidden command', () => {
    expect(resolve(['psq'], commands)).toEqual({ found: false, name: 'psq' });
  });
});

describe('editDistance', () => {
  it('counts insertions, deletions and substitutions', () => {
    expect(editDistance('', 'abc')).toBe(3);
    expect(editDistance('kitten', 'sitting')).toBe(3);
  });

  it('counts an adjacent swap as one edit', () => {
    expect(editDistance('hlep', 'help')).toBe(1);
  });
});

describe('suggest', () => {
  it('returns undefined when nothing is close', () => {
    expect(suggest('zzzzzz', ['help', 'ls'])).toBeUndefined();
  });

  it('uses a tighter limit for short words', () => {
    expect(suggest('xy', ['ls'])).toBeUndefined();
    expect(suggest('ld', ['ls'])).toBe('ls');
  });

  it('prefers the closest, then the earliest', () => {
    expect(suggest('agent-note', ['agent-goal', 'agent-notes-cpp', 'agent-notes'])).toBe(
      'agent-notes',
    );
    expect(suggest('cbt', ['cat', 'cut'])).toBe('cat');
  });

  it('ignores empty input', () => {
    expect(suggest('', ['ls'])).toBeUndefined();
  });
});

describe('complete', () => {
  it('fills a unique command with a trailing space', () => {
    expect(complete('ski', commands)).toEqual({ value: 'skills ', candidates: [] });
  });

  it('completes aliases', () => {
    expect(complete('neo', commands)).toEqual({ value: 'neofetch ', candidates: [] });
  });

  it('extends to the common prefix', () => {
    expect(complete('cat a', commands)).toEqual({ value: 'cat agent-', candidates: [] });
  });

  it('lists candidates when the prefix cannot grow', () => {
    expect(complete('h', commands)).toEqual({ value: 'h', candidates: ['help', 'history'] });
  });

  it('completes arguments, keeping what came before', () => {
    expect(complete('theme  pa', commands)).toEqual({ value: 'theme  paper ', candidates: [] });
  });

  it('lists every argument after a trailing space', () => {
    expect(complete('theme ', commands).candidates).toEqual(['phosphor', 'amber', 'paper']);
  });

  it('leaves hidden commands and unknown words alone', () => {
    expect(complete('ps', commands)).toEqual({ value: 'ps', candidates: [] });
    expect(complete('help x', commands)).toEqual({ value: 'help x', candidates: [] });
  });

  it('matches case-insensitively but uses the candidate spelling', () => {
    expect(complete('cat KLA', commands)).toEqual({
      value: 'cat kla-pg-migration ',
      candidates: [],
    });
  });
});
