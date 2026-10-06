import type { Command } from '../types.ts';

export const exitCommand: Command = {
  name: 'exit',
  description: 'close the terminal',
  run(_args, ctx) {
    ctx.close();
    return [];
  },
};
