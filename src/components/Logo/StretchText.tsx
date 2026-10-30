import * as React from 'react';
import clsx from 'clsx';
import styles from './StretchText.module.css';

export const stretchClass = styles.text;

export const SQUISH = {
  duration: 600,
  easing: 'cubic-bezier(0.7, 0, 0.2, 1)',
} as const;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * A rubbery bend through the letters. It works in the text's natural,
 * unscaled coordinates, so it stretches with the logo and every copy (intro,
 * pages, editor) warps identically and the squish transitions line up.
 */
export function useWarp() {
  const id = `warp${React.useId().replace(/[^\w-]/g, '')}`;
  const defs = (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter
        id={id}
        x="-10%"
        y="-20%"
        width="120%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.0016 0.0045"
          numOctaves={1}
          seed={7}
        />
        <feDisplacementMap
          in="SourceGraphic"
          scale={110}
          xChannelSelector="R"
          yChannelSelector="G"
        />
        {/* displacement samples without smoothing; blur and re-sharpen the
            edge so it isn't speckled */}
        <feGaussianBlur stdDeviation={2.5} />
        <feComponentTransfer>
          <feFuncA type="linear" slope={4} intercept={-1.5} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
  return { defs, filter: `url(#${id})` };
}

/** scale that stretches `text` (natural size) to fill `box` exactly */
export function fitScale(box: HTMLElement, text: HTMLElement) {
  return `scale(${box.clientWidth / text.offsetWidth}, ${box.clientHeight / text.offsetHeight})`;
}

/** Font text stretched to fill its box, ignoring aspect ratio */
export function StretchText({
  text,
  className,
  transitionName,
}: {
  text: string;
  className?: string;
  /** view-transition-name, to morph into the same text on another page */
  transitionName?: string;
}) {
  const box = React.useRef<HTMLSpanElement>(null);
  const inner = React.useRef<HTMLSpanElement>(null);
  const [transform, setTransform] = React.useState<string>();
  const warp = useWarp();

  React.useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () =>
      inner.current && setTransform(fitScale(el, inner.current));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    // the web font can swap in after first paint and change the natural size
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  return (
    <span
      ref={box}
      className={clsx('relative block', className)}
      style={{ viewTransitionName: transitionName }}
      aria-hidden
    >
      {warp.defs}
      <span
        ref={inner}
        className={styles.text}
        style={{ transform, filter: warp.filter }}
      >
        {text}
      </span>
    </span>
  );
}
