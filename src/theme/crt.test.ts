import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyCrt, readStoredCrt, writeStoredCrt } from './crt.ts';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  delete document.documentElement.dataset.crt;
});

describe('crt', () => {
  it('is off by default', () => {
    expect(readStoredCrt()).toBe(false);
  });

  it('round-trips through storage', () => {
    writeStoredCrt(true);
    expect(localStorage.getItem('crt')).toBe('on');
    expect(readStoredCrt()).toBe(true);
    writeStoredCrt(false);
    expect(readStoredCrt()).toBe(false);
  });

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => {
      writeStoredCrt(true);
    }).not.toThrow();
    expect(readStoredCrt()).toBe(false);
  });

  it('sets the attribute when on and removes it when off', () => {
    applyCrt(true);
    expect(document.documentElement.dataset.crt).toBe('on');
    applyCrt(false);
    expect(document.documentElement).not.toHaveAttribute('data-crt');
  });
});
