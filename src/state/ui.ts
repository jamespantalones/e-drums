// Editor layout preferences, remembered per browser

import { effect, signal } from '@preact/signals-react';

const KEY = 'edrums:ui';

// shared by everything that moves when the track controls fold
export const CONTROLS_EASE = {
  type: 'tween',
  ease: [0.32, 0.72, 0, 1],
  duration: 0.32,
} as const;

export const SIG_FOOTER_OPEN = signal(true);
export const SIG_CONTROLS_OPEN = signal(true);
// steps tune their note instead of toggling it; not remembered
export const SIG_EDIT_PITCH = signal(false);
// upright phones always show the full track controls: collapsing there
// saves no room, so the toggle is hidden and the saved choice ignored
export const SIG_PORTRAIT_PHONE = signal(false);

const PORTRAIT_PHONE = '(max-width: 767px) and (orientation: portrait)';

let loaded = false;

/** Restore saved layout; call once on the client */
export function loadUiPrefs() {
  if (loaded) return;
  loaded = true;

  const portrait = window.matchMedia(PORTRAIT_PHONE);
  SIG_PORTRAIT_PHONE.value = portrait.matches;
  portrait.addEventListener('change', (ev) => {
    SIG_PORTRAIT_PHONE.value = ev.matches;
  });

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (typeof saved.footer === 'boolean') SIG_FOOTER_OPEN.value = saved.footer;
    if (typeof saved.controls === 'boolean') {
      SIG_CONTROLS_OPEN.value = saved.controls;
    }
  } catch {
    // storage blocked; keep the defaults
  }

  effect(() => {
    const prefs = {
      footer: SIG_FOOTER_OPEN.value,
      controls: SIG_CONTROLS_OPEN.value,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      // storage blocked; the toggles still work for this visit
    }
  });
}
