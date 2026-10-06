import {
  type ComponentType,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { applyCrt, readStoredCrt, writeStoredCrt } from '../theme/crt.ts';
import {
  inTerminal,
  isBacktickKey,
  isCtrlK,
  TERMINAL_TRIGGER_ID,
  TerminalContext,
  type TerminalContextValue,
  type TerminalProps,
} from './terminalContext.ts';

function load() {
  return import('./Terminal.tsx');
}

// If the chunk fails to load (offline), close again rather than crash the page.
function Unavailable({ open, onClose }: TerminalProps) {
  useEffect(() => {
    if (open) onClose();
  }, [open, onClose]);
  return null;
}

const Terminal = lazy((): Promise<{ default: ComponentType<TerminalProps> }> =>
  load().catch(() => ({ default: Unavailable })),
);

function preloadChunk(): void {
  load().catch(() => undefined);
}

function setRootInert(on: boolean): void {
  document.getElementById('root')?.toggleAttribute('inert', on);
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.matches('input, textarea, select') ||
    target.closest('[contenteditable]:not([contenteditable="false"])') !== null
  );
}

function trigger(): HTMLElement | null {
  return document.getElementById(TERMINAL_TRIGGER_ID);
}

/** Owns the terminal's open state and loads the panel itself on demand. */
export function TerminalLauncher({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [crt, setCrtState] = useState(
    () => document.documentElement.dataset.crt === 'on' || readStoredCrt(),
  );
  const openRef = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    applyCrt(crt);
  }, [crt]);

  const setCrt = useCallback((on: boolean) => {
    setCrtState(on);
    writeStoredCrt(on);
  }, []);

  const openTerminal = useCallback(() => {
    if (openRef.current) return;
    openRef.current = true;
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
    setRootInert(true);
    setLoaded(true);
    setOpen(true);
  }, []);

  // Un-inert first: an inert element cannot take focus.
  const shut = useCallback((): HTMLElement | null => {
    openRef.current = false;
    setRootInert(false);
    setOpen(false);
    const back = returnFocus.current;
    returnFocus.current = null;
    return back?.isConnected ? back : null;
  }, []);

  const close = useCallback(() => {
    if (!openRef.current) return;
    (shut() ?? trigger())?.focus({ preventScroll: true });
  }, [shut]);

  const toggle = useCallback(() => {
    if (openRef.current) close();
    else openTerminal();
  }, [close, openTerminal]);

  const goTo = useCallback(
    (hash: string, focusId?: string) => {
      shut();
      if (window.location.hash === hash) {
        // Same hash: no hashchange would fire, so scroll and announce it ourselves.
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else {
        window.location.hash = hash;
      }
      const target = focusId === undefined ? null : document.getElementById(focusId);
      if (target) {
        target.focus({ preventScroll: true });
      } else if (document.activeElement instanceof HTMLElement) {
        // Let the hash target be where the next Tab starts.
        document.activeElement.blur();
      }
    },
    [shut],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || inTerminal(e.target)) return;
      if (isCtrlK(e)) {
        e.preventDefault();
        toggle();
      } else if (isBacktickKey(e) && !isEditable(e.target)) {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && openRef.current) {
        close();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!openRef.current || inTerminal(e.target)) return;
      // The `>_` button toggles itself on click.
      if (e.target instanceof Node && trigger()?.contains(e.target)) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [toggle, close]);

  // Fetch the chunk once the page has settled, so the first open is instant.
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const afterLoad = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(preloadChunk);
      } else {
        timeoutId = window.setTimeout(preloadChunk, 200);
      }
    };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
    return () => {
      window.removeEventListener('load', afterLoad);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  const value = useMemo<TerminalContextValue>(
    () => ({ open, toggle, openTerminal, close, preload: preloadChunk }),
    [open, toggle, openTerminal, close],
  );

  return (
    <TerminalContext value={value}>
      {children}
      {loaded ? (
        <Suspense fallback={null}>
          <Terminal open={open} crt={crt} setCrt={setCrt} onClose={close} goTo={goTo} />
        </Suspense>
      ) : null}
    </TerminalContext>
  );
}
