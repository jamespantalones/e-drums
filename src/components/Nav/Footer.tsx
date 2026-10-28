import { Signal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import styles from './Footer.module.css';
import { Slider } from '../inputs/Slider';
import { SIG_BPM, SIG_DELAY, SIG_REVERB, SIG_SWING } from '../../state/track';
import { Config } from '../../config';
import { SIG_FOOTER_OPEN } from '../../state/ui';
import { PixelText } from '../Logo/Logo';
import clsx from 'clsx';

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
        <div key={label} className={styles.slidecontainer}>
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
