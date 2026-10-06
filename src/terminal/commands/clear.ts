import type { Command } from '../types.ts';

export const clearCommand: Command = {
  name: 'clear',
  description: 'clear the screen',
  run(_args, ctx) {
    ctx.clear();
    return [];
  },
};
