import type { Theme } from '../theme/themes.ts';

export type Tone = 'muted' | 'accent' | 'error';

/** A run of text on one output line. With `href` it renders as a link. */
export interface Span {
  readonly text: string;
  readonly tone?: Tone;
  readonly href?: string;
}

/** One output line. A plain string is untoned text. */
export type Line = string | readonly Span[];

export type Output = readonly Line[];

export interface Command {
  readonly name: string;
  readonly aliases?: readonly string[];
  readonly description: string;
  /** e.g. `cat <project>`. Shown by `help` in place of the bare name. */
  readonly usage?: string;
  /** Hidden commands run, but never appear in `help`, completion or suggestions. */
  readonly hidden?: boolean;
  /** Candidates for the argument being typed. `args` are the ones before it. */
  complete?(args: readonly string[]): readonly string[];
  run(args: readonly string[], ctx: TerminalCtx): Output;
}

/** A sub-shell (e.g. `psql`) that takes over input until it exits. */
export interface Session {
  readonly prompt: string;
  run(line: string, ctx: TerminalCtx): Output;
}

/** Everything a command may touch. The UI provides it; tests pass a fake. */
export interface TerminalCtx {
  readonly commands: readonly Command[];
  readonly history: readonly string[];
  readonly theme: Theme;
  readonly themes: readonly Theme[];
  /** Touch-first device (no Tab, arrows or Esc), so hints talk about tapping. */
  readonly touch?: boolean;
  setTheme(t: Theme): void;
  readonly crt: boolean;
  setCrt(on: boolean): void;
  clear(): void;
  close(): void;
  /** Close the terminal, navigate to `hash`, then focus `focusId` if given. */
  goTo(hash: string, focusId?: string): void;
  /** Open a URL in place (mailto). */
  openUrl(href: string): void;
  download(href: string): void;
  enterSession(s: Session): void;
  exitSession(): void;
}
