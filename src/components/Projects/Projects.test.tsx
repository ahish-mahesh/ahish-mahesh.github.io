import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { archive, projects } from '../../content/projects.ts';
import { Projects } from './Projects.tsx';

afterEach(() => {
  window.location.hash = '';
});

const [kla, ...rest] = projects;
if (!kla) throw new Error('no projects');

function rowButton(name: string): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(name) });
}

function panelOf(button: HTMLElement): HTMLElement {
  const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
  if (!panel) throw new Error('missing panel');
  return panel;
}

describe('Projects', () => {
  it('shows the status line', () => {
    render(<Projects />);
    expect(screen.getByText('Tasks: 4 total; sorted by impact')).toBeVisible();
  });

  it.each(projects)('shows the $name name, metric and headline without interaction', (project) => {
    render(<Projects />);
    expect(rowButton(project.name)).toHaveTextContent(project.name);
    expect(rowButton(project.name)).toHaveTextContent(project.metric);
    expect(screen.getByText(project.headline)).toBeVisible();
  });

  it('starts every row closed', () => {
    render(<Projects />);
    for (const p of projects) {
      expect(rowButton(p.name)).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('opens the KLA row on click, with bullets and the migration figure', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const button = rowButton(kla.name);
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const panel = panelOf(button);
    expect(panel).not.toHaveAttribute('hidden');
    for (const b of kla.bullets) expect(within(panel).getByText(b)).toBeVisible();
    expect(within(panel).getByText(/^illustrative:/)).toBeVisible();
  });

  it.each(rest)('starts $name closed and toggles it', async (project) => {
    const user = userEvent.setup();
    render(<Projects />);
    const button = rowButton(project.name);
    const panel = panelOf(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden', 'until-found');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('hidden');
    expect(within(panel).getByText(project.bullets[0] ?? '')).toBeVisible();
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden', 'until-found');
  });

  it('toggles with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const button = rowButton('agent-goal');
    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the pipeline figure in the agent-notes panel', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const button = rowButton('agent-notes-cpp');
    await user.click(button);
    expect(within(panelOf(button)).getByText(/^pipeline:/)).toBeVisible();
  });

  it('lists the full stack and source link in an open panel', () => {
    render(<Projects />);
    window.location.hash = '#project-agent-goal';
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    const panel = panelOf(rowButton('agent-goal'));
    expect(within(panel).getByText(/Supabase \(Auth, Edge Functions\)/)).toBeVisible();
    expect(within(panel).getByRole('link', { name: 'source on github' })).toHaveAttribute(
      'href',
      'https://github.com/ahish-mahesh/agent-goal',
    );
  });

  it('opens the row named in the hash on load', () => {
    window.location.hash = '#project-agent-goal';
    render(<Projects />);
    expect(rowButton('agent-goal')).toHaveAttribute('aria-expanded', 'true');
    expect(rowButton('project5k-bot')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens a row on hashchange', () => {
    render(<Projects />);
    act(() => {
      window.location.hash = '#project-project5k-bot';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(rowButton('project5k-bot')).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens a closed row when the browser finds text inside it', () => {
    render(<Projects />);
    const button = rowButton('agent-goal');
    act(() => {
      panelOf(button).dispatchEvent(new Event('beforematch'));
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks each row with [+], and [-] once open', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const button = rowButton('agent-goal');
    expect(button).toHaveTextContent('[+]');
    await user.click(button);
    expect(button).toHaveTextContent('[-]');
  });

  it('keeps the archive collapsed until its summary is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Projects />);
    const details = container.querySelector('details');
    if (!details) throw new Error('missing archive');
    expect(details.open).toBe(false);
    await user.click(screen.getByText(`${String(archive.length)} smaller projects`));
    expect(details.open).toBe(true);
  });
});
