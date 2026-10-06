import { createContext } from 'react';

export interface TerminalContextValue {
  open: boolean;
  toggle: () => void;
  openTerminal: () => void;
  close: () => void;
  /** Start loading the terminal chunk (hover/focus on a trigger, idle). */
  preload: () => void;
}

export const TerminalContext = createContext<TerminalContextValue | null>(null);

/** The header's `>_` button: where focus lands when there is nothing better. */
export const TERMINAL_TRIGGER_ID = 'terminal-trigger';

/** Marks the panel (`data-terminal` in Terminal.tsx) so page-level listeners leave its events alone. */
export const TERMINAL_PANEL_ATTR = 'data-terminal';

export interface TerminalProps {
  open: boolean;
  crt: boolean;
  setCrt: (on: boolean) => void;
  onClose: () => void;
  goTo: (hash: string, focusId?: string) => void;
}

/** True when `target` sits inside the terminal panel. */
export function inTerminal(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(`[${TERMINAL_PANEL_ATTR}]`) !== null;
}

/** Ctrl+K, or ⌘+K on a Mac. */
export function isCtrlK(e: KeyboardEvent): boolean {
  return (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k';
}

function noModifiers(e: KeyboardEvent): boolean {
  return !e.ctrlKey && !e.metaKey && !e.altKey;
}

/** The open/close key outside text fields. `code` is the physical key, for layouts
    where backtick is a dead key or sits elsewhere. */
export function isBacktickKey(e: KeyboardEvent): boolean {
  return (e.key === '`' || e.code === 'Backquote') && noModifiers(e);
}

/** Inside the terminal's input, only an actual backtick closes, so the same physical
    key can still type `~` or `#` (Canadian French). */
export function isBacktickChar(e: KeyboardEvent): boolean {
  return (e.key === '`' || (e.key === 'Dead' && e.code === 'Backquote')) && noModifiers(e);
}
