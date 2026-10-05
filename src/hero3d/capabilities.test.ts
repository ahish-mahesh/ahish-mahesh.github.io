import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSlowDevice, supportsWebGL } from './capabilities.ts';

afterEach(() => {
  vi.restoreAllMocks();
});

function stubGetContext(impl: (type: string) => unknown): void {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    impl as unknown as typeof HTMLCanvasElement.prototype.getContext,
  );
}

describe('supportsWebGL', () => {
  it('is true when a context is created, and releases it', () => {
    const loseContext = vi.fn();
    stubGetContext(() => ({ getExtension: () => ({ loseContext }) }));
    expect(supportsWebGL()).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
  });

  it('is true when the lose-context extension is missing', () => {
    stubGetContext(() => ({ getExtension: () => null }));
    expect(supportsWebGL()).toBe(true);
  });

  it('falls back to webgl when webgl2 is unavailable', () => {
    const seen: string[] = [];
    stubGetContext((type) => {
      seen.push(type);
      return type === 'webgl' ? { getExtension: () => null } : null;
    });
    expect(supportsWebGL()).toBe(true);
    expect(seen).toEqual(['webgl2', 'webgl']);
  });

  it('is false when no context is available', () => {
    stubGetContext(() => null);
    expect(supportsWebGL()).toBe(false);
  });

  it('is false when getContext throws', () => {
    stubGetContext(() => {
      throw new Error('nope');
    });
    expect(supportsWebGL()).toBe(false);
  });
});

function fakeNav(props: Record<string, unknown>): Navigator {
  return props as unknown as Navigator;
}

describe('isSlowDevice', () => {
  it('is false for a capable device', () => {
    expect(isSlowDevice(fakeNav({ hardwareConcurrency: 8, deviceMemory: 8 }))).toBe(false);
  });

  it('is false when nothing is reported', () => {
    expect(isSlowDevice(fakeNav({}))).toBe(false);
  });

  it('is true with saveData on', () => {
    expect(isSlowDevice(fakeNav({ hardwareConcurrency: 8, connection: { saveData: true } }))).toBe(
      true,
    );
  });

  it('is false with saveData off', () => {
    expect(isSlowDevice(fakeNav({ connection: { saveData: false } }))).toBe(false);
  });

  it('is true with 2 or fewer cores', () => {
    expect(isSlowDevice(fakeNav({ hardwareConcurrency: 2 }))).toBe(true);
    expect(isSlowDevice(fakeNav({ hardwareConcurrency: 3 }))).toBe(false);
  });

  it('is true under 4GB of memory', () => {
    expect(isSlowDevice(fakeNav({ deviceMemory: 2 }))).toBe(true);
    expect(isSlowDevice(fakeNav({ deviceMemory: 4 }))).toBe(false);
  });
});
