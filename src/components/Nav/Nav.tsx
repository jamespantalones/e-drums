import * as React from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import {
  Save as SaveIcon,
  Plus as NewIcon,
  Play as PlayIcon,
  Square as StopIcon,
} from 'lucide-react';
import { IconButton } from '../IconButton/IconButton';
import styles from './Nav.module.css';
import { useAudioContext } from '../../contexts/AudioContext';
import { Config } from '../../config';
import Link from 'next/link';
import clsx from 'clsx';
import { SIG_INITIALIZED, SIG_PLAY_STATE, SIG_TRACKS } from '../../state/track';
import { SequencerPlayState } from '../../types';
import { metaConfig } from '../../config/meta';
export function Nav({
  save,
  children,
}: {
  save: () => Promise<void>;
  children: React.ReactNode;
}) {
  useSignals();

  const { methods } = useAudioContext();

  function play() {
    if (SIG_PLAY_STATE.value !== SequencerPlayState.STARTED) {
      methods.stop();
    }
    methods.play();
  }

  return (
    <nav className={styles.nav}>
      <section className={styles.section}>
        <div className="flex items-center justify-between ml-4 mt-0.5">
          <Link
            href="/"
            className={clsx(styles.link, 'block text-sm mr-6')}
            passHref
            onClick={(ev) => {
              if (
                window.confirm(
                  'Are you sure you want to go back to index page?'
                )
              ) {
                methods.stop();
              } else {
                ev.preventDefault();
              }
            }}
          >
            <h1>
              <span className="transition-translate inline-block text-lg">
                {metaConfig.emoji} e-drums
              </span>
            </h1>
          </Link>

          {children}

          <IconButton small onClick={play}>
            <PlayIcon strokeWidth={1} />
          </IconButton>
          <IconButton
            small
            onClick={methods.stop}
            disabled={!SIG_INITIALIZED.value}
          >
            <StopIcon strokeWidth={1} />
          </IconButton>
        </div>

        <div className="flex">
          <IconButton
            title="Add Track"
            onClick={methods.createTrack}
            small
            disabled={
              SIG_TRACKS.value.length === Config.MAX_TRACKS ||
              !SIG_INITIALIZED.value
            }
          >
            <NewIcon strokeWidth={1} />
          </IconButton>

          <IconButton onClick={save} small title="Save">
            <SaveIcon strokeWidth={1} />
          </IconButton>
        </div>
      </section>
    </nav>
  );
}
