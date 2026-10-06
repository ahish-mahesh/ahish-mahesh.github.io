import { neofetchOutput } from '../format.ts';
import type { Command } from '../types.ts';

export const skillsCommand: Command = {
  name: 'skills',
  aliases: ['neofetch'],
  description: 'what I reach for',
  run: () => neofetchOutput(),
};
