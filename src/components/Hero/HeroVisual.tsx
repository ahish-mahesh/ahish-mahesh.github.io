import { lazy, Suspense, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { isSlowDevice, supportsWebGL } from '../../hero3d/capabilities.ts';
import { StaticFallback } from '../../hero3d/StaticFallback.tsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import styles from './Hero.module.css';

const AsciiHero = lazy(() => import('../../hero3d/AsciiHero.tsx'));

const WIDE_QUERY = '(min-width: 720px)';

function subscribeWide(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener('change', onChange);
  return () => {
    mql.removeEventListener('change', onChange);
  };
}

function getWide(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(WIDE_QUERY).matches;
}

function useWide(): boolean {
  return useSyncExternalStore(subscribeWide, getWide, () => false);
}

// A demotion (frame budget blown) lasts the rest of the session.
let demotedForSession = false;

/** Decorative hero art: a static ASCII frame, upgraded to the live 3D render when it is safe to. */
export function HeroVisual({ className }: { className?: string }) {
  const wide = useWide();
  const reduceMotion = useReducedMotion();
  const [demoted, setDemoted] = useState(demotedForSession);
  const [capable] = useState(() => supportsWebGL() && !isSlowDevice());
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);

  const want3d = wide && !reduceMotion && !demoted && capable;

  useEffect(() => {
    if (!want3d) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const afterIdle = () => {
      const go = () => {
        if (!cancelled) setReady(true);
      };
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(go);
      } else {
        timeoutId = window.setTimeout(go, 200);
      }
    };

    const waitingForLoad = document.readyState !== 'complete';
    if (waitingForLoad) window.addEventListener('load', afterIdle, { once: true });
    else afterIdle();

    return () => {
      cancelled = true;
      window.removeEventListener('load', afterIdle);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      setReady(false);
      setLive(false);
    };
  }, [want3d]);

  const onFirstFrame = useCallback(() => {
    setLive(true);
  }, []);

  const onDemote = useCallback(() => {
    demotedForSession = true;
    setDemoted(true);
    setLive(false);
  }, []);

  return (
    <div aria-hidden="true" className={className}>
      <StaticFallback hidden={live} className={styles.frame} />
      {want3d && ready ? (
        <Suspense fallback={null}>
          <AsciiHero onFirstFrame={onFirstFrame} onDemote={onDemote} />
        </Suspense>
      ) : null}
    </div>
  );
}
