import { DragControls } from 'framer-motion';

import styles from './Edit.module.css';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react';
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

export function Edit({
  dragControls,
  editPitch,
  rhythm,
  removeNote,
  setEditPitch,
}: {
  dragControls: DragControls;
  editPitch: boolean;
  rhythm: Track;
  removeNote: (index: number) => void;
  setEditPitch: Dispatch<SetStateAction<boolean>>;
}) {
  useSignals();

  const {
    methods: { setTrackVal, deleteTrack },
  } = useAudioContext();

  const [muted, setMuted] = useState(rhythm.muted);

  const addNote = useCallback(() => {
    setTrackVal(rhythm, { method: 'addNote' });
  }, [rhythm, setTrackVal]);

  const toggleEditPitch = useCallback(() => {
    setEditPitch((p) => !p);
  }, [setEditPitch]);

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
    [setTrackVal, rhythm]
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
    [setTrackVal, rhythm]
  );

  async function handleVolumeChange(val: number) {
    await setTrackVal(rhythm, {
      method: 'changeVolume',
      value: val,
    });
  }

  return (
    <>
      <div className="mr-2">
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
                <PixelText text={muted ? '🔇' : '🔊'} className="h-2.5 w-auto" />
              </button>
              <button
                onClick={toggleEditPitch}
                title="Edit note pitches"
                aria-pressed={editPitch}
                className={clsx(styles.toggle, {
                  [styles['no-portrait']]: true,
                  [styles.pitch]: editPitch,
                })}
              >
                <PixelText text="♪" className="h-2.5 w-auto" />
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
              onClick={() => {
                if (rhythm.pattern.length - 1 === 0) {
                  deleteTrack(rhythm.id);
                  return;
                }
                removeNote(rhythm.pattern.length - 1);
              }}
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
      </div>
    </>
  );
}
