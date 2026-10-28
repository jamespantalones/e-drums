import { Signal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import styles from './Footer.module.css';
import { Slider } from '../inputs/Slider';
import { SIG_BPM, SIG_DELAY, SIG_REVERB, SIG_SWING } from '../../state/track';
import { Config } from '../../config';
import { SIG_FOOTER_OPEN } from '../../state/ui';
import { PixelText } from '../Logo/Logo';
import clsx from 'clsx';
import { PointerEvent } from 'react';

const SLIDERS: {
  label: string;
  signal: Signal<number>;
  min: number;
  max: number;
}[] = [
  { label: 'Tempo', signal: SIG_BPM, min: Config.MIN_BPM, max: Config.MAX_BPM },
  { label: 'Swing', signal: SIG_SWING, min: 0, max: 100 },
  {
    label: 'Reverb',
    signal: SIG_REVERB,
    min: Config.MIN_REVERB,
    max: Config.MAX_REVERB,
  },
  { label: 'Echo', signal: SIG_DELAY, min: 0, max: 100 },
];

// the meter is only a few pixels tall, so the whole cell drags it: a
// touch over the meter jumps there, one beside it (on the label) nudges
// from the current value
const drags = new WeakMap<
  Element,
  { x: number; value: number; jump: boolean }
>();

function scrub(
  ev: PointerEvent<HTMLDivElement>,
  signal: Signal<number>,
  min: number,
  max: number,
) {
  const meter = ev.currentTarget.querySelector('input');
  const drag = drags.get(ev.currentTarget);
  if (!meter || !drag) return;
  const { left, width } = meter.getBoundingClientRect();
  const t = drag.jump
    ? (ev.clientX - left) / width
    : (drag.value - min) / (max - min) + (ev.clientX - drag.x) / width;
  signal.value = Math.round(min + Math.min(1, Math.max(0, t)) * (max - min));
}

export function Footer() {
  useSignals();

  const open = SIG_FOOTER_OPEN.value;

  return (
    <footer className={clsx(styles.footer, !open && styles.collapsed)}>
      <button
        type="button"
        className={styles.tab}
        aria-expanded={open}
        aria-label={open ? 'Hide mix controls' : 'Show mix controls'}
        title={open ? 'Hide mix controls' : 'Show mix controls'}
        onClick={() => {
          SIG_FOOTER_OPEN.value = !open;
        }}
      >
        <PixelText text={open ? 'Mix ▼' : 'Mix ▲'} className="h-2.5 w-auto" />
      </button>
      {SLIDERS.map(({ label, signal, min, max }) => (
        <div
          key={label}
          className={styles.slidecontainer}
          onPointerDown={(ev) => {
            if (ev.pointerType === 'mouse' && ev.button !== 0) return;
            ev.preventDefault();
            ev.currentTarget.setPointerCapture(ev.pointerId);
            const meter = ev.currentTarget.querySelector('input');
            if (!meter) return;
            meter.focus();
            const { left, right } = meter.getBoundingClientRect();
            drags.set(ev.currentTarget, {
              x: ev.clientX,
              value: signal.value,
              jump: ev.clientX >= left && ev.clientX <= right,
            });
            scrub(ev, signal, min, max);
          }}
          onPointerMove={(ev) => {
            if (ev.currentTarget.hasPointerCapture(ev.pointerId)) {
              scrub(ev, signal, min, max);
            }
          }}
        >
          <Slider
            onChange={(val) => {
              signal.value = val;
            }}
            variant="footer"
            label={label}
            value={signal.value}
            min={min}
            max={max}
            step={1}
          />
        </div>
      ))}
    </footer>
  );
}
