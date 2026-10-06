import { describe, expect, it } from 'vitest';
import * as experienceModule from './experience.ts';
import * as profileModule from './profile.ts';
import * as projectsModule from './projects.ts';
import * as skillsModule from './skills.ts';

const modules = {
  experience: experienceModule,
  profile: profileModule,
  projects: projectsModule,
  skills: skillsModule,
};

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
  } else if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value)) collectStrings(item, out);
  }
  return out;
}

const allStrings = collectStrings(Object.values(modules).map((m): unknown[] => Object.values(m)));

const banned = [
  'passionate',
  'leverage',
  'synergy',
  'results-driven',
  'cutting-edge',
  'rockstar',
  'ninja',
];

describe('content voice rules', () => {
  it('has strings to check', () => {
    expect(allStrings.length).toBeGreaterThan(50);
  });

  it('has no em-dashes or en-dashes', () => {
    for (const s of allStrings) {
      expect(s, s).not.toMatch(/[—–]/);
    }
  });

  it('has no banned words', () => {
    for (const s of allStrings) {
      for (const word of banned) {
        expect(s, `${word} in "${s}"`).not.toMatch(new RegExp(`\\b${word}\\b`, 'i'));
      }
    }
  });

  it('has no phone numbers', () => {
    for (const s of allStrings) {
      expect(s, s).not.toMatch(/tel:/i);
      expect(s, s).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
    }
  });
});

describe('projects', () => {
  const { projects } = projectsModule;

  it('has unique pids and slugs', () => {
    expect(new Set(projects.map((p) => p.pid)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it('has a non-empty headline on every project', () => {
    for (const p of projects) expect(p.headline.trim().length).toBeGreaterThan(0);
  });

  it('only links to the ahish-mahesh GitHub account', () => {
    const repos = [...projects, ...projectsModule.archive].flatMap((p) =>
      p.repo === undefined ? [] : [p.repo],
    );
    expect(repos.length).toBeGreaterThan(0);
    for (const repo of repos) {
      expect(repo.startsWith('https://github.com/ahish-mahesh/')).toBe(true);
    }
  });
});
