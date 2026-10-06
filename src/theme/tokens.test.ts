/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import { THEMES } from './themes.ts';

// vitest blanks .css imports (even ?raw), so read the file directly.
const css = readFileSync(resolve(process.cwd(), 'src/theme/tokens.css'), 'utf8');

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function themeBlock(theme: string): Record<string, string> {
  const re = new RegExp(`:root\\[data-theme='${theme}'\\][^{]*\\{([^}]*)\\}`);
  const body = re.exec(css)?.[1] ?? '';
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[m[1] ?? ''] = m[2] ?? '';
  }
  return out;
}

describe('theme tokens', () => {
  it.each(THEMES)('%s has all colors passing WCAG AA', (theme) => {
    const t = themeBlock(theme);
    for (const key of ['bg', 'fg', 'accent', 'muted', 'num', 'ident']) {
      expect(t[key], `${theme} --${key}`).toBeDefined();
    }
    const bg = t.bg ?? '';
    for (const key of ['fg', 'accent', 'muted', 'num', 'ident']) {
      expect(contrast(t[key] ?? '', bg), `${theme} ${key}/bg`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('light-scheme fallback matches the paper theme', () => {
    const m = /@media \(prefers-color-scheme: light\)\s*\{[^{]*\{([^}]*)\}/.exec(css);
    expect(m).not.toBeNull();
    const fallback: Record<string, string> = {};
    for (const c of (m?.[1] ?? '').matchAll(/--([a-z]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
      fallback[c[1] ?? ''] = c[2] ?? '';
    }
    expect(Object.keys(fallback).length).toBeGreaterThanOrEqual(6);
    expect(fallback).toEqual(themeBlock('paper'));
  });

  it('index.html bootstrap theme list matches THEMES', () => {
    const m = /var themes = (\[[^\]]*\]);/.exec(html);
    expect(m).not.toBeNull();
    const list = JSON.parse((m?.[1] ?? '[]').replace(/'/g, '"')) as string[];
    expect(list).toEqual([...THEMES]);
  });
});
