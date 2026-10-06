import { describe, expect, it } from 'vitest';
import { lineText } from '../format.ts';
import { fakeCtx } from '../testCtx.ts';
import type { Command } from '../types.ts';
import { helpCommand } from './help.ts';

function cmd(name: string, extra: Partial<Command> = {}): Command {
  return { name, description: `${name} desc`, run: () => [], ...extra };
}

describe('help', () => {
  const commands = [
    cmd('help'),
    cmd('cat', { usage: 'cat <project>' }),
    cmd('skills', { aliases: ['neofetch'] }),
    cmd('psql', { hidden: true }),
  ];
  const out = helpCommand.run([], fakeCtx({ commands }));

  it('lists usage ?? name, aliases included, with the description muted', () => {
    expect(lineText(out[0] ?? '')).toBe('help              help desc');
    expect(lineText(out[1] ?? '')).toBe('cat <project>     cat desc');
    expect(lineText(out[2] ?? '')).toBe('skills, neofetch  skills desc');
    expect(out[2]).toEqual([
      { text: 'skills, neofetch  ' },
      { text: 'skills desc', tone: 'muted' },
    ]);
  });

  it('leaves hidden commands out', () => {
    expect(out.map(lineText).join('\n')).not.toContain('psql');
  });

  it('ends with the muted keyboard hint', () => {
    expect(out.at(-1)).toEqual([
      { text: 'tab completes. up/down for history. esc closes.', tone: 'muted' },
    ]);
  });

  it('lists the real visible commands by default', () => {
    const real = helpCommand.run([], fakeCtx());
    const text = real.map(lineText);
    expect(text.some((l) => l.startsWith('skills, neofetch'))).toBe(true);
    expect(text.some((l) => l.startsWith('cat <project>'))).toBe(true);
  });
});
