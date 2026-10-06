import { skills } from '../../content/skills.ts';
import { error, muted, psqlTable } from '../format.ts';
import type { Command, Output, Session } from '../types.ts';

const SELECT = /^select\s+\*\s+from\s+([^\s;]+)\s*;?$/i;

function skillsTable(): Output {
  return psqlTable(
    ['key', 'values'],
    skills.map((s) => [s.key, s.values.join(', ')]),
  );
}

export const psqlSession: Session = {
  prompt: 'postgres=# ',
  run(line, ctx) {
    const input = line.trim();
    if (input === '') return [];

    const lower = input.toLowerCase();
    if (input === '\\q' || lower === 'exit' || lower === 'quit') {
      ctx.exitSession();
      return [];
    }
    if (input === '\\dt') {
      return psqlTable(
        ['Schema', 'Name', 'Type', 'Owner'],
        [['public', 'skills', 'table', 'ahish']],
        'List of relations',
      );
    }

    const select = SELECT.exec(input);
    if (select) {
      const relation = select[1] ?? '';
      const name = relation.toLowerCase();
      if (name === 'skills' || name === 'public.skills') return skillsTable();
      return [error(`ERROR:  relation "${relation}" does not exist`)];
    }
    return [error('ERROR:  syntax error. try: SELECT * FROM skills;')];
  },
};

export const psqlCommand: Command = {
  name: 'psql',
  description: 'a database prompt',
  hidden: true,
  run(_args, ctx) {
    ctx.enterSession(psqlSession);
    return [muted('psql: type \\q to quit, \\dt to list tables.')];
  },
};
