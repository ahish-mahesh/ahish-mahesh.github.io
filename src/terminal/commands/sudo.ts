import { profile } from '../../content/profile.ts';
import { error } from '../format.ts';
import type { Command } from '../types.ts';

export const sudoCommand: Command = {
  name: 'sudo',
  description: 'run as someone important',
  hidden: true,
  run(args) {
    const hired =
      args.length === 2 && args[0]?.toLowerCase() === 'hire' && args[1]?.toLowerCase() === 'ahish';
    if (!hired) {
      return [error('recruiter is not in the sudoers file. this incident will be reported.')];
    }
    return [
      '[sudo] password for recruiter: ********',
      'access granted.',
      [{ text: profile.email, tone: 'accent', href: `mailto:${profile.email}` }],
    ];
  },
};
