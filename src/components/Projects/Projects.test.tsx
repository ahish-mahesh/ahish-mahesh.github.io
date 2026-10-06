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

describe('Projects', () => {
  it.each(projects)('shows the $name headline and metric without interaction', (project) => {
    render(<Projects />);
    expect(screen.getByRole('heading', { name: project.headline, level: 3 })).toBeVisible();
    expect(screen.getAllByText(project.metric)[0]).toBeVisible();
  });

  it.each(rest)('shows the $name summary without interaction', (project) => {
    render(<Projects />);
    expect(screen.getByText(project.summary)).toBeVisible();
  });

  it('shows the KLA bullets and migration panel without interaction', () => {
    render(<Projects />);
    for (const b of kla.bullets) expect(screen.getByText(b)).toBeVisible();
    const figure = screen.getByRole('figure');
    expect(within(figure).getByText(/^illustrative:/)).toBeVisible();
    expect(screen.queryByRole('button', { name: /kla-pg-migration/ })).not.toBeInTheDocument();
  });

  it('labels the featured article with the headline', () => {
    render(<Projects />);
    expect(screen.getByRole('article', { name: kla.headline })).toBeInTheDocument();
  });

  it.each(rest)('toggles the $name details panel', async (project) => {
    const user = userEvent.setup();
    render(<Projects />);
    const button = screen.getByRole('button', { name: new RegExp(`details for ${project.name}`) });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    if (!panel) throw new Error('missing panel');
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
    const button = screen.getByRole('button', { name: /details for agent-goal/ });
    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the pipeline figure in the agent-notes panel', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    await user.click(screen.getByRole('button', { name: /details for agent-notes-cpp/ }));
    const figure = within(
      document.getElementById('panel-agent-notes-cpp') ?? document.body,
    ).getByRole('figure');
    expect(within(figure).getByText(/^pipeline:/)).toBeVisible();
  });

  it('opens the row named in the hash on load', () => {
    window.location.hash = '#project-agent-goal';
    render(<Projects />);
    expect(screen.getByRole('button', { name: /details for agent-goal/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: /details for project5k-bot/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens a row on hashchange', () => {
    render(<Projects />);
    act(() => {
      window.location.hash = '#project-project5k-bot';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByRole('button', { name: /details for project5k-bot/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('opens a closed row when the browser finds text inside it', () => {
    render(<Projects />);
    const button = screen.getByRole('button', { name: /details for agent-goal/ });
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    if (!panel) throw new Error('missing panel');
    act(() => {
      panel.dispatchEvent(new Event('beforematch'));
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
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
