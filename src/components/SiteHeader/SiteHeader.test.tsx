import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockReducedMotion } from '../../test/matchMedia.ts';
import { ThemeProvider } from '../../theme/ThemeProvider.tsx';
import { SiteHeader } from './SiteHeader.tsx';

function setup() {
  mockReducedMotion();
  return render(
    <ThemeProvider>
      <SiteHeader />
    </ThemeProvider>,
  );
}

describe('SiteHeader', () => {
  it('renders the prompt and nav links', () => {
    setup();
    expect(screen.getByRole('link', { name: 'ahish@montreal' })).toHaveAttribute('href', '#top');
    for (const [name, href] of [
      ['projects/', '#projects'],
      ['work/', '#work'],
      ['about/', '#about'],
      ['contact/', '#contact'],
      ['resume.pdf', '/resume.pdf'],
    ] as const) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it('types the command on hover and clears it on leave', async () => {
    const user = userEvent.setup();
    setup();
    const link = screen.getByRole('link', { name: 'work/' });
    await user.hover(link);
    expect(screen.getByText('cd work')).toBeInTheDocument();
    await user.unhover(link);
    expect(screen.queryByText('cd work')).not.toBeInTheDocument();
  });

  it('types the command on focus and clears it on blur', () => {
    setup();
    const link = screen.getByRole('link', { name: 'work/' });
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
    const toggle = screen.getByRole('button', { name: /ls/ });
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
    const toggle = screen.getByRole('button', { name: /ls/ });
    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'about/' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
