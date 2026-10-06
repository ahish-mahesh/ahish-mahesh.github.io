import { useContext } from 'react';
import { TerminalContext, type TerminalContextValue } from './terminalContext.ts';

export function useTerminal(): TerminalContextValue {
  const ctx = useContext(TerminalContext);
  if (!ctx) {
    throw new Error('useTerminal must be used inside a <TerminalLauncher>');
  }
  return ctx;
}
