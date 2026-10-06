import { profile } from '../../content/profile.ts';
import { muted } from '../format.ts';
import type { Command } from '../types.ts';

export const whoamiCommand: Command = {
  name: 'whoami',
  description: 'a short bio',
  run() {
    return [
      [{ text: profile.name, tone: 'accent' }],
      profile.oneLiner,
      profile.background,
      profile.status,
      '',
      profile.availability,
      muted('contact has the links.'),
    ];
  },
};
