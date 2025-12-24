import clsx from 'clsx';
import styles from './Slice.module.css';
import { Plus as Add, Minus as Remove } from 'lucide-react';
import { Track } from '../../lib/Track';
import { useAudioContext } from '../../contexts/AudioContext';
import { useCallback, useId, useRef } from 'react';
import { useTick } from '../../state';

export function Slice({
  index,
  editPitch,
  length,
  rhythm,
}: {
  editPitch?: boolean;
  length: number;
  index: number;
  rhythm: Track;
  mobile: boolean;
}) {
  const {
    methods: { toggleTick, repitchTick },
  } = useAudioContext();

  const tick = useTick();

  const id = useId();
  const x = useRef<number>(0);
  const y = useRef<number>(0);

  const handleClick = useCallback(() => {
    toggleTick(rhythm.id, index);
  }, [rhythm, toggleTick, index]);

  const decrementPitch = useCallback(() => {
    repitchTick(rhythm.id, index, 'DECREMENT');
  }, [rhythm, repitchTick, index]);

  const incrementPitch = useCallback(() => {
    repitchTick(rhythm.id, index, 'INCREMENT');
  }, [rhythm, repitchTick, index]);

  return (
    <div
      key={`${rhythm.id}-${index}-${id}`}
      className={clsx(styles['slice-outer'], {
        [styles.muted]: rhythm.muted,
      })}
    >
      {!editPitch && (
        <button
          key={index}
          className={clsx(styles.slice, {
            [styles.active]:
              tick % length === index || (index === 0 && tick === -1),
            [styles.enabled]: rhythm.pattern[index],
          })}
          type="button"
          onClick={handleClick}
        />
      )}
      {editPitch && (
        <div
          className={clsx(styles.slice, {
            [styles.active]: tick % length === index,
            [styles.enabled]: rhythm.pattern[index],
          })}
        >
          {rhythm.pattern[index] > 0 && (
            <>
              <button
                className={clsx(styles.pitch, styles.top)}
                onClick={incrementPitch}
              >
                <Add />
              </button>
              <button
                className={clsx(styles.pitch, styles.bottom)}
                onClick={decrementPitch}
              >
                <Remove />
              </button>
            </>
          )}

          {rhythm.pattern[index] === 0 && (
            <button
              className={styles.toggle}
              key={index}
              type="button"
              onClick={handleClick}
            />
          )}

          {rhythm.pattern[index] > 0 && (
            <div className={styles['pitch-overlay']}>
              <span>{rhythm.pitchOffset[index]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
