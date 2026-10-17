import { useEffect, useRef } from 'react';
import { effect } from '@preact/signals-react';
import {
  SIG_BPM,
  SIG_NAME,
  SIG_DELAY,
  SIG_REVERB,
  SIG_REVISION,
  SIG_SWING,
  SIG_TRACKS,
  SIG_VOLUME,
} from '../state/track';

/**
 * Saves shortly after any edit, and immediately when the page is hidden,
 * closed or the editor unmounts, so work is never lost.
 */
export function useAutosave(
  save: () => Promise<void>,
  enabled: boolean,
  delay = 600,
) {
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;
    let first = true;

    const flush = () => {
      if (timer === undefined) return;
      window.clearTimeout(timer);
      timer = undefined;
      saveRef.current();
    };

    const dispose = effect(() => {
      // read everything that ends up in the saved project
      void SIG_TRACKS.value;
      void SIG_BPM.value;
      void SIG_VOLUME.value;
      void SIG_SWING.value;
      void SIG_REVERB.value;
      void SIG_DELAY.value;
      void SIG_NAME.value;
      void SIG_REVISION.value;

      // the first run is just the loaded state
      if (first) {
        first = false;
        return;
      }

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = undefined;
        saveRef.current();
      }, delay);
    });

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);

    return () => {
      dispose();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      // save anything pending before the editor tears down its state
      flush();
    };
  }, [enabled, delay]);
}
