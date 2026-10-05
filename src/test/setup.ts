import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { installMatchMedia, resetMatchMedia } from './matchMedia.ts';

// jsdom has neither API. matchMedia answers false unless a test calls mockMatchMedia.
installMatchMedia();

class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly scrollMargin = '0px';
  readonly thresholds: readonly number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver = NoopIntersectionObserver;

// Vitest globals are off, so React Testing Library cannot register its own cleanup.
afterEach(() => {
  cleanup();
  resetMatchMedia();
});
