import { resolve, tokenize } from './parser.ts';
import type { Output, Session, TerminalCtx } from './types.ts';

/**
 * Run one submitted line and return what to print. An active session (e.g. psql)
 * gets the raw line; otherwise it is parsed and dispatched through `ctx.commands`.
 * The caller echoes the prompt line and records history before calling this.
 */
export function execute(input: string, ctx: TerminalCtx, session: Session | null): Output {
  if (session) return session.run(input, ctx);

  const tokens = tokenize(input);
  if (!tokens.ok) return [[{ text: `parse error: ${tokens.error}`, tone: 'error' }]];
  if (tokens.argv.length === 0) return [];

  const r = resolve(tokens.argv, ctx.commands);
  if (r.found) return r.command.run(r.args, ctx);

  const line = [{ text: `command not found: ${r.name}`, tone: 'error' as const }];
  return r.suggestion === undefined
    ? [line, [{ text: 'type help to see what is here', tone: 'muted' }]]
    : [line, [{ text: `did you mean ${r.suggestion}?`, tone: 'muted' }]];
}
