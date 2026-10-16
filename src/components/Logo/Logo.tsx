import clsx from 'clsx';
import { pixelsFor } from './bitmap';
import { PIXEL, markPixels } from './geometry';

/**
 * Text drawn on the LED grid used by the intro screen.
 * Size it with height (e.g. `h-[1em]`); width follows the text.
 */
export function PixelText({
  text,
  className,
  stretch = false,
  label,
}: {
  text: string;
  className?: string;
  /** fill the box exactly, ignoring aspect ratio */
  stretch?: boolean;
  /** accessible name; omit when the text is already labelled elsewhere */
  label?: string;
}) {
  const { pixels, width, height } = pixelsFor(text);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={stretch ? 'none' : 'xMinYMid meet'}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {pixels.map(({ x, y }) => (
        <rect
          key={`${x}-${y}`}
          x={x + PIXEL.inset}
          y={y + PIXEL.inset}
          width={PIXEL.size}
          height={PIXEL.size}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

const MARK = markPixels();

/** Pixel "E" on the LED grid */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {MARK.map((p, i) => (
        <rect
          key={i}
          x={p.x}
          y={p.y}
          width={p.size}
          height={p.size}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function Wordmark({
  className,
  stretch,
}: {
  className?: string;
  stretch?: boolean;
}) {
  return <PixelText text="EDRUMS" className={className} stretch={stretch} />;
}

/** Wordmark sized by font-size */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx('inline-block', className)}>
      <Wordmark className="block h-[1em] w-auto" />
      <span className="sr-only">e-drums</span>
    </span>
  );
}
