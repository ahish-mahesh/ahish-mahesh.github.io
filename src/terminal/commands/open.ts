import { projectButtonId, projectHash } from '../../components/sections.ts';
import { projects } from '../../content/projects.ts';
import { error, matchProject } from '../format.ts';
import type { Command } from '../types.ts';

export const openCommand: Command = {
  name: 'open',
  usage: 'open <project>',
  description: 'jump to a project on the page',
  complete: () => projects.map((p) => p.slug),
  run(args, ctx) {
    const [arg] = args;
    if (arg === undefined) return [error('usage: open <project>')];

    const match = matchProject(arg, 'open');
    if (!match.ok) return match.output;

    const { slug } = match.project;
    ctx.goTo(projectHash(slug), projectButtonId(slug));
    return [];
  },
};
