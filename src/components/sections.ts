export const sectionIds = ['top', 'projects', 'work', 'about', 'contact'] as const;

export type SectionId = (typeof sectionIds)[number];

/** What the header "types" while each section is in focus. Keep these short: the
    prompt shares one 88ch line with the nav links. */
export const sectionCommands: Record<SectionId, string | null> = {
  top: null,
  projects: 'htop',
  work: 'git log',
  about: 'neofetch',
  contact: 'mail',
};

/** Linking to `#project-<slug>` opens that project's row. */
export const PROJECT_HASH_PREFIX = '#project-';

export function projectHash(slug: string): string {
  return `${PROJECT_HASH_PREFIX}${slug}`;
}

/** The row's disclosure button; the terminal's `open` command focuses it. */
export function projectButtonId(slug: string): string {
  return `project-${slug}-button`;
}
