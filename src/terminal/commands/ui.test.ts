import { describe, expect, it } from 'vitest';
import { THEMES } from '../../theme/themes.ts';
import { lineText, outputText } from '../format.ts';
import { fakeCtx } from '../testCtx.ts';
import { clearCommand } from './clear.ts';
import { crtCommand } from './crt.ts';
import { exitCommand } from './exit.ts';
import { historyCommand } from './history.ts';
import { themeCommand } from './theme.ts';

describe('theme', () => {
  it('shows the current theme and the choices with no argument', () => {
    const ctx = fakeCtx({ theme: 'amber' });
    const out = themeCommand.run([], ctx);
    expect(outputText(out)).toEqual(['theme: amber', 'available: phosphor amber paper']);
    expect(out[1]).toEqual([{ text: 'available: phosphor amber paper', tone: 'muted' }]);
    expect(ctx.setTheme).not.toHaveBeenCalled();
  });

  it.each(THEMES)('switches to %s, case-insensitively', (name) => {
    const ctx = fakeCtx();
    expect(outputText(themeCommand.run([name.toUpperCase()], ctx))).toEqual([
      `theme set to ${name}`,
    ]);
    expect(ctx.setTheme).toHaveBeenCalledExactlyOnceWith(name);
  });

  it('rejects unknown themes with a suggestion', () => {
    const ctx = fakeCtx();
    const out = themeCommand.run(['phospor'], ctx);
    expect(ctx.setTheme).not.toHaveBeenCalled();
    expect(out[0]).toEqual([{ text: "theme: unknown theme 'phospor'", tone: 'error' }]);
    expect(out[1]).toEqual([{ text: 'did you mean phosphor?', tone: 'muted' }]);
  });

  it('lists the themes when nothing is close', () => {
    const out = themeCommand.run(['zzzzzz'], fakeCtx());
    expect(lineText(out[1] ?? '')).toBe('available: phosphor amber paper');
  });

  it('completes the theme names', () => {
    expect(themeCommand.complete?.([])).toEqual([...THEMES]);
  });
});

describe('crt', () => {
  it('reports the state with no argument', () => {
    expect(outputText(crtCommand.run([], fakeCtx({ crt: false })))).toEqual([
      'crt is off. usage: crt on|off',
    ]);
    expect(outputText(crtCommand.run([], fakeCtx({ crt: true })))).toEqual([
      'crt is on. usage: crt on|off',
    ]);
  });

  it('turns it on and off', () => {
    const ctx = fakeCtx();
    expect(outputText(crtCommand.run(['on'], ctx))).toEqual(['crt on']);
    expect(ctx.setCrt).toHaveBeenLastCalledWith(true);
    expect(outputText(crtCommand.run(['OFF'], ctx))).toEqual(['crt off']);
    expect(ctx.setCrt).toHaveBeenLastCalledWith(false);
  });

  it('rejects anything else', () => {
    const ctx = fakeCtx();
    expect(crtCommand.run(['maybe'], ctx)).toEqual([
      [{ text: 'usage: crt on|off', tone: 'error' }],
    ]);
    expect(ctx.setCrt).not.toHaveBeenCalled();
  });

  it('completes on and off', () => {
    expect(crtCommand.complete?.([])).toEqual(['on', 'off']);
  });
});

describe('clear', () => {
  it('clears and prints nothing', () => {
    const ctx = fakeCtx();
    expect(clearCommand.run([], ctx)).toEqual([]);
    expect(ctx.clear).toHaveBeenCalledOnce();
  });
});

describe('exit', () => {
  it('closes and prints nothing', () => {
    const ctx = fakeCtx();
    expect(exitCommand.run([], ctx)).toEqual([]);
    expect(ctx.close).toHaveBeenCalledOnce();
  });
});

describe('history', () => {
  it('numbers the lines, ending with history itself as bash does', () => {
    const ctx = fakeCtx({ history: ['help', 'ls', 'history'] });
    expect(outputText(historyCommand.run([], ctx))).toEqual(['1  help', '2  ls', '3  history']);
  });

  it('right-aligns the numbers', () => {
    const history = Array.from({ length: 10 }, (_, i) => `cmd${String(i)}`);
    const out = outputText(historyCommand.run([], fakeCtx({ history })));
    expect(out[0]).toBe(' 1  cmd0');
    expect(out[9]).toBe('10  cmd9');
  });

  it('prints nothing for an empty history', () => {
    expect(historyCommand.run([], fakeCtx())).toEqual([]);
  });
});
