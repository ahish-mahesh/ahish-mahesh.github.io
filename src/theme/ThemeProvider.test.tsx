import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider.tsx';
import { ThemeSwitch } from '../components/ThemeSwitch/ThemeSwitch.tsx';
import { useTheme } from './useTheme.ts';

afterEach(() => {
  vi.restoreAllMocks();
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

function renderSwitch() {
  return render(
    <ThemeProvider>
      <ThemeSwitch />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  it('switches theme, updates aria-pressed and persists', async () => {
    const user = userEvent.setup();
    renderSwitch();
    await user.click(screen.getByRole('button', { name: /paper/ }));
    expect(document.documentElement.dataset.theme).toBe('paper');
    expect(screen.getByRole('button', { name: /paper/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /amber/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /phosphor/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(localStorage.getItem('theme')).toBe('paper');
  });

  it('still works when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const user = userEvent.setup();
    renderSwitch();
    await user.click(screen.getByRole('button', { name: /amber/ }));
    expect(document.documentElement.dataset.theme).toBe('amber');
  });

  it('useTheme throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Probe() {
      useTheme();
      return null;
    }
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
  });
});
