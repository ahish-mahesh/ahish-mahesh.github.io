import { describe, expect, it } from 'vitest';
import { education, experience } from '../../content/experience.ts';
import { neofetchLogo, neofetchTitle, skills } from '../../content/skills.ts';
import { lineText, outputText } from '../format.ts';
import { fakeCtx } from '../testCtx.ts';
import { experienceCommand } from './experience.ts';
import { gitCommand } from './git.ts';
import { skillsCommand } from './skills.ts';

describe('experience', () => {
  const out = experienceCommand.run([], fakeCtx());
  const text = outputText(out);

  it('draws the head commit first, in lowercase', () => {
    expect(text[0]).toBe('* 2026-05  vffice (HEAD -> main)  back end developer, montreal/brossard');
    expect(text[1]).toBe('|          May 2026 to now');
    expect(text[2]).toBe('|          started as the co-op, stayed on');
  });

  it('lists every entry, newest first', () => {
    const order = experience.map((e) => text.findIndex((l) => l.includes(e.graphLabel)));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('forks and joins around the side branch', () => {
    const fork = text.indexOf('|\\');
    const join = text.indexOf('|/');
    expect(fork).toBeGreaterThan(0);
    expect(join).toBeGreaterThan(fork);
    const side = text.slice(fork + 1, join);
    // Org names line up with the main-branch entries above.
    expect(side[0]).toMatch(/^\| \* 2019 {3}kla corporation/);
    expect(side[0]?.indexOf('kla corporation')).toBe(text[fork - 3]?.indexOf('kla corporation'));
    expect(side[0]).toContain('software engineering intern, chennai');
    expect(side.slice(1).every((l) => l.startsWith('| | '))).toBe(true);
    expect(text[join + 1]).toMatch(/^\* 2018-05 {2}code khadi/);
  });

  it('puts the award tag on its entry', () => {
    const tag = experience.find((e) => e.tag)?.tag?.text ?? '';
    const i = text.findIndex((l) => l.includes(`tag: ${tag}`));
    expect(i).toBeGreaterThan(0);
    expect(
      text.slice(0, i).some((l) => l.includes('kla corporation (') || l.includes('2021-07')),
    ).toBe(true);
    expect(out[i]).toEqual([{ text: text[i] ?? '', tone: 'accent' }]);
  });

  it('adds education and a muted hint', () => {
    for (const ed of education) {
      expect(text.some((l) => l.includes(ed.degree) && l.includes(ed.school))).toBe(true);
    }
    expect(text.some((l) => l.includes(education[0]?.gpa ?? '?'))).toBe(true);
    expect(out.at(-1)).toEqual([{ text: 'cd work for the details', tone: 'muted' }]);
  });

  it('has no trailing whitespace', () => {
    for (const l of text) expect(l).toBe(l.trimEnd());
  });
});

describe('git', () => {
  const log = experienceCommand.run([], fakeCtx());

  it('runs the same timeline for git log, ignoring flags', () => {
    expect(gitCommand.run(['log'], fakeCtx())).toEqual(log);
    expect(gitCommand.run(['LOG', '--oneline', '--graph'], fakeCtx())).toEqual(log);
  });

  it('shows usage with no subcommand', () => {
    expect(gitCommand.run([], fakeCtx())).toEqual([[{ text: 'usage: git log', tone: 'error' }]]);
  });

  it('rejects other subcommands', () => {
    expect(gitCommand.run(['push'], fakeCtx())).toEqual([
      [{ text: "git: 'push' is not a git command. try: git log", tone: 'error' }],
    ]);
  });

  it('is hidden and has no completion', () => {
    expect(gitCommand.hidden).toBe(true);
    expect('complete' in gitCommand).toBe(false);
  });
});

describe('skills', () => {
  const out = skillsCommand.run([], fakeCtx());
  const text = outputText(out);

  it('answers to neofetch too', () => {
    expect(skillsCommand.aliases).toContain('neofetch');
  });

  it('sets the logo beside the title, a rule and every skill row', () => {
    const logo = neofetchLogo.split('\n');
    expect(text[0]).toBe(
      `${(logo[0] ?? '').padEnd(Math.max(...logo.map((l) => l.length)) + 3)}${neofetchTitle}`,
    );
    expect(text[1]).toContain('-'.repeat(neofetchTitle.length));
    for (const s of skills) {
      expect(text.some((l) => l.includes(s.key) && l.includes(s.values.join(' · ')))).toBe(true);
    }
    expect(text).toHaveLength(2 + skills.length);
  });

  it('draws the logo down the left edge', () => {
    const logo = neofetchLogo.split('\n');
    logo.forEach((l, i) => {
      expect(lineText(out[i] ?? '').startsWith(l)).toBe(true);
    });
  });
});
