import { muted } from '../format.ts';
import type { Command, Line } from '../types.ts';

export const helpCommand: Command = {
  name: 'help',
  description: 'list the commands',
  run(_args, ctx) {
    const rows = ctx.commands
      .filter((c) => !c.hidden)
      .map((c) => ({
        label: [c.usage ?? c.name, ...(c.aliases ?? [])].join(', '),
        description: c.description,
      }));
    const width = Math.max(...rows.map((r) => r.label.length)) + 2;
    const lines: Line[] = rows.map((r) => [
      { text: r.label.padEnd(width) },
      { text: r.description, tone: 'muted' },
    ]);
    return [...lines, '', muted('tab completes. up/down for history. esc closes.')];
  },
};
