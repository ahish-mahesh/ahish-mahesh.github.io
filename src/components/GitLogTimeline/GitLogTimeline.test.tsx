import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { experience } from '../../content/experience.ts';
import { NARROW_QUERY } from '../../hooks/useMediaQuery.ts';
import { mockMatchMedia, mockReducedMotion } from '../../test/matchMedia.ts';
import { GitLogTimeline } from './GitLogTimeline.tsx';

function panelOf(button: HTMLElement): HTMLElement {
  const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
  if (!panel) throw new Error('missing panel');
  return panel;
}

/** Narrow commits read "role · date", so find them by position instead of by the role suffix. */
function toggleAt(id: string): HTMLElement {
  const button = screen.getAllByRole('button')[experience.findIndex((e) => e.id === id)];
  if (!button) throw new Error(id);
  return button;
}

function toggleFor(id: string): HTMLElement {
  const entry = experience.find((e) => e.id === id);
  if (!entry) throw new Error(id);
  return screen.getByRole('button', { name: new RegExp(`${entry.role}$`, 'i') });
}

describe('GitLogTimeline', () => {
  it('renders one article per entry', () => {
    render(<GitLogTimeline />);
    expect(screen.getAllByRole('article')).toHaveLength(experience.length);
  });

  it('opens only the first entry by default', () => {
    render(<GitLogTimeline />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(experience.length);
    buttons.forEach((b, i) => {
      expect(b.getAttribute('aria-expanded')).toBe(i === 0 ? 'true' : 'false');
    });
    expect(screen.getByText(experience[0]?.bullets[0] ?? '')).toBeVisible();
  });

  it('starts every commit collapsed on a narrow screen', () => {
    mockMatchMedia((q) => q === NARROW_QUERY);
    render(<GitLogTimeline />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(experience.length);
    buttons.forEach((b) => {
      expect(b.getAttribute('aria-expanded')).toBe('false');
      expect(panelOf(b).getAttribute('hidden')).toBe('until-found');
    });
  });

  it('shows an aria-hidden [+] / [-] marker on a narrow screen only', () => {
    mockMatchMedia((q) => q === NARROW_QUERY);
    const { container, unmount } = render(<GitLogTimeline />);
    const markers = () =>
      [...container.querySelectorAll('button [aria-hidden="true"]')].filter((el) =>
        /^\[[+-]\]$/.test(el.textContent),
      );
    expect(markers()).toHaveLength(experience.length);
    expect(markers().every((el) => el.textContent === '[+]')).toBe(true);
    const btn = toggleAt('concordia-ta');
    fireEvent.click(btn);
    expect(btn.querySelector('[aria-hidden="true"]')?.textContent).toBe('[-]');
    unmount();

    mockMatchMedia(() => false);
    const desktop = render(<GitLogTimeline />);
    expect(desktop.container.textContent).not.toMatch(/\[[+-]\]/);
  });

  it('keeps find-in-page working on a narrow screen', () => {
    mockMatchMedia((q) => q === NARROW_QUERY);
    render(<GitLogTimeline />);
    const btn = toggleAt('kla-engineer');
    fireEvent(panelOf(btn), new Event('beforematch'));
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('expands and collapses a commit on click', () => {
    render(<GitLogTimeline />);
    const btn = toggleFor('concordia-ta');
    const panel = panelOf(btn);
    expect(panel.getAttribute('hidden')).toBe('until-found');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('hidden')).toBe(false);
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(panel.getAttribute('hidden')).toBe('until-found');
  });

  it('opens a closed commit when the browser finds text in it', () => {
    render(<GitLogTimeline />);
    const btn = toggleFor('concordia-ta');
    const panel = panelOf(btn);
    fireEvent(panel, new Event('beforematch'));
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('hidden')).toBe(false);
  });

  it('keeps HEAD and tag decorations out of the accessibility tree', () => {
    const { container } = render(<GitLogTimeline />);
    const hidden = [...container.querySelectorAll('[aria-hidden="true"]')].map((el) =>
      el.textContent.trim(),
    );
    expect(hidden.filter((t) => t === '(HEAD -> main)')).toHaveLength(1);
    expect(hidden.filter((t) => t === '(tag: hackathon-2024)')).toHaveLength(1);
  });

  it('puts the award text inside the kla-engineer panel', () => {
    render(<GitLogTimeline />);
    expect(panelOf(toggleFor('kla-engineer')).textContent).toContain(
      '1st place, KLA Hackathon 2024',
    );
  });

  it('draws fork and merge rows around the side branch', () => {
    const { container } = render(<GitLogTimeline />);
    expect(container.textContent).toContain(' \\');
    expect(container.textContent).toContain(' /');
  });

  it('renders an aria-hidden spine', () => {
    render(<GitLogTimeline />);
    expect(screen.getByTestId('spine').getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the spine fully and shows markers under reduced motion', () => {
    mockReducedMotion();
    const { container } = render(<GitLogTimeline />);
    expect(screen.getByTestId('spine').getAttribute('style') ?? '').not.toContain('transform');
    const hidden = [...container.querySelectorAll('span')].filter((el) =>
      el.getAttribute('style')?.includes('opacity: 0'),
    );
    expect(hidden).toHaveLength(0);
  });
});
