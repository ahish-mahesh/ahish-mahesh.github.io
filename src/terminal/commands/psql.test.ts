import { describe, expect, it } from 'vitest';
import { skills } from '../../content/skills.ts';
import { outputText } from '../format.ts';
import { execute } from '../execute.ts';
import { fakeCtx } from '../testCtx.ts';
import { psqlCommand, psqlSession } from './psql.ts';

describe('psql command', () => {
  it('enters the session and prints a muted banner', () => {
    const ctx = fakeCtx();
    const out = psqlCommand.run([], ctx);
    expect(ctx.enterSession).toHaveBeenCalledExactlyOnceWith(psqlSession);
    expect(out).toEqual([
      [{ text: 'psql: type \\q to quit, \\dt to list tables.', tone: 'muted' }],
    ]);
  });

  it('is hidden and has no completion', () => {
    expect(psqlCommand.hidden).toBe(true);
    expect('complete' in psqlCommand).toBe(false);
  });

  it('is what execute enters for the typed command', () => {
    const ctx = fakeCtx();
    execute('psql', ctx, null);
    expect(ctx.enterSession).toHaveBeenCalledWith(psqlSession);
  });
});

describe('psql session', () => {
  it('uses the postgres prompt', () => {
    expect(psqlSession.prompt).toBe('postgres=# ');
  });

  it('ignores blank lines', () => {
    const ctx = fakeCtx();
    expect(psqlSession.run('   ', ctx)).toEqual([]);
    expect(ctx.exitSession).not.toHaveBeenCalled();
  });

  it.each(['\\q', '  \\q  ', 'exit', 'quit'])('exits on %j', (line) => {
    const ctx = fakeCtx();
    expect(psqlSession.run(line, ctx)).toEqual([]);
    expect(ctx.exitSession).toHaveBeenCalledOnce();
  });

  it('prints the skills table', () => {
    const out = outputText(psqlSession.run('SELECT * FROM skills;', fakeCtx()));
    const keyWidth = Math.max('key'.length, ...skills.map((s) => s.key.length));
    expect(out[0]?.trim()).toMatch(/^key +\| +values$/);
    expect(out[1]).toMatch(/^-+\+-+$/);
    expect(out[1]?.indexOf('+')).toBe(out[0]?.indexOf('|'));
    expect(out.slice(2, 2 + skills.length)).toEqual(
      skills.map((s) => ` ${s.key.padEnd(keyWidth)} | ${s.values.join(', ')}`),
    );
    expect(out.slice(2 + skills.length)).toEqual([`(${String(skills.length)} rows)`, '']);
  });

  it.each(['select * from skills', 'select   *   from   SKILLS ;', 'SELECT * FROM public.skills;'])(
    'matches %j',
    (line) => {
      const out = outputText(psqlSession.run(line, fakeCtx()));
      expect(out).toEqual(outputText(psqlSession.run('SELECT * FROM skills;', fakeCtx())));
    },
  );

  it('lists the relation with \\dt', () => {
    const out = outputText(psqlSession.run('\\dt', fakeCtx()));
    expect(out[0]).toBe(`${' '.repeat(8)}List of relations`);
    expect(out[1]).toBe(' Schema |  Name  | Type  | Owner');
    expect(out[2]).toBe('--------+--------+-------+-------');
    expect(out[3]).toBe(' public | skills | table | ahish');
    expect(out.slice(4)).toEqual(['(1 row)', '']);
  });

  it('reports a missing relation as real psql does', () => {
    const out = psqlSession.run('select * from users;', fakeCtx());
    expect(out).toEqual([[{ text: 'ERROR:  relation "users" does not exist', tone: 'error' }]]);
  });

  it('reports a syntax error with a hint', () => {
    const out = psqlSession.run('drop table skills;', fakeCtx());
    expect(out).toEqual([
      [{ text: 'ERROR:  syntax error. try: SELECT * FROM skills;', tone: 'error' }],
    ]);
  });

  it('is driven by execute while active', () => {
    const ctx = fakeCtx();
    expect(outputText(execute('SELECT * FROM skills;', ctx, psqlSession)).at(-2)).toBe(
      `(${String(skills.length)} rows)`,
    );
  });
});
