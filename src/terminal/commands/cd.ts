import { sectionIds } from '../../components/sections.ts';
import { error, muted } from '../format.ts';
import { suggest } from '../parser.ts';
import type { Command } from '../types.ts';

const SECTIONS: readonly string[] = sectionIds.filter((id) => id !== 'top');
const HOME = ['', '~', '..', '.', '/', '../'];

export const cdCommand: Command = {
  name: 'cd',
  usage: 'cd <section>',
  description: 'scroll to a section',
  complete: () => SECTIONS,
  run(args, ctx) {
    const [arg = ''] = args;
    if (HOME.includes(arg)) {
      ctx.goTo('#top');
      return [];
    }

    const target = arg.replace(/\/+$/, '').toLowerCase();
    if (SECTIONS.includes(target)) {
      ctx.goTo(`#${target}`);
      return [];
    }

    const guess = suggest(target, SECTIONS);
    return [
      error(`cd: no such directory: ${arg}`),
      muted(guess === undefined ? `try: ${SECTIONS.join(' ')}` : `did you mean ${guess}?`),
    ];
  },
};
