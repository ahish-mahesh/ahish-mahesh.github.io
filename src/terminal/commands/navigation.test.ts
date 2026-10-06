import { describe, expect, it } from 'vitest';
import { projectButtonId, projectHash, sectionIds } from '../../components/sections.ts';
import { archive, projects } from '../../content/projects.ts';
import { lineText, outputText } from '../format.ts';
import { fakeCtx } from '../testCtx.ts';
import type { Line } from '../types.ts';
import { catCommand } from './cat.ts';
import { cdCommand } from './cd.ts';
import { lsCommand } from './ls.ts';
import { openCommand } from './open.ts';

function tones(line: Line | undefined): (string | undefined)[] {
  return typeof line === 'string' || line === undefined ? [] : line.map((s) => s.tone);
}

describe('ls', () => {
  it('lists every featured project with its metric, then the archive', () => {
    const out = outputText(lsCommand.run([], fakeCtx()));
    for (const p of projects) {
      expect(out.some((l) => l.startsWith(p.slug) && l.endsWith(p.metric))).toBe(true);
    }
    expect(out.at(-1)).toBe(`archive: ${archive.map((a) => a.name).join(' ')}`);
  });

  it('aligns the metric column', () => {
    const out = outputText(lsCommand.run([], fakeCtx())).slice(0, projects.length);
    const columns = out.map((l, i) => l.indexOf(projects[i]?.metric ?? ''));
    expect(new Set(columns).size).toBe(1);
  });

  it('treats projects and projects/ the same as no argument', () => {
    const plain = lsCommand.run([], fakeCtx());
    expect(lsCommand.run(['projects'], fakeCtx())).toEqual(plain);
    expect(lsCommand.run(['projects/'], fakeCtx())).toEqual(plain);
    expect(lsCommand.run(['-la'], fakeCtx())).toEqual(plain);
  });

  it('reports other paths as errors', () => {
    const out = lsCommand.run(['nope'], fakeCtx());
    expect(outputText(out)).toEqual(["ls: cannot access 'nope': no such file or directory"]);
    expect(tones(out[0])).toEqual(['error']);
  });

  it('completes projects', () => {
    expect(lsCommand.complete?.([])).toEqual(['projects']);
  });
});

describe('cat', () => {
  const goal = projects.find((p) => p.slug === 'agent-goal');
  const kla = projects.find((p) => p.slug === 'kla-pg-migration');

  it('prints title, summary, stack and a repo link', () => {
    const out = catCommand.run(['agent-goal'], fakeCtx());
    const text = outputText(out);
    expect(text[0]).toBe(goal?.title);
    expect(text).toContain(goal?.summary);
    expect(text).toContain(`stack: ${(goal?.fullStack ?? []).join(' · ')}`);
    const repo = out.find((l) => typeof l !== 'string' && l.some((s) => s.href === goal?.repo));
    expect(repo).toBeDefined();
    expect(lineText(repo ?? '')).toContain('github.com/ahish-mahesh/agent-goal');
    expect(lineText(repo ?? '')).not.toContain('https://');
  });

  it('falls back to the short stack and has no repo line when there is none', () => {
    const text = outputText(catCommand.run(['kla-pg-migration'], fakeCtx()));
    expect(text).toContain(`stack: ${(kla?.stack ?? []).join(' · ')}`);
    expect(text.some((l) => l.startsWith('repo:'))).toBe(false);
  });

  it('matches case-insensitively and by unique prefix', () => {
    const exact = catCommand.run(['agent-goal'], fakeCtx());
    expect(catCommand.run(['AGENT-GOAL'], fakeCtx())).toEqual(exact);
    expect(catCommand.run(['agent-g'], fakeCtx())).toEqual(exact);
    expect(catCommand.run(['kla'], fakeCtx())).toEqual(
      catCommand.run(['kla-pg-migration'], fakeCtx()),
    );
  });

  it('reports an ambiguous prefix', () => {
    const out = catCommand.run(['agent'], fakeCtx());
    expect(lineText(out[0] ?? '')).toBe('cat: agent: ambiguous');
    expect(lineText(out[1] ?? '')).toContain('agent-goal');
    expect(lineText(out[1] ?? '')).toContain('agent-notes-cpp');
  });

  it('reports unknown projects and suggests the closest slug', () => {
    const out = catCommand.run(['agent-gol'], fakeCtx());
    expect(lineText(out[0] ?? '')).toBe('cat: agent-gol: no such project');
    expect(tones(out[0])).toEqual(['error']);
    expect(out[1]).toEqual([{ text: 'did you mean agent-goal?', tone: 'muted' }]);
  });

  it('points at ls when nothing is close', () => {
    const out = catCommand.run(['zzzzzz'], fakeCtx());
    expect(lineText(out[1] ?? '')).toBe('try: ls');
  });

  it('needs an argument', () => {
    const out = catCommand.run([], fakeCtx());
    expect(outputText(out)).toEqual(['usage: cat <project>']);
    expect(tones(out[0])).toEqual(['error']);
  });

  it('refuses the binary resume', () => {
    expect(outputText(catCommand.run(['resume.pdf'], fakeCtx()))).toEqual([
      'cat: resume.pdf: binary file. try: resume',
    ]);
  });

  it('completes project slugs', () => {
    expect(catCommand.complete?.([])).toEqual(projects.map((p) => p.slug));
  });
});

describe('open', () => {
  it('jumps to the project row and focuses its button, printing nothing', () => {
    const ctx = fakeCtx();
    expect(openCommand.run(['agent-notes-cpp'], ctx)).toEqual([]);
    expect(ctx.goTo).toHaveBeenCalledExactlyOnceWith(
      projectHash('agent-notes-cpp'),
      projectButtonId('agent-notes-cpp'),
    );
  });

  it('matches by prefix', () => {
    const ctx = fakeCtx();
    openCommand.run(['proj'], ctx);
    expect(ctx.goTo).toHaveBeenCalledWith(
      projectHash('project5k-bot'),
      projectButtonId('project5k-bot'),
    );
  });

  it('does not navigate on a miss', () => {
    const ctx = fakeCtx();
    const out = openCommand.run(['agent-gol'], ctx);
    expect(ctx.goTo).not.toHaveBeenCalled();
    expect(lineText(out[0] ?? '')).toBe('open: agent-gol: no such project');
  });

  it('needs an argument', () => {
    const ctx = fakeCtx();
    expect(outputText(openCommand.run([], ctx))).toEqual(['usage: open <project>']);
    expect(ctx.goTo).not.toHaveBeenCalled();
  });

  it('completes project slugs', () => {
    expect(openCommand.complete?.([])).toEqual(projects.map((p) => p.slug));
  });
});

describe('cd', () => {
  const sections = sectionIds.filter((id) => id !== 'top');

  it.each(sections)('goes to %s, with or without a trailing slash', (id) => {
    for (const arg of [id, `${id}/`, id.toUpperCase()]) {
      const ctx = fakeCtx();
      expect(cdCommand.run([arg], ctx)).toEqual([]);
      expect(ctx.goTo).toHaveBeenCalledExactlyOnceWith(`#${id}`);
    }
  });

  it.each([[[]], [['~']], [['..']]])('goes to the top for %j', (args) => {
    const ctx = fakeCtx();
    expect(cdCommand.run(args, ctx)).toEqual([]);
    expect(ctx.goTo).toHaveBeenCalledExactlyOnceWith('#top');
  });

  it('does not treat top as a directory', () => {
    const ctx = fakeCtx();
    const out = cdCommand.run(['top'], ctx);
    expect(ctx.goTo).not.toHaveBeenCalled();
    expect(lineText(out[0] ?? '')).toBe('cd: no such directory: top');
  });

  it('reports unknown sections with a suggestion', () => {
    const ctx = fakeCtx();
    const out = cdCommand.run(['projcts'], ctx);
    expect(ctx.goTo).not.toHaveBeenCalled();
    expect(lineText(out[0] ?? '')).toBe('cd: no such directory: projcts');
    expect(tones(out[0])).toEqual(['error']);
    expect(out[1]).toEqual([{ text: 'did you mean projects?', tone: 'muted' }]);
  });

  it('lists the sections when nothing is close', () => {
    const out = cdCommand.run(['zzzzzz'], fakeCtx());
    expect(lineText(out[1] ?? '')).toBe(`try: ${sections.join(' ')}`);
  });

  it('completes sections without top', () => {
    expect(cdCommand.complete?.([])).toEqual(sections);
  });
});
