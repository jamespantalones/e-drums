import { useCallback, useEffect, useRef } from 'react';

export type Handlers = {
  [key: string]: () => void;
};

export function useHotKeys(handlers: Handlers) {
  let metaDown = useRef(false);
  let ctrlDown = useRef(false);

  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.metaKey) {
        metaDown.current = true;
      } else {
        metaDown.current = false;
      }

      if (ev.ctrlKey) {
        ctrlDown.current = true;
      } else {
        ctrlDown.current = false;
      }

      for (let k in handlers) {
        const [h_or_key, key_or_empty] = k.split('+');

        if (key_or_empty) {
          if (h_or_key === 'Meta') {
            if (metaDown.current && key_or_empty === ev.key) {
              ev.preventDefault();
              handlers[k]();
            }
          }
          if (h_or_key === 'Ctrl') {
            if (ctrlDown.current && key_or_empty === ev.key) {
              ev.preventDefault();
              handlers[k]();
            }
          }
        } else if (h_or_key) {
          if (ev.key === h_or_key) {
            ev.preventDefault();
            handlers[k]();
          }
        }
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, handleKeyDown]);
}
