import { catCommand } from './commands/cat.ts';
import { cdCommand } from './commands/cd.ts';
import { clearCommand } from './commands/clear.ts';
import { contactCommand } from './commands/contact.ts';
import { crtCommand } from './commands/crt.ts';
import { emailCommand } from './commands/email.ts';
import { exitCommand } from './commands/exit.ts';
import { experienceCommand } from './commands/experience.ts';
import { gitCommand } from './commands/git.ts';
import { helpCommand } from './commands/help.ts';
import { historyCommand } from './commands/history.ts';
import { lsCommand } from './commands/ls.ts';
import { openCommand } from './commands/open.ts';
import { ps5Command } from './commands/ps5.ts';
import { psqlCommand } from './commands/psql.ts';
import { resumeCommand } from './commands/resume.ts';
import { skillsCommand } from './commands/skills.ts';
import { sudoCommand } from './commands/sudo.ts';
import { themeCommand } from './commands/theme.ts';
import { whoamiCommand } from './commands/whoami.ts';
import type { Command } from './types.ts';

/** Every command, in `help` order. Hidden ones go last. */
export const commands: readonly Command[] = [
  helpCommand,
  whoamiCommand,
  lsCommand,
  catCommand,
  openCommand,
  cdCommand,
  experienceCommand,
  skillsCommand,
  resumeCommand,
  contactCommand,
  emailCommand,
  themeCommand,
  crtCommand,
  clearCommand,
  historyCommand,
  exitCommand,
  gitCommand,
  sudoCommand,
  psqlCommand,
  ps5Command,
];
