import { profile } from '../../content/profile.ts';
import type { Command } from '../types.ts';

export const resumeCommand: Command = {
  name: 'resume',
  description: 'download resume.pdf',
  run(_args, ctx) {
    ctx.download(profile.links.resume);
    return [`downloading ${profile.links.resume.split('/').pop() ?? profile.links.resume}`];
  },
};
