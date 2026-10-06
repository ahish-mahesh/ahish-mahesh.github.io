import { useCallback, useSyncExternalStore } from 'react';

/** Phone layout. Keep in sync with the `max-width: 719.98px` / `min-width: 720px` CSS breakpoints. */
export const NARROW_QUERY = '(max-width: 719.98px)';

/** Touch-first device: no hover, coarse pointer. Same query as the touch-only CSS rules. */
export const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

function read(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

/** True while `query` matches. Updates live; false where matchMedia is missing. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => undefined;
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => {
        mql.removeEventListener('change', onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => read(query),
    () => false,
  );
}
