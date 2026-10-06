import { profile } from '../../content/profile.ts';
import type { Command } from '../types.ts';

export const emailCommand: Command = {
  name: 'email',
  description: 'open a new email to me',
  run(_args, ctx) {
    ctx.openUrl(`mailto:${profile.email}`);
    return [`opening your mail client for ${profile.email}`];
  },
};
