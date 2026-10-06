import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TerminalContext, type TerminalContextValue } from '../../terminal/terminalContext.ts';
import { SiteFooter } from './SiteFooter.tsx';

describe('SiteFooter', () => {
  it('has a terminal hint button that opens the terminal', async () => {
    const user = userEvent.setup();
    const openTerminal = vi.fn();
    const value: TerminalContextValue = {
      open: false,
      toggle: vi.fn(),
      openTerminal,
      close: vi.fn(),
      preload: vi.fn(),
    };
    render(
      <TerminalContext value={value}>
        <SiteFooter />
      </TerminalContext>,
    );
    const button = screen.getByRole('button', { name: /for the backend of this site/ });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    await user.click(button);
    expect(openTerminal).toHaveBeenCalledOnce();
  });
});
