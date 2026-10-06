export interface Profile {
  readonly name: string;
  readonly oneLiner: string;
  /** One line of career background under the one-liner. */
  readonly background: string;
  /** Hiring status: when, where, and work authorization in one sentence. */
  readonly status: string;
  /** Hero key/value block. */
  readonly facts: readonly { readonly key: string; readonly value: string }[];
  readonly email: string;
  readonly links: {
    readonly github: string;
    readonly linkedin: string;
    readonly resume: string;
  };
  readonly location: string;
  readonly availability: string;
  readonly workAuthorization: string;
  readonly award: string;
  /** The PS5 joke from the README: footer aside and the hidden `ps5` command. */
  readonly signOff: string;
}

export interface Project {
  readonly pid: number;
  readonly slug: string;
  /** The htop row name, e.g. `agent-notes-cpp`. */
  readonly name: string;
  /** The case-study heading. */
  readonly title: string;
  /** Plain-language one-line headline shown on the card. */
  readonly headline: string;
  /** Short tokens for the htop STACK column. */
  readonly stack: readonly string[];
  /** The "Stack:" line in the case study, where given. */
  readonly fullStack?: readonly string[];
  readonly metric: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly repo?: string;
  /** ASCII diagram source. */
  readonly diagram?: string;
  /** Plain-text description of the diagram for screen readers. */
  readonly diagramCaption?: string;
  /** Animated figure in the case study panel. */
  readonly visual?: 'pipeline' | 'migration';
}

export interface ArchiveProject {
  readonly name: string;
  readonly description?: string;
  readonly repo?: string;
}

export interface ExperienceEntry {
  readonly id: string;
  readonly org: string;
  readonly role: string;
  readonly location?: string;
  /** `YYYY-MM` or `YYYY`. */
  readonly start: string;
  /** `YYYY-MM`, `YYYY` or `'present'`. */
  readonly end: string;
  readonly dateLabel: string;
  /** Short git-log date, e.g. `2026-05`. */
  readonly graphLabel: string;
  readonly branch: 'main' | 'side';
  readonly note?: string;
  readonly bullets: readonly string[];
  readonly link?: { readonly href: string; readonly label: string };
  /** A git tag on this commit, e.g. an award. `label` is decorative; `text` is the readable form. */
  readonly tag?: { readonly label: string; readonly text: string };
}

export interface Education {
  readonly school: string;
  readonly degree: string;
  readonly dates: string;
  readonly gpa?: string;
}

export interface SkillRow {
  readonly key: string;
  readonly values: readonly string[];
}
