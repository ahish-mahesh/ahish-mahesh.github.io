import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { archive, projects } from '../../content/projects.ts';
import { mockReducedMotion } from '../../test/matchMedia.ts';
import { bar } from './bar.ts';
import { ProcessList } from './ProcessList.tsx';

afterEach(() => {
  window.location.hash = '';
});

describe('ProcessList', () => {
  it.each(projects)('toggles the $name panel with a click', async (project) => {
    const user = userEvent.setup();
    render(<ProcessList />);
    const button = screen.getByRole('button', { name: new RegExp(project.name) });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    if (!panel) throw new Error('missing panel');
    expect(panel).toHaveAttribute('hidden', 'until-found');
    expect(panel).not.toBeVisible();
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('hidden');
    expect(panel).toBeVisible();
    const bullet = project.bullets[0] ?? '';
    expect(within(panel).getByText(bullet)).toBeVisible();
  });

  it('toggles with the keyboard', async () => {
    const user = userEvent.setup();
    render(<ProcessList />);
    const button = screen.getByRole('button', { name: /agent-goal/ });
    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the pipeline figure in the agent-notes panel', async () => {
    const user = userEvent.setup();
    render(<ProcessList />);
    await user.click(screen.getByRole('button', { name: /agent-notes-cpp/ }));
    const figure = screen.getByRole('figure');
    expect(within(figure).getByText(/^pipeline:/)).toBeVisible();
  });

  it('shows the migration panel in the kla panel', async () => {
    const user = userEvent.setup();
    render(<ProcessList />);
    await user.click(screen.getByRole('button', { name: /kla-pg-migration/ }));
    const figure = screen.getByRole('figure');
    expect(within(figure).getByText(/^illustrative:/)).toBeVisible();
  });

  it('expands the row named in the hash', () => {
    render(<ProcessList />);
    const button = screen.getByRole('button', { name: /kla-pg-migration/ });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    act(() => {
      window.location.hash = '#project-kla-pg-migration';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens a closed row when the browser finds text inside it', () => {
    render(<ProcessList />);
    const button = screen.getByRole('button', { name: /agent-goal/ });
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    if (!panel) throw new Error('missing panel');
    act(() => {
      panel.dispatchEvent(new Event('beforematch'));
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the archive collapsed until its summary is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<ProcessList />);
    const details = container.querySelector('details');
    if (!details) throw new Error('missing archive');
    expect(details.open).toBe(false);
    await user.click(screen.getByText(`archive (${String(archive.length)})`));
    expect(details.open).toBe(true);
  });

  it('does not render project summaries in the list', () => {
    render(<ProcessList />);
    for (const p of projects) {
      expect(screen.queryByText(p.summary)).not.toBeInTheDocument();
    }
  });

  it('shows the task count status line', () => {
    render(<ProcessList />);
    expect(screen.getByText(/^Tasks: 4 total, 4 complete; sorted by impact$/)).toBeVisible();
  });

  describe('bars', () => {
    function barTexts(container: HTMLElement): (string | null)[] {
      return Array.from(
        container.querySelectorAll('li[id^="project-"] button > span[aria-hidden]'),
      ).map((el) => el.textContent);
    }

    it('shows the full bar immediately under reduced motion', () => {
      mockReducedMotion();
      const { container } = render(<ProcessList />);
      expect(barTexts(container)).toEqual(projects.map(() => bar(1)));
    });

    it('starts empty, at full width, until the row scrolls into view', () => {
      const { container } = render(<ProcessList />);
      const texts = barTexts(container);
      expect(texts).toEqual(projects.map(() => bar(0)));
      expect(texts[0]).toHaveLength(bar(1).length);
    });
  });
});
