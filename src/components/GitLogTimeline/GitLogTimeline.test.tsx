import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { experience } from '../../content/experience.ts';
import { mockReducedMotion } from '../../test/matchMedia.ts';
import { GitLogTimeline } from './GitLogTimeline.tsx';

describe('GitLogTimeline', () => {
  it('renders one article per entry', () => {
    render(<GitLogTimeline />);
    expect(screen.getAllByRole('article')).toHaveLength(experience.length);
  });

  it('keeps the HEAD decoration out of the accessibility tree', () => {
    const { container } = render(<GitLogTimeline />);
    expect(container.textContent).toContain('(HEAD -> main)');
    const hidden = [...container.querySelectorAll('[aria-hidden="true"]')].filter(
      (el) => el.textContent.trim() === '(HEAD -> main)',
    );
    expect(hidden).toHaveLength(1);
  });

  it('draws fork and merge rows around the side branch', () => {
    const { container } = render(<GitLogTimeline />);
    expect(container.textContent).toContain('|\\');
    expect(container.textContent).toContain('|/');
  });

  it('renders an aria-hidden svg spine', () => {
    render(<GitLogTimeline />);
    expect(screen.getByTestId('spine').getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps article headings visible with motion on', () => {
    render(<GitLogTimeline />);
    for (const h of screen.getAllByRole('heading', { level: 3 })) {
      expect(h).toBeVisible();
      expect(h.closest('article')?.getAttribute('style') ?? '').not.toContain('opacity');
    }
  });

  it('draws the line fully and shows markers under reduced motion', () => {
    mockReducedMotion();
    const { container } = render(<GitLogTimeline />);
    const path = screen.getByTestId('spine').querySelector('path');
    // No pathLength binding means no dash gap: the stroke is fully drawn.
    expect(path?.hasAttribute('stroke-dasharray')).toBe(false);
    expect(path?.hasAttribute('stroke-dashoffset')).toBe(false);
    expect(path?.getAttribute('style') ?? '').not.toContain('stroke-dash');
    const hidden = [...container.querySelectorAll('span')].filter((el) =>
      el.getAttribute('style')?.includes('opacity: 0'),
    );
    expect(hidden).toHaveLength(0);
  });
});
