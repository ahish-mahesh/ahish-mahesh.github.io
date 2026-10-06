import { projects } from '../../content/projects.ts';
import { error, matchProject, muted, stripScheme } from '../format.ts';
import type { Command, Line } from '../types.ts';

export const catCommand: Command = {
  name: 'cat',
  usage: 'cat <project>',
  description: 'show a project',
  complete: () => projects.map((p) => p.slug),
  run(args) {
    const [arg] = args;
    if (arg === undefined) return [error('usage: cat <project>')];
    if (arg.toLowerCase() === 'resume.pdf') {
      return [error('cat: resume.pdf: binary file. try: resume')];
    }

    const match = matchProject(arg, 'cat');
    if (!match.ok) return match.output;
    const { project } = match;

    const lines: Line[] = [
      [{ text: project.title, tone: 'accent' }],
      project.summary,
      '',
      `stack: ${(project.fullStack ?? project.stack).join(' · ')}`,
    ];
    if (project.repo) {
      lines.push([
        { text: 'repo:  ', tone: 'muted' },
        { text: stripScheme(project.repo), href: project.repo },
      ]);
    }
    lines.push('', muted(`open ${project.slug} jumps to it on the page.`));
    return lines;
  },
};
