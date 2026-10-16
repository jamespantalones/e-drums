import * as React from 'react';
import clsx from 'clsx';
import { pixelsFor } from '../Logo/bitmap';
import { PIXEL } from '../Logo/geometry';
import {
  canAutoplay,
  preloadVoices,
  speak,
  stopSpeaking,
  unlockAudio,
} from './sound';
import styles from './Intro.module.css';

const WORD = pixelsFor('EDRUMS');
const LIT = 'var(--color-foreground)';
const OFF = 'rgb(48, 48, 48)';

type Phase = 'booting' | 'waiting' | 'playing' | 'leaving';

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = React.useState<Phase>('booting');
  const [color, setColor] = React.useState(LIT);
  const cancelled = React.useRef(false);
  const started = React.useRef(false);

  const finish = React.useCallback(async () => {
    if (cancelled.current) return;
    cancelled.current = true;
    stopSpeaking();
    setColor(LIT);
    setPhase('leaving');
    await sleep(500);
    onDone();
  }, [onDone]);

  const play = React.useCallback(async () => {
    if (started.current) return;
    started.current = true;
    setPhase('playing');
    await unlockAudio();

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const BLINKS = 6;
    for (let i = 0; i < BLINKS; i++) {
      if (cancelled.current) return;
      setColor(LIT);
      await sleep(200);
      // kept under 3 flashes per second
      if (!reduceMotion) setColor(OFF);
      await sleep(150);
    }

    if (cancelled.current) return;
    setColor(LIT);
    await speak('E drums');
    await sleep(250);
    finish();
  }, [finish]);

  React.useEffect(() => {
    preloadVoices();
    const t = window.setTimeout(() => {
      if (canAutoplay()) play();
      else setPhase('waiting');
    }, 900);
    return () => window.clearTimeout(t);
  }, [play]);

  React.useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') finish();
      else if (!ev.metaKey && !ev.ctrlKey) play();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [play, finish]);

  return (
    <div
      className={clsx(styles.intro, phase === 'leaving' && styles.leaving)}
      onPointerDown={() => play()}
    >
      <h1 className="sr-only">e-drums</h1>
      <svg
        viewBox={`0 0 ${WORD.width} ${WORD.height}`}
        preserveAspectRatio="none"
        className={styles.word}
        style={{ color }}
        aria-hidden
      >
        {WORD.pixels.map(({ x, y }) => (
          <rect
            key={`${x}-${y}`}
            x={x + PIXEL.inset}
            y={y + PIXEL.inset}
            width={PIXEL.size}
            height={PIXEL.size}
            fill="currentColor"
            className={styles.pixel}
            style={{ animationDelay: `${x * 16 + ((x * 7 + y * 13) % 5) * 30}ms` }}
          />
        ))}
      </svg>

      <div className={styles.footer}>
        {phase === 'waiting' ? (
          <button className={styles.prompt} onClick={play} autoFocus>
            Press any key to start<span className={styles.cursor}>_</span>
          </button>
        ) : (
          <span />
        )}
        <button
          className={styles.skip}
          onPointerDown={(ev) => ev.stopPropagation()}
          onClick={finish}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
