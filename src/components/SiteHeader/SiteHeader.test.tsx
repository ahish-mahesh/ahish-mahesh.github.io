import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ActiveSectionContext } from '../../hooks/ActiveSectionContext.ts';
import { mockReducedMotion } from '../../test/matchMedia.ts';
import { TerminalLauncher } from '../../terminal/TerminalLauncher.tsx';
import { ThemeProvider } from '../../theme/ThemeProvider.tsx';
import { SiteHeader } from './SiteHeader.tsx';

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TerminalLauncher>{children}</TerminalLauncher>
    </ThemeProvider>
  );
}

function setup() {
  mockReducedMotion();
  return render(<SiteHeader />, { wrapper: Providers });
}

describe('SiteHeader', () => {
  it('types the active section command from context', () => {
    mockReducedMotion();
    render(
      <ActiveSectionContext value="projects">
        <SiteHeader />
      </ActiveSectionContext>,
      { wrapper: Providers },
    );
    expect(screen.getByText('htop')).toBeInTheDocument();
  });

  it('renders without a provider and types nothing', () => {
    setup();
    expect(screen.queryByText('htop')).not.toBeInTheDocument();
  });

  it('renders the prompt and nav links', () => {
    setup();
    expect(screen.getByRole('link', { name: 'ahish@montreal' })).toHaveAttribute('href', '#top');
    for (const [name, href] of [
      ['projects', '#projects'],
      ['experience', '#work'],
      ['skills', '#about'],
      ['contact', '#contact'],
      ['résumé', '/resume.pdf'],
    ] as const) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it('types the command on hover and clears it on leave', async () => {
    const user = userEvent.setup();
    setup();
    const link = screen.getByRole('link', { name: 'experience' });
    await user.hover(link);
    expect(screen.getByText('cd work')).toBeInTheDocument();
    await user.unhover(link);
    expect(screen.queryByText('cd work')).not.toBeInTheDocument();
  });

  it('types the command on focus and clears it on blur', () => {
    setup();
    const link = screen.getByRole('link', { name: 'experience' });
    act(() => {
      link.focus();
    });
    expect(screen.getByText('cd work')).toBeInTheDocument();
    act(() => {
      link.blur();
    });
    expect(screen.queryByText('cd work')).not.toBeInTheDocument();
  });

  it('toggles the menu and closes on Escape with focus back on the toggle', async () => {
    const user = userEvent.setup();
    setup();
    const toggle = screen.getByRole('button', { name: /^ls/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('closes the menu when a link is clicked', async () => {
    const user = userEvent.setup();
    setup();
    const toggle = screen.getByRole('button', { name: /^ls/ });
    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'skills' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('has a terminal button that toggles the terminal', async () => {
    const user = userEvent.setup();
    setup();
    const button = screen.getByRole('button', { name: 'open terminal' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('textbox', { name: 'command' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });
});
