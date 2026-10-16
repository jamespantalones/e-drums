import * as React from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import styles from './Nav.module.css';
import { useAudioContext } from '../../contexts/AudioContext';
import { Config } from '../../config';
import Link from 'next/link';
import clsx from 'clsx';
import {
  SIG_INITIALIZED,
  SIG_PLAY_STATE,
  SIG_TRACKS,
} from '../../state/track';
import { SequencerPlayState } from '../../types';
import { Logo, PixelText } from '../Logo/Logo';

function NavButton({
  label,
  text,
  onClick,
  disabled,
  active,
}: {
  label: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={clsx(styles.cell, styles.button, active && styles.active)}
    >
      <PixelText text={text} className="h-3.5 md:h-4 w-auto" />
    </button>
  );
}

export function Nav({
  save,
  children,
}: {
  save: () => Promise<void>;
  children: React.ReactNode;
}) {
  useSignals();

  const { methods } = useAudioContext();

  const playing = SIG_PLAY_STATE.value === SequencerPlayState.STARTED;

  function play() {
    if (!playing) {
      methods.stop();
    }
    methods.play();
  }

  return (
    <nav className={styles.nav}>
      <Link
        href="/"
        className={clsx(styles.cell, styles.button, styles.logo)}
        onClick={() => methods.stop()}
      >
        <h1 className="!transform-none not-italic text-[22px] leading-none flex">
          <Logo />
        </h1>
      </Link>

      <div className={clsx(styles.cell, styles.name)}>{children}</div>

      <NavButton label="Play" text="Play" onClick={play} active={playing} />
      <NavButton
        label="Stop"
        text="Stop"
        onClick={methods.stop}
        disabled={!SIG_INITIALIZED.value}
      />
      <NavButton
        label="Add track"
        text="+ Trk"
        onClick={methods.createTrack}
        disabled={
          SIG_TRACKS.value.length === Config.MAX_TRACKS ||
          !SIG_INITIALIZED.value
        }
      />
      <NavButton label="Save" text="Save" onClick={save} />
    </nav>
  );
}
