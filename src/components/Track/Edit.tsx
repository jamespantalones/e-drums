import { AnimatePresence, DragControls, motion } from 'framer-motion';

import styles from './Edit.module.css';
import { ChangeEvent, useCallback, useState } from 'react';
import { useAudioContext } from '../../contexts/AudioContext';
import { Track } from '../../lib/Track';
import { Config, SOUNDS } from '../../config';
import clsx from 'clsx';
import { ReorderIcon } from './ReorderIcon';
import { generateRandomColor } from '../../lib/utils';
import { padNumber } from '../../utils';
import { Slider } from '../inputs/Slider';
import { PixelText } from '../Logo/Logo';
import { useSignals } from '@preact/signals-react/runtime';
import { markChanged } from '../../state/track';
import { CONTROLS_EASE } from '../../state/ui';

// the outgoing panel is popped out of layout and fades while the steps
// slide over; only opacity and transforms animate
const SWAP = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: CONTROLS_EASE,
};

export function Edit({
  open,
  dragControls,
  rhythm,
  removeNote,
}: {
  /** full controls, or the collapsed strip */
  open: boolean;
  dragControls: DragControls;
  rhythm: Track;
  removeNote: (index: number) => void;
}) {
  useSignals();

  const {
    methods: { setTrackVal, deleteTrack },
  } = useAudioContext();

  const [muted, setMuted] = useState(rhythm.muted);

  const addNote = useCallback(() => {
    setTrackVal(rhythm, { method: 'addNote' });
  }, [rhythm, setTrackVal]);

  // the last step going takes the track with it
  const removeLastNote = useCallback(() => {
    if (rhythm.pattern.length - 1 === 0) {
      deleteTrack(rhythm.id);
      return;
    }
    removeNote(rhythm.pattern.length - 1);
  }, [rhythm, deleteTrack, removeNote]);

  const soundName = rhythm.instrument?.sound.name ?? '';

  const toggleMute = useCallback(() => {
    rhythm.toggleMute();
    markChanged();
    setMuted((m) => !m);
  }, [rhythm]);

  const handleInstrumentChange = useCallback(
    (val: string) => {
      const target = SOUNDS.find((s) => s.name === val);
      if (target) {
        setTrackVal(rhythm, {
          method: 'changeInstrument',
          value: target,
        });
      }
    },
    [setTrackVal, rhythm],
  );

  const handlePitchChange = useCallback(
    (val: number) => {
      if (val) {
        setTrackVal(rhythm, {
          method: 'changePitch',
          value: val,
        });
      }
    },
    [setTrackVal, rhythm],
  );

  async function handleVolumeChange(val: number) {
    await setTrackVal(rhythm, {
      method: 'changeVolume',
      value: val,
    });
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {open ? (
        <motion.div key="full" className="mr-2" {...SWAP}>
          {/* left panel */}
          <div className="flex flex-row portrait:flex-col">
            <section className="w-24">
              <select
                className={styles.sound}
                title="Sound"
                aria-label="Sound"
                value={rhythm.instrument?.sound.name}
                onChange={(ev) => handleInstrumentChange(ev.target.value)}
              >
                {SOUNDS.map((sound) => (
                  <option key={sound.name} value={sound.name}>
                    {sound.name}
                  </option>
                ))}
              </select>

              <div className="flex">
                <ReorderIcon dragControls={dragControls} />
                <section className={styles.total}>
                  {padNumber(rhythm.totalNotes)}
                </section>
              </div>

              {/* mute/solo */}
              <div className={styles['poly-button-group']}>
                <button
                  onClick={toggleMute}
                  title={muted ? 'Unmute' : 'Mute'}
                  aria-pressed={muted}
                  className={clsx(styles.toggle, styles.mutebutton, {
                    // [styles['no-portrait']]: true,
                    [styles.muted]: muted,
                    [styles.active]: !muted,
                  })}
                >
                  <PixelText
                    text={muted ? '🔇' : '🔊'}
                    className="h-2.5 w-auto"
                  />
                </button>
                <button
                  title="Delete Track"
                  onClick={() => deleteTrack(rhythm.id)}
                  className={clsx(styles.toggle, {
                    [styles['no-portrait']]: true,
                    [styles.destructive]: true,
                  })}
                >
                  <PixelText text="X" className="h-2 w-auto" />
                </button>
              </div>
            </section>

            <section className={styles['length-panel']}>
              <button
                onClick={addNote}
                title="Add Note"
                className={styles['add-button']}
                disabled={rhythm.totalNotes >= Config.MAX_SLICES}
              >
                <PixelText text="+" className="h-2.5 w-auto" />
              </button>
              <button
                title="Remove Note"
                onClick={removeLastNote}
                className={styles['subtract-button']}
              >
                <PixelText text="-" className="h-2.5 w-auto" />
              </button>
            </section>
          </div>
          <section className="block portrait:hidden">
            <div className={styles['knob-group']}>
              <Slider
                label="Pitch"
                min={30}
                max={100}
                defaultValue={rhythm.pitch}
                onChange={handlePitchChange}
              />
              <Slider
                label="Vol"
                defaultValue={rhythm.prevVolume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </section>
        </motion.div>
      ) : (
        // collapsed: just the sound, mute and length in one thin column
        <motion.div key="mini" className={styles.mini} {...SWAP}>
          <span className={styles['mini-name']} title={soundName}>
            {soundName}
          </span>
          <button
            onClick={toggleMute}
            title={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
            className={clsx(styles.toggle, styles['mini-button'], {
              [styles.muted]: muted,
              [styles.active]: !muted,
            })}
          >
            <PixelText text={muted ? '🔇' : '🔊'} className="h-2.5 w-auto" />
          </button>
          <button
            onClick={addNote}
            title="Add Note"
            className={clsx(styles.toggle, styles['mini-button'])}
            disabled={rhythm.totalNotes >= Config.MAX_SLICES}
          >
            <PixelText text="+" className="h-2.5 w-auto" />
          </button>
          <button
            onClick={removeLastNote}
            title="Remove Note"
            className={clsx(styles.toggle, styles['mini-button'])}
          >
            <PixelText text="-" className="h-2.5 w-auto" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
