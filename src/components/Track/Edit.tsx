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
import {
  Minus,
  Music2,
  Music3,
  Plus,
  Trash,
  Volume,
  Volume2,
} from 'lucide-react';
import { Slider } from '../inputs/Slider';
import { useSignals } from '@preact/signals-react/runtime';

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
    setMuted((m) => !m);
  }, [rhythm]);

  const handleInstrumentChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      const target = SOUNDS.find((s) => s.name === ev.target.value);
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

  console.log(rhythm.pitch);

  return (
    <>
      <div className="mr-2">
        {/* left panel */}
        <div className="flex flex-row portrait:flex-col">
          <section className="w-24">
            <select
              value={rhythm.instrument?.sound.name}
              className={styles['instrument-select']}
              onChange={handleInstrumentChange}
            >
              {SOUNDS.map((sound, index) => (
                <option key={sound.name} value={sound.name}>
                  {index} {sound.name}
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
                title="Toggle Mute"
                className={clsx(styles.toggle, {
                  [styles['no-portrait']]: true,
                  [styles.muted]: muted,
                  [styles.active]: !muted,
                })}
              >
                {muted && <Volume size={12} />}
                {!muted && <Volume2 size={12} />}
              </button>
              <button
                onClick={toggleEditPitch}
                title="Pitch Notes"
                className={clsx(styles.toggle, {
                  [styles['no-portrait']]: true,
                  [styles.pitch]: editPitch,
                })}
              >
                <Music2 size={12} />
              </button>
              <button
                title="Delete Track"
                onClick={() => deleteTrack(rhythm.id)}
                className={clsx(styles.toggle, {
                  [styles['no-portrait']]: true,
                  [styles.destructive]: true,
                })}
              >
                <Trash size={10} />
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
              <Plus size={16} />
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
              <Minus size={16} />
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
