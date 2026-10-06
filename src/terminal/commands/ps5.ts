import { profile } from '../../content/profile.ts';
import type { Command } from '../types.ts';

export const ps5Command: Command = {
  name: 'ps5',
  description: 'status of the console',
  hidden: true,
  run: () => [profile.signOff],
};
