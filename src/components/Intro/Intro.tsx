import * as React from 'react';
import clsx from 'clsx';
import {
  canAutoplay,
  preloadVoices,
  speak,
  stopSpeaking,
  unlockAudio,
} from './sound';
import {
  SQUISH,
  fitScale,
  prefersReducedMotion,
  stretchClass,
  useWarp,
} from '../Logo/StretchText';
import styles from './Intro.module.css';

const WORD = 'EDRUMS';
const LIT = 'var(--color-foreground)';
const OFF = 'var(--color-muted)';

type Phase = 'booting' | 'waiting' | 'playing' | 'leaving';

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export function Intro({
  onDone,
  target,
}: {
  onDone: () => void;
  /** the page's wordmark; the intro word morphs onto it when leaving */
  target?: React.RefObject<HTMLElement | null>;
}) {
  const [phase, setPhase] = React.useState<Phase>('booting');
  const [color, setColor] = React.useState(LIT);
  const cancelled = React.useRef(false);
  const started = React.useRef(false);
  const box = React.useRef<HTMLDivElement>(null);
  const word = React.useRef<HTMLSpanElement>(null);
  const [fill, setFill] = React.useState<string>();
  const warp = useWarp();

  // stretch the text's natural box to fill the screen
  React.useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => word.current && setFill(fitScale(el, word.current));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  const finish = React.useCallback(async () => {
    if (cancelled.current) return;
    cancelled.current = true;
    stopSpeaking();
    setColor(LIT);

    setPhase('leaving');

    // squash the stretched intro word onto the page's wordmark, so when the
    // intro unmounts the logo is already where it lands
    const from = box.current?.getBoundingClientRect();
    const w = word.current;
    const to = target?.current?.getBoundingClientRect();
    if (from && w && to && to.width > 0 && to.height > 0) {
      w.animate(
        {
          transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / w.offsetWidth}, ${to.height / w.offsetHeight})`,
        },
        {
          ...SQUISH,
          duration: prefersReducedMotion() ? 0 : SQUISH.duration,
          fill: 'forwards',
        },
      );
    }
    await sleep(SQUISH.duration);
    onDone();
  }, [onDone, target]);

  const play = React.useCallback(async () => {
    if (started.current || cancelled.current) return;
    started.current = true;
    setPhase('playing');
    await unlockAudio();

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // say it straight away and blink while it talks
    const voice = speak('E drums');

    const BLINKS = 3;
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
    await voice;
    await sleep(100);
    finish();
  }, [finish]);

  React.useEffect(() => {
    preloadVoices();
    const t = window.setTimeout(() => {
      if (canAutoplay()) play();
      else setPhase('waiting');
    }, 450);
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
      onPointerDown={() => finish()}
    >
      <h1 className="sr-only">e-drums</h1>
      <div ref={box} className={styles.word}>
        {warp.defs}
        <span
          ref={word}
          className={clsx(stretchClass, styles.text)}
          style={{ color, transform: fill, filter: warp.filter }}
          aria-hidden
        >
          {Array.from(WORD).map((char, i) => (
            <span
              key={i}
              className={styles.pixel}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {char}
            </span>
          ))}
        </span>
      </div>

      <div className={styles.footer}>
        {phase === 'waiting' ? (
          <button
            className={styles.prompt}
            onPointerDown={(ev) => ev.stopPropagation()}
            onClick={play}
            autoFocus
          >
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
