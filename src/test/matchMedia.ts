import { vi } from 'vitest';

type Matcher = (query: string) => boolean;

let matcher: Matcher = () => false;

/** Make `matchMedia(query).matches` return `fn(query)` for the rest of the test. */
export function mockMatchMedia(fn: Matcher): void {
  matcher = fn;
}

/** Shorthand for the common case. */
export function mockReducedMotion(reduce = true): void {
  mockMatchMedia((q) => reduce && q.includes('prefers-reduced-motion: reduce'));
}

export function resetMatchMedia(): void {
  matcher = () => false;
}

export function installMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      get matches() {
        return matcher(query);
      },
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  });
}
