import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { experience } from '../../content/experience.ts';
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
});
