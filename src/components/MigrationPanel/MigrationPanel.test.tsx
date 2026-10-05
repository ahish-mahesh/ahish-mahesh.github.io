import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { migration } from '../../content/migration.ts';
import { mockReducedMotion } from '../../test/matchMedia.ts';
import { MigrationPanel } from './MigrationPanel.tsx';

function animated(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[aria-hidden="true"]');
  if (!el) throw new Error('aria-hidden block not found');
  return el;
}

const norm = (s: string) => s.replace(/\s+/g, ' ');

describe('MigrationPanel', () => {
  it('shows the end state statically under reduced motion', () => {
    mockReducedMotion();
    const { container } = render(<MigrationPanel />);
    const text = animated(container).textContent;
    expect(text).toContain('1,200 / 1,200');
    expect(text).toContain("WHERE o.created > now() - interval '7 days'");
    expect(text).toContain('-25%');
    expect(screen.queryByRole('button', { name: /replay/ })).toBeNull();
  });

  it('always carries the final state for assistive tech', () => {
    for (const reduce of [true, false]) {
      mockReducedMotion(reduce);
      const { container, unmount } = render(<MigrationPanel />);
      const hidden = container.querySelector('.visually-hidden');
      const text = norm(hidden?.textContent ?? '');
      expect(text).toContain('1,200 queries translated');
      expect(text).toContain('SELECT TOP 10');
      expect(text).toContain('LIMIT 10;');
      expect(text).toContain('product cost down 25%');
      unmount();
    }
  });

  it('starts at zero with a working replay button', () => {
    mockReducedMotion(false);
    const { container } = render(<MigrationPanel />);
    expect(animated(container).textContent).toContain('    0 / 1,200');
    const replay = screen.getByRole('button', { name: /replay/ });
    replay.focus();
    expect(document.activeElement).toBe(replay);
    expect(() => {
      fireEvent.click(replay);
    }).not.toThrow();
  });

  it('keeps both snippets the same shape', () => {
    const a = migration.tsql.split('\n');
    const b = migration.postgres.split('\n');
    expect(a.length).toBe(b.length);
    expect(new Set([...a, ...b].map((l) => l.length)).size).toBe(1);
  });
});
