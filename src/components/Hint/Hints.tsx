import * as React from 'react';
import clsx from 'clsx';
import styles from './Hints.module.css';

const DELAY = 400;
// moving straight from one hinted button to the next skips the delay
const WARM = 300;
const GAP = 6;
const EDGE = 8;

type Hint = { text: string; rect: DOMRect };

/**
 * Styled hints in place of native title tooltips. Moves every `title`
 * attribute to `data-hint` as it appears, so components keep using title.
 */
export function Hints() {
  const [hint, setHint] = React.useState<Hint | null>(null);
  const [pos, setPos] = React.useState<{
    left: number;
    top: number;
    above: boolean;
  }>();
  const el = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let current: HTMLElement | null = null;
    let timer: number | undefined;
    let hiddenAt = 0;

    function adopt(node: Element) {
      const title = node.getAttribute('title');
      if (title === null || node.closest('svg')) return;
      node.removeAttribute('title');
      (node as HTMLElement).dataset.hint = title;
      // the title was its only name, e.g. a button showing an icon
      if (!node.hasAttribute('aria-label') && !node.textContent?.trim()) {
        node.setAttribute('aria-label', title);
      }
      if (node === current) {
        setHint((h) => h && { ...h, text: title });
      }
    }

    document.querySelectorAll('[title]').forEach(adopt);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'attributes') adopt(r.target as Element);
        else
          r.addedNodes.forEach((n) => {
            if (!(n instanceof Element)) return;
            if (n.hasAttribute('title')) adopt(n);
            n.querySelectorAll('[title]').forEach(adopt);
          });
      }
    });
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['title'],
    });

    function hide() {
      window.clearTimeout(timer);
      if (current) hiddenAt = performance.now();
      current = null;
      setHint(null);
    }

    function over(ev: PointerEvent) {
      if (ev.pointerType !== 'mouse') return;
      const target = (ev.target as Element).closest?.<HTMLElement>(
        '[data-hint]',
      );
      if (target === current) return;
      const warm = !!current || performance.now() - hiddenAt < WARM;
      hide();
      if (!target) return;
      current = target;
      timer = window.setTimeout(
        () => {
          if (current !== target || !target.dataset.hint) return;
          setHint({
            text: target.dataset.hint,
            rect: target.getBoundingClientRect(),
          });
        },
        warm ? 0 : DELAY,
      );
    }

    function out(ev: PointerEvent) {
      if (!current || current.contains(ev.relatedTarget as Node)) return;
      hide();
    }

    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    document.addEventListener('pointerdown', hide, true);
    document.addEventListener('keydown', hide, true);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('blur', hide);
    return () => {
      mo.disconnect();
      window.clearTimeout(timer);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
      document.removeEventListener('pointerdown', hide, true);
      document.removeEventListener('keydown', hide, true);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('blur', hide);
    };
  }, []);

  // below the button, or above it near the bottom; kept inside the screen
  React.useLayoutEffect(() => {
    const node = el.current;
    if (!hint || !node) return setPos(undefined);
    if (!node.matches(':popover-open')) node.showPopover?.();
    const { width, height } = node.getBoundingClientRect();
    const { rect } = hint;
    const above = rect.bottom + GAP + height > window.innerHeight - EDGE;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, EDGE),
      window.innerWidth - EDGE - width,
    );
    setPos({
      left,
      top: above ? rect.top - GAP - height : rect.bottom + GAP,
      above,
    });
  }, [hint]);

  if (!hint) return null;
  return (
    <div
      key={`${hint.rect.left},${hint.rect.top}`}
      ref={el}
      popover="manual"
      role="tooltip"
      className={clsx(styles.hint, pos?.above && styles.above)}
      style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
    >
      {hint.text}
    </div>
  );
}
