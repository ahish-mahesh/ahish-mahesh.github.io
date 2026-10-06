import { THEMES } from '../../theme/themes.ts';
import { error, muted } from '../format.ts';
import { suggest } from '../parser.ts';
import type { Command } from '../types.ts';

export const themeCommand: Command = {
  name: 'theme',
  usage: 'theme [name]',
  description: 'show or switch the colour theme',
  complete: () => THEMES,
  run(args, ctx) {
    const [arg] = args;
    if (arg === undefined) {
      return [`theme: ${ctx.theme}`, muted(`available: ${ctx.themes.join(' ')}`)];
    }

    const name = ctx.themes.find((t) => t === arg.toLowerCase());
    if (name === undefined) {
      const guess = suggest(arg, ctx.themes);
      return [
        error(`theme: unknown theme '${arg}'`),
        muted(
          guess === undefined ? `available: ${ctx.themes.join(' ')}` : `did you mean ${guess}?`,
        ),
      ];
    }
    ctx.setTheme(name);
    return [`theme set to ${name}`];
  },
};
