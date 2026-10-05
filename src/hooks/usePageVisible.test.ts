import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { usePageVisible } from './usePageVisible.ts';

function setVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
  document.dispatchEvent(new Event('visibilitychange'));
}

afterEach(() => {
  // Drop the own-property override so jsdom's prototype getter shows through again.
  Reflect.deleteProperty(document, 'visibilityState');
});

describe('usePageVisible', () => {
  it('starts true when the tab is visible', () => {
    const { result } = renderHook(() => usePageVisible());
    expect(result.current).toBe(true);
  });

  it('flips with visibilitychange', () => {
    const { result } = renderHook(() => usePageVisible());
    act(() => {
      setVisibility('hidden');
    });
    expect(result.current).toBe(false);
    act(() => {
      setVisibility('visible');
    });
    expect(result.current).toBe(true);
  });
});
