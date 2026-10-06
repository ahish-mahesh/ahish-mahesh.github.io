import { act, render, screen, waitFor, within } from '@testing-library/react';
import { LazyMotion, domAnimation } from 'motion/react';
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
    expect(screen.getByText(/^Tasks: 4 total, 0 complete; sorted by impact$/)).toBeVisible();
  });

  describe('bars', () => {
    function barTexts(container: HTMLElement): (string | null)[] {
      return Array.from(
        container.querySelectorAll('li[id^="project-"] button > span[aria-hidden]'),
      ).map((el) => el.textContent);
    }

    const KLA = 0;

    function rowButton(name: RegExp): HTMLElement {
      return screen.getByRole('button', { name });
    }

    it('starts every bar empty, at full width', () => {
      const { container } = render(<ProcessList />);
      const texts = barTexts(container);
      expect(texts).toEqual(projects.map(() => bar(0)));
      expect(texts[0]).toHaveLength(bar(1).length);
    });

    it('starts every bar empty under reduced motion', () => {
      mockReducedMotion();
      const { container } = render(<ProcessList />);
      expect(barTexts(container)).toEqual(projects.map(() => bar(0)));
    });

    it('fills only the opened row and keeps it full after collapsing and reopening', async () => {
      mockReducedMotion();
      const user = userEvent.setup();
      const { container } = render(<ProcessList />);
      const button = rowButton(/kla-pg-migration/);
      const expected = projects.map((_, i) => (i === KLA ? bar(1) : bar(0)));
      await user.click(button);
      expect(barTexts(container)).toEqual(expected);
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(barTexts(container)).toEqual(expected);
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(barTexts(container)).toEqual(expected);
    });

    it('counts opened rows in the status line, and keeps counting after collapse', async () => {
      const user = userEvent.setup();
      render(<ProcessList />);
      expect(screen.getByText(/^Tasks: 4 total, 0 complete;/)).toBeVisible();
      const button = rowButton(/kla-pg-migration/);
      await user.click(button);
      expect(screen.getByText(/^Tasks: 4 total, 1 complete;/)).toBeVisible();
      await user.click(button);
      expect(screen.getByText(/^Tasks: 4 total, 1 complete;/)).toBeVisible();
    });

    it('fills the bar when the browser finds text inside a closed row', () => {
      mockReducedMotion();
      const { container } = render(<ProcessList />);
      const panel = document.getElementById('panel-kla-pg-migration');
      if (!panel) throw new Error('missing panel');
      act(() => {
        panel.dispatchEvent(new Event('beforematch'));
      });
      expect(barTexts(container)[KLA]).toBe(bar(1));
    });

    it('fills the bar of a row opened by the hash on load', () => {
      mockReducedMotion();
      window.location.hash = '#project-kla-pg-migration';
      const { container } = render(<ProcessList />);
      expect(barTexts(container)).toEqual(projects.map((_, i) => (i === KLA ? bar(1) : bar(0))));
      expect(screen.getByText(/^Tasks: 4 total, 1 complete;/)).toBeVisible();
    });

    it('animates to full after opening a row when motion is on', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <LazyMotion features={domAnimation} strict>
          <ProcessList />
        </LazyMotion>,
      );
      const seen: string[] = [];
      const observer = new MutationObserver(() => {
        seen.push(barTexts(container)[KLA] ?? '');
      });
      observer.observe(container, { childList: true, characterData: true, subtree: true });
      await user.click(rowButton(/kla-pg-migration/));
      await waitFor(
        () => {
          expect(barTexts(container)[KLA]).toBe(bar(1));
        },
        { timeout: 2000 },
      );
      observer.disconnect();
      for (const text of seen) expect(text).toHaveLength(bar(1).length);
    });
  });
});
