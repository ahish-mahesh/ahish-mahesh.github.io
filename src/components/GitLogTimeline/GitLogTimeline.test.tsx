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

describe('GitLogTimeline', () => {
  it('renders one article per entry', () => {
    render(<GitLogTimeline />);
    expect(screen.getAllByRole('article')).toHaveLength(experience.length);
  });

  it('opens vffice and kla-engineer by default', () => {
    render(<GitLogTimeline />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(experience.length);
    buttons.forEach((b, i) => {
      const id = experience[i]?.id ?? '';
      expect(b.getAttribute('aria-expanded')).toBe(
        ['vffice', 'kla-engineer'].includes(id) ? 'true' : 'false',
      );
    });
    expect(screen.getByText(experience[0]?.bullets[0] ?? '')).toBeVisible();
  });

  it('renders each graph label in a <time> element', () => {
    const { container } = render(<GitLogTimeline />);
    const times = [...container.querySelectorAll('button time')];
    expect(times.map((t) => t.textContent)).toEqual(experience.map((e) => e.graphLabel));
    experience.forEach((e, i) => {
      expect(times[i]?.getAttribute('datetime')).toBe(e.start);
    });
  });

  it('decorates the first commit with HEAD -> main and the award with a tag, aria-hidden', () => {
    const { container } = render(<GitLogTimeline />);
    const decor = [...container.querySelectorAll('button [aria-hidden="true"]')].filter((el) =>
      /^\(.*\)\s*$/.test(el.textContent),
    );
    expect(decor.map((el) => el.textContent.trim())).toEqual([
      '(HEAD -> main)',
      '(tag: hackathon-2024)',
    ]);
    expect(toggleAt('vffice').textContent).not.toContain('now');
  });

  it('shows the date range and location in the expanded panel', () => {
    render(<GitLogTimeline />);
    const panel = panelOf(toggleAt('vffice'));
    const first = panel.querySelector('p');
    expect(first?.querySelector('time')?.textContent).toBe(experience[0]?.dateLabel);
    expect(first?.textContent).toContain(experience[0]?.location ?? '');
  });

  it('shows a [+] / [-] marker on desktop rows that flips with aria-expanded', () => {
    render(<GitLogTimeline />);
    const closed = toggleAt('concordia-ta');
    const open = toggleAt('vffice');
    const marker = (b: HTMLElement) => b.querySelector('[aria-hidden="true"]:last-child');
    expect(marker(closed)?.textContent).toBe('[+]');
    expect(marker(open)?.textContent).toBe('[-]');
    fireEvent.click(closed);
    expect(marker(closed)?.textContent).toBe('[-]');
  });

  it('keeps the now suffix and HEAD decoration on the narrow first commit', () => {
    mockMatchMedia((q) => q === NARROW_QUERY);
    const { container } = render(<GitLogTimeline />);
    expect(screen.getAllByText(/· now/)).toHaveLength(1);
    expect(toggleAt('vffice').textContent).toContain('(HEAD -> main)');
    expect(container.textContent).not.toContain('tag:');
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

  it('shows an aria-hidden [+] / [-] marker on a narrow screen too', () => {
    mockMatchMedia((q) => q === NARROW_QUERY);
    const { container } = render(<GitLogTimeline />);
    const markers = () =>
      [...container.querySelectorAll('button [aria-hidden="true"]')].filter((el) =>
        /^\[[+-]\]$/.test(el.textContent),
      );
    expect(markers()).toHaveLength(experience.length);
    expect(markers().every((el) => el.textContent === '[+]')).toBe(true);
    const btn = toggleAt('concordia-ta');
    fireEvent.click(btn);
    expect(btn.querySelector('[aria-hidden="true"]')?.textContent).toBe('[-]');
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
    const btn = toggleAt('concordia-ta');
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
    const btn = toggleAt('concordia-ta');
    const panel = panelOf(btn);
    fireEvent(panel, new Event('beforematch'));
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('hidden')).toBe(false);
  });

  it('puts the award text inside the kla-engineer panel', () => {
    render(<GitLogTimeline />);
    expect(panelOf(toggleAt('kla-engineer')).textContent).toContain(
      '1st place, KLA Hackathon 2024',
    );
  });

  it('draws an aria-hidden fork and merge diagonal around the side branch', () => {
    const { container } = render(<GitLogTimeline />);
    const forks = container.querySelectorAll('svg');
    expect(forks).toHaveLength(2);
    forks.forEach((f) => {
      expect(f.getAttribute('aria-hidden')).toBe('true');
    });
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
