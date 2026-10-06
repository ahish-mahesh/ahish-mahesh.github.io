import type { Command } from '../types.ts';

export const historyCommand: Command = {
  name: 'history',
  description: 'what you have typed so far',
  run(_args, ctx) {
    const width = String(ctx.history.length).length;
    return ctx.history.map((line, i) => `${String(i + 1).padStart(width)}  ${line}`);
  },
};
