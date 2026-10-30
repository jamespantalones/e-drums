import { useEffect, useRef, useSyncExternalStore } from 'react';

type Handler = (ev: KeyboardEvent) => void;

type Binding =
  | Handler
  | {
      handler: Handler;
      /** also fire while typing in a field (e.g. save) */
      inFields?: boolean;
      /** fire again while the key is held */
      repeat?: boolean;
    };

/**
 * Keys like 'Space', 'Escape', 'Mod+s' or 'Ctrl+n'. Mod is ⌘ on Apple
 * devices and Ctrl elsewhere; modifiers must match exactly.
 */
export type HotKeys = Record<string, Binding>;

const FIELDS = 'input, textarea, select, [contenteditable], dialog';

const registered = new Set<{ current: HotKeys }>();

const isApple = () => /Mac|iP(hone|ad|od)/.test(navigator.platform);

function matches(combo: string, ev: KeyboardEvent) {
  const parts = combo.split('+');
  const key = parts.pop()!;
  const mods = new Set(parts);
  if (mods.has('Mod')) {
    mods.delete('Mod');
    mods.add(isApple() ? 'Meta' : 'Ctrl');
  }
  return (
    (ev.code === key || ev.key.toLowerCase() === key.toLowerCase()) &&
    ev.metaKey === mods.has('Meta') &&
    ev.ctrlKey === mods.has('Ctrl') &&
    ev.altKey === mods.has('Alt') &&
    ev.shiftKey === mods.has('Shift')
  );
}

function find(ev: KeyboardEvent) {
  const inField = !!(ev.target as Element).closest?.(FIELDS);
  for (const { current } of Array.from(registered)) {
    for (const combo in current) {
      if (!matches(combo, ev)) continue;
      const binding = current[combo];
      const b = typeof binding === 'function' ? { handler: binding } : binding;
      if (inField && !b.inFields) continue;
      return b;
    }
  }
}

function onKeyDown(ev: KeyboardEvent) {
  const b = find(ev);
  if (!b) return;
  ev.preventDefault();
  if (!ev.repeat || b.repeat) b.handler(ev);
}

// a focused button would otherwise still click when space comes up
function onKeyUp(ev: KeyboardEvent) {
  if (find(ev)) ev.preventDefault();
}

/** Keyboard shortcuts for as long as the component is mounted */
export function useHotKeys(keys: HotKeys) {
  const ref = useRef(keys);
  ref.current = keys;

  useEffect(() => {
    if (registered.size === 0) {
      // capture, so shortcuts beat whatever has focus
      window.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('keyup', onKeyUp, true);
    }
    registered.add(ref);
    return () => {
      registered.delete(ref);
      if (registered.size === 0) {
        window.removeEventListener('keydown', onKeyDown, true);
        window.removeEventListener('keyup', onKeyUp, true);
      }
    };
  }, []);
}

const SYMBOLS: Record<string, string> = {
  Mod: '⌘',
  Meta: '⌘',
  Ctrl: '⌃',
  Alt: '⌥',
  Shift: '⇧',
};
const NAMES: Record<string, string> = { Escape: 'Esc', Backspace: '⌫' };

/** Formats a combo for display: ⌘S on Apple devices, Ctrl+S elsewhere */
export function useKeyLabel() {
  // server and hydration render the Apple form, then it settles
  const apple = useSyncExternalStore(noop, isApple, () => true);
  return (combo: string) => {
    const parts = combo.split('+');
    let key = parts.pop()!;
    key = NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key);
    // shifted symbols like ? already imply shift
    const mods = parts.filter((m) => !(m === 'Shift' && !/\w/.test(key)));
    if (apple) return mods.map((m) => SYMBOLS[m]).join('') + key;
    return [...mods.map((m) => (m === 'Mod' ? 'Ctrl' : m)), key].join('+');
  };
}

function noop() {
  return () => {};
}
