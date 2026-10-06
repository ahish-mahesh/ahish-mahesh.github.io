import { archive, projects } from '../../content/projects.ts';
import { error, muted } from '../format.ts';
import type { Command, Line } from '../types.ts';

const TARGETS = ['projects', 'projects/'];

export const lsCommand: Command = {
  name: 'ls',
  usage: 'ls [projects]',
  description: 'list projects',
  complete: () => ['projects'],
  run(args) {
    const targets = args.filter((a) => !a.startsWith('-'));
    const bad = targets.filter((t) => !TARGETS.includes(t.toLowerCase()));
    if (bad.length > 0) {
      return bad.map((t) => error(`ls: cannot access '${t}': no such file or directory`));
    }

    const width = Math.max(...projects.map((p) => p.slug.length)) + 2;
    const rows: Line[] = projects.map((p) => [
      { text: p.slug.padEnd(width) },
      { text: p.metric, tone: 'muted' },
    ]);
    return [...rows, muted(`archive: ${archive.map((a) => a.name).join(' ')}`)];
  },
};
