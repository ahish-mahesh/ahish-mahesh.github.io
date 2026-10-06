import { describe, expect, it, vi } from 'vitest';
import { execute } from './execute.ts';
import type { Command, Session, TerminalCtx } from './types.ts';

const help: Command = {
  name: 'help',
  description: 'help',
  run: (args) => [`help ${args.join(',')}`],
};
const ctx = { commands: [help] } as unknown as TerminalCtx;

describe('execute', () => {
  it('prints nothing for blank input', () => {
    expect(execute('   ', ctx, null)).toEqual([]);
  });

  it('runs the resolved command with its args', () => {
    expect(execute('HELP a "b c"', ctx, null)).toEqual(['help a,b c']);
  });

  it('reports unknown commands with a suggestion', () => {
    expect(execute('hepl', ctx, null)).toEqual([
      [{ text: 'command not found: hepl', tone: 'error' }],
      [{ text: 'did you mean help?', tone: 'muted' }],
    ]);
  });

  it('points at help when nothing is close', () => {
    expect(execute('zzzzzz', ctx, null)[1]).toEqual([
      { text: 'type help to see what is here', tone: 'muted' },
    ]);
  });

  it('reports parse errors', () => {
    expect(execute('help "x', ctx, null)).toEqual([
      [{ text: 'parse error: unterminated double quote', tone: 'error' }],
    ]);
  });

  it('hands the raw line to an active session', () => {
    const run = vi.fn(() => ['ok']);
    const session: Session = { prompt: 'postgres=# ', run };
    expect(execute('help "x', ctx, session)).toEqual(['ok']);
    expect(run).toHaveBeenCalledWith('help "x', ctx);
  });
});
