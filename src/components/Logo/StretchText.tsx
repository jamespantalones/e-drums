import * as React from 'react';
import clsx from 'clsx';

export const SQUISH = {
  duration: 600,
  easing: 'cubic-bezier(0.7, 0, 0.2, 1)',
} as const;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// IBM Plex Mono at its natural size: every glyph advances 0.6em, and the
// capitals stand 0.698em tall, so the box is trimmed to the letters
const SIZE = 500;
const ADVANCE = 0.6 * SIZE;
const CAP = 0.698 * SIZE;

/**
 * Text stretched to fill its parent, ignoring aspect ratio, with a rubbery
 * bend through the letters. It's SVG text so the warp filter renders at the
 * size on screen (iOS drops filters on large HTML text) while its numbers
 * stay in the text's natural coordinates, so every copy warps identically
 * and the squish transitions line up.
 */
export function WarpedWord({
  text,
  className,
  style,
  letterClassName,
  letterStyle,
  ref,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  letterClassName?: string;
  letterStyle?: (index: number) => React.CSSProperties;
  ref?: React.Ref<SVGSVGElement>;
}) {
  const id = `warp${React.useId().replace(/[^\w-]/g, '')}`;
  const width = text.length * ADVANCE;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${CAP}`}
      preserveAspectRatio="none"
      className={clsx('absolute inset-0 w-full h-full', className)}
      style={{ overflow: 'visible', pointerEvents: 'none', ...style }}
      aria-hidden
    >
      <filter
        id={id}
        filterUnits="userSpaceOnUse"
        x={-0.1 * width}
        y={-0.2 * CAP}
        width={1.2 * width}
        height={1.4 * CAP}
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
      <text
        x={0}
        y={CAP}
        // holds the width even before the web font swaps in
        textLength={width}
        lengthAdjust="spacingAndGlyphs"
        filter={`url(#${id})`}
        fill="currentColor"
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: SIZE,
          letterSpacing: 0,
        }}
      >
        {letterClassName || letterStyle
          ? Array.from(text).map((char, i) => (
              <tspan
                key={i}
                className={letterClassName}
                style={letterStyle?.(i)}
              >
                {char}
              </tspan>
            ))
          : text}
      </text>
    </svg>
  );
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
  return (
    <span
      className={clsx('relative block', className)}
      style={{ viewTransitionName: transitionName }}
      aria-hidden
    >
      <WarpedWord text={text} />
    </span>
  );
}
