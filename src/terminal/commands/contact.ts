import { profile } from '../../content/profile.ts';
import { stripScheme } from '../format.ts';
import type { Command, Line } from '../types.ts';

function row(label: string, text: string, href: string): Line {
  return [
    { text: label.padEnd(10), tone: 'muted' },
    { text, href },
  ];
}

export const contactCommand: Command = {
  name: 'contact',
  description: 'email, links and availability',
  run() {
    return [
      row('email', profile.email, `mailto:${profile.email}`),
      row('linkedin', stripScheme(profile.links.linkedin), profile.links.linkedin),
      row('github', stripScheme(profile.links.github), profile.links.github),
      row(
        'resume',
        profile.links.resume.split('/').pop() ?? profile.links.resume,
        profile.links.resume,
      ),
      '',
      profile.location,
      profile.availability,
      profile.workAuthorization,
    ];
  },
};
