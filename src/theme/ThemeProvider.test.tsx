import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider.tsx';
import { ThemeSwitch } from '../components/ThemeSwitch/ThemeSwitch.tsx';
import { useTheme } from './useTheme.ts';
import { mockReducedMotion } from '../test/matchMedia.ts';

afterEach(() => {
  vi.restoreAllMocks();
  delete document.documentElement.dataset.theme;
  localStorage.clear();
  Reflect.deleteProperty(document, 'startViewTransition');
});

function stubViewTransition() {
  const stub = vi.fn((cb: () => void) => {
    cb();
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    };
  });
  Object.defineProperty(document, 'startViewTransition', {
    value: stub,
    configurable: true,
    writable: true,
  });
  return stub;
}

function renderSwitch() {
  return render(
    <ThemeProvider>
      <ThemeSwitch />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  it('cycles themes, updates the label and persists', async () => {
    const user = userEvent.setup();
    renderSwitch();
    const button = () => screen.getByRole('button', { name: /^theme:/ });
    expect(button()).toHaveAccessibleName(/theme: phosphor, switch to amber/);
    await user.click(button());
    expect(document.documentElement.dataset.theme).toBe('amber');
    expect(localStorage.getItem('theme')).toBe('amber');
    expect(button()).toHaveAccessibleName(/theme: amber, switch to paper/);
    await user.click(button());
    expect(document.documentElement.dataset.theme).toBe('paper');
    expect(localStorage.getItem('theme')).toBe('paper');
    expect(button()).toHaveAccessibleName(/theme: paper, switch to phosphor/);
    await user.click(button());
    expect(document.documentElement.dataset.theme).toBe('phosphor');
    expect(localStorage.getItem('theme')).toBe('phosphor');
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
    await user.click(screen.getByRole('button', { name: /^theme:/ }));
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

  it('wraps the switch in a view transition when supported', async () => {
    const stub = stubViewTransition();
    const user = userEvent.setup();
    renderSwitch();
    await user.click(screen.getByRole('button', { name: /^theme:/ }));
    expect(stub).toHaveBeenCalledTimes(1);
    expect(document.documentElement.dataset.theme).toBe('amber');
  });

  it('skips the view transition under reduced motion', async () => {
    mockReducedMotion();
    const stub = stubViewTransition();
    const user = userEvent.setup();
    renderSwitch();
    await user.click(screen.getByRole('button', { name: /^theme:/ }));
    expect(stub).not.toHaveBeenCalled();
    expect(document.documentElement.dataset.theme).toBe('amber');
  });
});
