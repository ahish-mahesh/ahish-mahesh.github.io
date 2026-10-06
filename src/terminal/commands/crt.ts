import { error } from '../format.ts';
import type { Command } from '../types.ts';

const USAGE = 'usage: crt on|off';

export const crtCommand: Command = {
  name: 'crt',
  usage: 'crt [on|off]',
  description: 'toggle the scanline overlay',
  complete: () => ['on', 'off'],
  run(args, ctx) {
    const [arg] = args;
    if (arg === undefined) return [`crt is ${ctx.crt ? 'on' : 'off'}. ${USAGE}`];

    const value = arg.toLowerCase();
    if (value !== 'on' && value !== 'off') return [error(USAGE)];
    ctx.setCrt(value === 'on');
    return [`crt ${value}`];
  },
};
