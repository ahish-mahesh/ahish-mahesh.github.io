import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockReducedMotion } from '../../test/matchMedia.ts';
import { DecodeText } from './DecodeText.tsx';

const TEXT = 'Ahish Mahesh';

function renderInHeading() {
  return render(
    <h1>
      <DecodeText text={TEXT} />
    </h1>,
  );
}

function animatedSpan(container: HTMLElement) {
  const el = container.querySelector('[aria-hidden="true"]');
  if (!el) throw new Error('aria-hidden span not found');
  return el;
}

describe('DecodeText', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the heading accessible name equal to the text', () => {
    renderInHeading();
    expect(screen.getByRole('heading', { name: TEXT })).toBeTruthy();
  });

  it('shows the final text immediately under reduced motion', () => {
    mockReducedMotion();
    const { container } = renderInHeading();
    expect(animatedSpan(container).textContent).toBe(TEXT);
  });

  it('starts scrambled with the same length and spaces in place', () => {
    const { container } = renderInHeading();
    const shown = animatedSpan(container).textContent;
    expect(shown).not.toBe(TEXT);
    expect(shown).toHaveLength(TEXT.length);
    for (let i = 0; i < TEXT.length; i += 1) {
      expect(shown.charAt(i) === ' ').toBe(TEXT.charAt(i) === ' ');
    }
  });

  it('resolves to the final text after a second', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    const { container } = renderInHeading();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(animatedSpan(container).textContent).toBe(TEXT);
  });
});
