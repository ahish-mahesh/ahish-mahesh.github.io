import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { SiteHeader } from '../components/SiteHeader/SiteHeader.tsx';
import { mockReducedMotion } from '../test/matchMedia.ts';
import { ThemeProvider } from '../theme/ThemeProvider.tsx';
import { TerminalLauncher } from './TerminalLauncher.tsx';

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.crt;
  localStorage.clear();
  window.history.replaceState(null, '', window.location.pathname);
});

function setup() {
  mockReducedMotion();
  const root = document.createElement('div');
  root.id = 'root';
  document.body.append(root);
  const user = userEvent.setup();
  render(
    <ThemeProvider>
      <TerminalLauncher>
        <SiteHeader />
        <button type="button">before</button>
        <input aria-label="search" />
        <main id="contact">contact</main>
      </TerminalLauncher>
    </ThemeProvider>,
    { container: root },
  );
  return { user, root };
}

const trigger = () => screen.getByRole('button', { name: 'open terminal' });
const log = () => screen.getByRole('log');

/** The input once the lazy chunk is in and focus has landed. */
async function commandInput() {
  const input = await screen.findByRole('textbox', { name: 'command' }, { timeout: 5000 });
  await waitFor(() => {
    expect(input).toHaveFocus();
  });
  return input;
}

async function run(user: ReturnType<typeof userEvent.setup>, line: string) {
  await user.keyboard(`${line}{Enter}`);
}

describe('Terminal', () => {
  it('opens on backtick as a labelled modal dialog with focus in the input', async () => {
    const { user, root } = setup();
    await user.keyboard('`');
    await commandInput();
    const dialog = screen.getByRole('dialog', { name: 'terminal' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('tab completes, escape closes');
    expect(dialog).not.toHaveAttribute('inert');
    expect(root).toHaveAttribute('inert');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(log()).toHaveTextContent('type help to see commands');
  });

  it('opens and closes with Ctrl+K', async () => {
    const { user } = setup();
    await user.keyboard('{Control>}k{/Control}');
    await commandInput();
    await user.keyboard('{Control>}k{/Control}');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape, un-inerts the page and returns focus', async () => {
    const { user, root } = setup();
    const before = screen.getByRole('button', { name: 'before' });
    act(() => {
      before.focus();
    });
    await user.keyboard('`');
    await commandInput();
    await user.keyboard('{Escape}');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(root).not.toHaveAttribute('inert');
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('inert');
    expect(before).toHaveFocus();
  });

  it('falls back to the terminal button when nothing had focus', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await user.keyboard('{Escape}');
    expect(trigger()).toHaveFocus();
  });

  it('closes on backtick in the input without typing it', async () => {
    const { user } = setup();
    await user.keyboard('`');
    const input = await commandInput();
    await user.keyboard('`');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveValue('');
  });

  it('ignores backtick typed in another input on the page', async () => {
    const { user } = setup();
    const search = screen.getByRole('textbox', { name: 'search' });
    await user.type(search, 'a`b');
    expect(search).toHaveValue('a`b');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles from the >_ button', async () => {
    const { user } = setup();
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await commandInput();
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a click outside the panel', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await user.click(screen.getByRole('main'));
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('help lists the visible commands and not the hidden ones', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await run(user, 'help');
    const text = log().textContent;
    expect(text).toContain('ahish@montreal:~$ help');
    for (const name of ['whoami', 'cat <project>', 'theme', 'clear', 'exit']) {
      expect(text).toContain(name);
    }
    for (const name of ['psql', 'sudo', 'ps5']) {
      expect(text).not.toContain(name);
    }
  });

  it('completes on Tab and lists candidates when ambiguous', async () => {
    const { user } = setup();
    await user.keyboard('`');
    const input = await commandInput();
    await user.keyboard('hel');
    await user.keyboard('{Tab}');
    expect(input).toHaveValue('help ');
    expect(input).toHaveFocus();

    await user.clear(input);
    await user.keyboard('c{Tab}');
    expect(input).toHaveValue('c');
    expect(log()).toHaveTextContent(/cat\s+cd/);
  });

  it('recalls history with the arrow keys', async () => {
    const { user } = setup();
    await user.keyboard('`');
    const input = await commandInput();
    await run(user, 'whoami');
    await run(user, 'ls');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('ls');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('whoami');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveValue('');
  });

  it('switches the theme', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await run(user, 'theme paper');
    expect(document.documentElement.dataset.theme).toBe('paper');
  });

  it('turns the crt layer on and persists it', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await run(user, 'crt on');
    expect(document.documentElement.dataset.crt).toBe('on');
    expect(localStorage.getItem('crt')).toBe('on');
    await run(user, 'crt off');
    expect(document.documentElement).not.toHaveAttribute('data-crt');
    expect(localStorage.getItem('crt')).toBe('off');
  });

  it('clear empties the output, and so does Ctrl+L', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await run(user, 'help');
    await run(user, 'clear');
    expect(log()).toBeEmptyDOMElement();
    await run(user, 'whoami');
    expect(log()).not.toBeEmptyDOMElement();
    await user.keyboard('{Control>}l{/Control}');
    expect(log()).toBeEmptyDOMElement();
  });

  it('exit closes the terminal', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await run(user, 'exit');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the scrollback when reopened', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await run(user, 'whoami');
    await user.keyboard('{Escape}');
    await user.keyboard('`');
    await commandInput();
    expect(log()).toHaveTextContent('ahish@montreal:~$ whoami');
  });

  it('cd navigates to the section and closes', async () => {
    const { user } = setup();
    await user.keyboard('`');
    await commandInput();
    await run(user, 'cd contact');
    expect(window.location.hash).toBe('#contact');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('psql takes over the prompt until \\q', async () => {
    const { user } = setup();
    await user.keyboard('`');
    const input = await commandInput();
    await run(user, 'psql');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('postgres=#', { exact: false })).toBeInTheDocument();
    await user.type(input, '\\q{Enter}');
    expect(
      within(dialog).queryByText('postgres=#', { exact: false, selector: 'span[aria-hidden]' }),
    ).toBeNull();
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('\\q');
  });
});
