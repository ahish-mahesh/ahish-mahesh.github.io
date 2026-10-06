import { timelineOutput } from '../format.ts';
import type { Command } from '../types.ts';

export const experienceCommand: Command = {
  name: 'experience',
  description: 'the work timeline (also: git log)',
  run: () => timelineOutput(),
};
