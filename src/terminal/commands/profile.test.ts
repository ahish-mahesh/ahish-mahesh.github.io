import { describe, expect, it } from 'vitest';
import { profile } from '../../content/profile.ts';
import { lineText, outputText } from '../format.ts';
import { fakeCtx } from '../testCtx.ts';
import type { Span } from '../types.ts';
import { contactCommand } from './contact.ts';
import { emailCommand } from './email.ts';
import { ps5Command } from './ps5.ts';
import { resumeCommand } from './resume.ts';
import { sudoCommand } from './sudo.ts';
import { whoamiCommand } from './whoami.ts';

function spans(out: ReturnType<typeof contactCommand.run>): Span[] {
  return out.flatMap((l) => (typeof l === 'string' ? [] : l));
}

describe('whoami', () => {
  it('is built from the profile', () => {
    const text = outputText(whoamiCommand.run([], fakeCtx()));
    expect(text).toContain(profile.name);
    expect(text).toContain(profile.oneLiner);
    expect(text).toContain(profile.subLine);
    expect(text).toContain(profile.availability);
  });
});

describe('resume', () => {
  it('downloads the pdf and says so', () => {
    const ctx = fakeCtx();
    expect(outputText(resumeCommand.run([], ctx))).toEqual(['downloading resume.pdf']);
    expect(ctx.download).toHaveBeenCalledExactlyOnceWith(profile.links.resume);
  });
});

describe('contact', () => {
  const out = contactCommand.run([], fakeCtx());
  const text = outputText(out);

  it('links the email, linkedin, github and resume', () => {
    const hrefs = spans(out).flatMap((s) => (s.href === undefined ? [] : [s.href]));
    expect(hrefs).toEqual([
      `mailto:${profile.email}`,
      profile.links.linkedin,
      profile.links.github,
      profile.links.resume,
    ]);
  });

  it('shows readable urls without a scheme, in aligned rows', () => {
    expect(text[0]).toBe(`email     ${profile.email}`);
    expect(text[1]).toBe('linkedin  linkedin.com/in/ahish-mahesh');
    expect(text[2]).toBe('github    github.com/ahish-mahesh');
    expect(text[3]).toBe('resume    resume.pdf');
  });

  it('follows with location, availability and work authorization', () => {
    expect(text.slice(4)).toEqual([
      '',
      profile.location,
      profile.availability,
      profile.workAuthorization,
    ]);
  });

  it('has no phone number', () => {
    expect(text.join('\n')).not.toMatch(/\d{3}[ -.]\d{3}[ -.]\d{4}/);
  });
});

describe('email', () => {
  it('opens a mailto link and says so', () => {
    const ctx = fakeCtx();
    expect(outputText(emailCommand.run([], ctx))).toEqual([
      `opening your mail client for ${profile.email}`,
    ]);
    expect(ctx.openUrl).toHaveBeenCalledExactlyOnceWith(`mailto:${profile.email}`);
  });
});

describe('sudo', () => {
  it('grants access to hire ahish, in any case', () => {
    for (const args of [
      ['hire', 'ahish'],
      ['HIRE', 'Ahish'],
    ]) {
      const out = sudoCommand.run(args, fakeCtx());
      expect(outputText(out)).toEqual([
        '[sudo] password for recruiter: ********',
        'access granted.',
        profile.email,
      ]);
      expect(out[2]).toEqual([
        { text: profile.email, tone: 'accent', href: `mailto:${profile.email}` },
      ]);
    }
  });

  it.each([[[]], [['hire']], [['hire', 'someone']], [['hire', 'ahish', 'now']], [['ls']]])(
    'refuses %j',
    (args) => {
      const out = sudoCommand.run(args, fakeCtx());
      expect(out).toEqual([
        [
          {
            text: 'recruiter is not in the sudoers file. this incident will be reported.',
            tone: 'error',
          },
        ],
      ]);
    },
  );

  it('is hidden', () => {
    expect(sudoCommand.hidden).toBe(true);
    expect('complete' in sudoCommand).toBe(false);
  });
});

describe('ps5', () => {
  it('prints the sign-off', () => {
    expect(outputText(ps5Command.run([], fakeCtx()))).toEqual([profile.signOff]);
    expect(lineText(ps5Command.run([], fakeCtx())[0] ?? '')).toBe(profile.signOff);
  });

  it('is hidden', () => {
    expect(ps5Command.hidden).toBe(true);
  });
});
