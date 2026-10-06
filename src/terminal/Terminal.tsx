import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap.ts';
import { TOUCH_QUERY, useMediaQuery } from '../hooks/useMediaQuery.ts';
import { useTheme } from '../theme/useTheme.ts';
import { execute } from './execute.ts';
import { emptyHistory, historyNext, historyPrev, pushHistory } from './history.ts';
import { complete } from './parser.ts';
import { commands } from './registry.ts';
import { isBacktickChar, isCtrlK, type TerminalProps } from './terminalContext.ts';
import styles from './Terminal.module.css';
import type { Line, Output, Session, Span, TerminalCtx } from './types.ts';

const PROMPT = 'ahish@montreal:~$ ';
const BANNER: Line = [
  { text: 'type help to see commands. tab completes, esc closes.', tone: 'muted' },
];
const TOUCH_BANNER: Line = [
  { text: 'type help to see commands, or tap one below.', tone: 'muted' },
];

/** Real, non-hidden commands. Tapping one runs it as if typed. */
const CHIPS = ['help', 'ls', 'whoami', 'experience', 'contact'] as const;

interface Entry {
  readonly id: number;
  readonly line: Line;
}

function promptOf(session: Session | null): string {
  const p = session?.prompt ?? PROMPT;
  return p.endsWith(' ') ? p : `${p} `;
}

function textOf(line: Line): string {
  return typeof line === 'string' ? line : line.map((s) => s.text).join('');
}

function openUrl(href: string): void {
  window.location.href = href;
}

function download(href: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = '';
  document.body.append(a);
  a.click();
  a.remove();
}

function SpanView({ span }: { span: Span }) {
  const className = span.tone ? styles[span.tone] : undefined;
  if (span.href !== undefined) {
    const external = /^https?:/.test(span.href);
    return (
      <a href={span.href} className={className} rel={external ? 'noreferrer' : undefined}>
        {span.text}
      </a>
    );
  }
  return <span className={className}>{span.text}</span>;
}

function LineView({ line }: { line: Line }) {
  // Runs of spaces mean columns (tables, neofetch): keep them on one line and let
  // the log scroll sideways. Prose wraps.
  const className = / {2}/.test(textOf(line)) ? styles.pre : styles.line;
  return (
    <div className={className}>
      {typeof line === 'string' ? line : line.map((span, i) => <SpanView key={i} span={span} />)}
    </div>
  );
}

/** The drop-down console. Lazy-loaded; stays mounted once opened so scrollback survives. */
export default function Terminal({ open, crt, setCrt, onClose, goTo }: TerminalProps) {
  const { theme, themes, setTheme } = useTheme();
  const touch = useMediaQuery(TOUCH_QUERY);
  const [entries, setEntries] = useState<readonly Entry[]>(() => [
    {
      id: 0,
      line:
        typeof window.matchMedia === 'function' && window.matchMedia(TOUCH_QUERY).matches
          ? TOUCH_BANNER
          : BANNER,
    },
  ]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState(emptyHistory);
  const [session, setSession] = useState<Session | null>(null);
  const nextId = useRef(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [entries, open]);

  // Close keys work from anywhere in the panel, not just the input.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (e.key === 'Escape' || isCtrlK(e) || isBacktickChar(e)) {
        e.preventDefault();
        onClose();
      }
    };
    // A click on the panel's empty space puts the caret back, like a real terminal.
    const onPointerUp = (e: PointerEvent) => {
      const selecting = (window.getSelection()?.toString() ?? '') !== '';
      if (selecting || !(e.target instanceof Element)) return;
      if (e.target.closest('a, button, input')) return;
      inputRef.current?.focus({ preventScroll: true });
    };
    panel.addEventListener('keydown', onKey);
    panel.addEventListener('pointerup', onPointerUp);
    return () => {
      panel.removeEventListener('keydown', onKey);
      panel.removeEventListener('pointerup', onPointerUp);
    };
  }, [open, onClose]);

  const toEntries = (lines: Output): Entry[] =>
    lines.map((line) => {
      const id = nextId.current;
      nextId.current += 1;
      return { id, line };
    });

  const echo = (input: string): Line => [
    { text: promptOf(session), tone: 'accent' },
    { text: input },
  ];

  const run = (input: string = value) => {
    const nextHistory = pushHistory(history, input);
    let cleared = false;
    let nextSession = session;
    const ctx: TerminalCtx = {
      commands,
      history: nextHistory.entries,
      theme,
      themes,
      setTheme,
      crt,
      setCrt,
      clear: () => {
        cleared = true;
      },
      close: onClose,
      goTo,
      openUrl,
      download,
      enterSession: (s) => {
        nextSession = s;
      },
      exitSession: () => {
        nextSession = null;
      },
    };

    let output: Output;
    try {
      output = execute(input, ctx, session);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      output = [[{ text: `error: ${message}`, tone: 'error' }]];
    }

    const [echoed, ...rest] = toEntries([echo(input), ...output]);
    setEntries((prev) => (cleared || !echoed ? rest : [...prev, echoed, ...rest]));
    setHistory(nextHistory);
    setSession(nextSession);
    // A chip tap leaves a half-typed command alone.
    if (input === value) setValue('');
  };

  const runChip = (name: string) => {
    run(name);
    inputRef.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (session) return;
      const result = complete(value, commands);
      setValue(result.value);
      if (result.candidates.length > 0) {
        const lines = toEntries([
          echo(value),
          [{ text: result.candidates.join('  '), tone: 'muted' }],
        ]);
        setEntries((prev) => [...prev, ...lines]);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.key === 'ArrowUp' ? historyPrev(history, value) : historyNext(history, value);
      setHistory(step.state);
      setValue(step.value);
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  const prompt = promptOf(session);

  return createPortal(
    <div
      ref={panelRef}
      className={styles.panel}
      data-open={open ? 'true' : 'false'}
      data-terminal=""
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminal-title"
      aria-describedby="terminal-hint"
      inert={!open}
    >
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <h2 id="terminal-title" className="visually-hidden">
            terminal
          </h2>
          <p id="terminal-hint" className={styles.hint}>
            {touch ? 'tap a command or type one' : 'tab completes, escape closes'}
          </p>
          <button type="button" className={styles.close} onClick={onClose}>
            {touch ? null : <span aria-hidden="true">[esc] </span>}close
          </button>
        </div>
      </div>
      <div ref={scrollerRef} className={styles.scroller}>
        <div className={styles.column}>
          <div role="log" aria-live="polite" className={styles.log}>
            {entries.map((entry) => (
              <LineView key={entry.id} line={entry.line} />
            ))}
          </div>
          {touch && !session ? (
            <div role="group" aria-label="commands" className={styles.chips}>
              {CHIPS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={styles.chip}
                  onClick={() => {
                    runChip(name);
                  }}
                >
                  <span aria-hidden="true">[ </span>
                  {name}
                  <span aria-hidden="true"> ]</span>
                </button>
              ))}
            </div>
          ) : null}
          <div className={styles.inputRow}>
            <label htmlFor="terminal-input" className="visually-hidden">
              command
            </label>
            <span aria-hidden="true" className={styles.prompt}>
              {prompt}
            </span>
            <input
              ref={inputRef}
              id="terminal-input"
              className={styles.input}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="send"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
