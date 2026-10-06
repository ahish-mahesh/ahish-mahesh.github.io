import { vi, type Mock } from 'vitest';
import { THEMES, type Theme } from '../theme/themes.ts';
import { commands } from './registry.ts';
import type { Session, TerminalCtx } from './types.ts';

/** A `TerminalCtx` whose methods are spies, so tests can assert on the calls. */
export interface FakeCtx extends TerminalCtx {
  setTheme: Mock<(t: Theme) => void>;
  setCrt: Mock<(on: boolean) => void>;
  clear: Mock<() => void>;
  close: Mock<() => void>;
  goTo: Mock<(hash: string, focusId?: string) => void>;
  openUrl: Mock<(href: string) => void>;
  download: Mock<(href: string) => void>;
  enterSession: Mock<(s: Session) => void>;
  exitSession: Mock<() => void>;
}

/** Overrides replace the defaults as given, so an overridden method is not a spy. */
export function fakeCtx(overrides: Partial<TerminalCtx> = {}): FakeCtx {
  return {
    commands,
    history: [],
    theme: 'phosphor',
    themes: THEMES,
    crt: false,
    setTheme: vi.fn(),
    setCrt: vi.fn(),
    clear: vi.fn(),
    close: vi.fn(),
    goTo: vi.fn(),
    openUrl: vi.fn(),
    download: vi.fn(),
    enterSession: vi.fn(),
    exitSession: vi.fn(),
    ...overrides,
  } as FakeCtx;
}
