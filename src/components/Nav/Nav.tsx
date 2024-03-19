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
import {
  SIG_BPM,
  SIG_INITIALIZED,
  SIG_PLAY_STATE,
  SIG_REVERB,
  SIG_SWING,
  SIG_TRACKS,
  SIG_VOLUME,
} from '../../state/track';
import { SequencerPlayState } from '../../types';
import { Slider } from '../inputs/Slider';
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

  function handleBPMChange(bpm: number) {
    SIG_BPM.value = bpm;
  }

  function handleSwingChange(swing: number) {
    SIG_SWING.value = swing;
  }

  function handleVolumeChange(vol: number) {
    SIG_VOLUME.value = vol;
  }

  function handleReverbChange(rev: number) {
    SIG_REVERB.value = rev;
  }

  function play() {
    if (SIG_PLAY_STATE.value !== SequencerPlayState.STARTED) {
      methods.stop();
    }
    methods.play();
  }

  return (
    <nav className={styles.nav}>
      <section className={styles.section}>
        <div className="flex items-center justify-between ml-1.5 ">
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
                {metaConfig.emoji}
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

          <div className="w-[50vw] ml-16 flex flex-wrap portrait:hidden">
            <div className={styles.slidecontainer}>
              <Slider
                onChange={handleBPMChange}
                label="Tempo"
                value={SIG_BPM.value}
                min={Config.MIN_BPM}
                max={Config.MAX_BPM}
              />
            </div>

            <div className={styles.slidecontainer}>
              <Slider
                onChange={handleVolumeChange}
                label="Vol."
                value={SIG_VOLUME.value}
                min={Config.MIN_VOLUME}
                max={Config.MAX_VOLUME}
                step={0.1}
              />
            </div>
            {/* <div className={styles.slidecontainer}>
              <Slider
                onChange={handleSwingChange}
                label="Swing"
                value={SIG_SWING.value}
                min={0}
                max={100}
                step={1}
              />
            </div> */}
          </div>
        </div>

        <div className="flex">
          <IconButton
            onClick={methods.createTrack}
            small
            disabled={
              SIG_TRACKS.value.length === Config.MAX_TRACKS ||
              !SIG_INITIALIZED.value
            }
          >
            <NewIcon strokeWidth={1} />
          </IconButton>

          <IconButton onClick={save} small>
            <SaveIcon strokeWidth={1} />
          </IconButton>
        </div>
      </section>
    </nav>
  );
}
