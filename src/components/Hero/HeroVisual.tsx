import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { isSlowDevice, supportsWebGL } from '../../hero3d/capabilities.ts';
import { StaticFallback } from '../../hero3d/StaticFallback.tsx';
import { NARROW_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import styles from './Hero.module.css';

const AsciiHero = lazy(() => import('../../hero3d/AsciiHero.tsx'));

/**
 * Characters per CSS pixel. Keep in sync with --ascii-res in Hero.module.css: the static
 * frame and the live render must share one cell size or the crossfade jumps.
 * Phones use twice the desktop density on a half-size stage, so the grid is the same.
 */
const WIDE_RESOLUTION = 0.15;
const NARROW_RESOLUTION = 0.3;

// A demotion (frame budget blown) lasts the rest of the session.
let demotedForSession = false;

/** Decorative hero art: a static ASCII frame, upgraded to the live 3D render when it is safe to. */
export function HeroVisual({ className }: { className?: string }) {
  const narrow = useMediaQuery(NARROW_QUERY);
  const reduceMotion = useReducedMotion();
  const [demoted, setDemoted] = useState(demotedForSession);
  const [capable] = useState(() => supportsWebGL() && !isSlowDevice());
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);

  const want3d = !reduceMotion && !demoted && capable;

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
      <div className={styles.stage}>
        <StaticFallback hidden={live} className={styles.frame} />
        {want3d && ready ? (
          <Suspense fallback={null}>
            <AsciiHero
              onFirstFrame={onFirstFrame}
              onDemote={onDemote}
              resolution={narrow ? NARROW_RESOLUTION : WIDE_RESOLUTION}
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
