import { useLayoutEffect } from 'react';

// pages still loading what the transition should land on
const holds = new Set<Promise<void>>();

/**
 * Holds an incoming page transition until `ready`, so it animates onto the
 * loaded page rather than a spinner. Call it before any early return.
 */
export function usePageReady(ready: boolean) {
  useLayoutEffect(() => {
    if (ready) return;
    let release!: () => void;
    const hold = new Promise<void>((r) => (release = r));
    holds.add(hold);
    return () => {
      holds.delete(hold);
      release();
    };
  }, [ready]);
}

/** resolves once every held page is ready, or after `timeout` regardless */
export function pagesReady(timeout: number) {
  return Promise.race([
    Promise.all(Array.from(holds)),
    new Promise((r) => setTimeout(r, timeout)),
  ]);
}
