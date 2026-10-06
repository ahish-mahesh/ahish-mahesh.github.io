import { error } from '../format.ts';
import type { Command } from '../types.ts';
import { experienceCommand } from './experience.ts';

export const gitCommand: Command = {
  name: 'git',
  description: 'git log, as the timeline',
  hidden: true,
  run(args, ctx) {
    const [sub] = args;
    if (sub === undefined) return [error('usage: git log')];
    if (sub.toLowerCase() === 'log') return experienceCommand.run([], ctx);
    return [error(`git: '${sub}' is not a git command. try: git log`)];
  },
};
