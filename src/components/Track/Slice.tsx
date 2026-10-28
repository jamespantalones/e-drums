import clsx from 'clsx';
import * as Tone from 'tone';
import { useComputed, useSignals } from '@preact/signals-react/runtime';
import styles from './Slice.module.css';
import { Plus as Add, Minus as Remove } from 'lucide-react';
import { Track } from '../../lib/Track';
import { useAudioContext } from '../../contexts/AudioContext';
import { MouseEvent, PointerEvent, useCallback, useId, useRef, useState } from 'react';
import { SIG_PLAY_STATE, SIG_TICK } from '../../state/track';
import { Config } from '../../config';
import { SequencerPlayState } from '../../types';

// drag distance per semitone, and how far a press can wander and still be a tap
const DRAG_STEP_PX = 14;
const DRAG_SLOP_PX = 6;

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
  useSignals();

  const {
    methods: { toggleTick, repitchTick },
  } = useAudioContext();

  const active = useComputed(() => {
    const tick = SIG_TICK.value;
    return tick % length === index || (index === 0 && tick === -1);
  }).value;

  const id = useId();
  const drag = useRef<{ y: number; start: number; moved: boolean }>();
  const [dragging, setDragging] = useState(false);

  const handleClick = useCallback(() => {
    toggleTick(rhythm.id, index);
  }, [rhythm, toggleTick, index]);

  const decrementPitch = useCallback(() => {
    repitchTick(rhythm.id, index, 'DECREMENT');
  }, [rhythm, repitchTick, index]);

  const incrementPitch = useCallback(() => {
    repitchTick(rhythm.id, index, 'INCREMENT');
  }, [rhythm, repitchTick, index]);

  // drag a lit step up or down to tune it; a still press falls through to
  // the +/- halves, which are too small to hit reliably on a phone
  const handlePointerDown = useCallback(
    (ev: PointerEvent<HTMLDivElement>) => {
      if (!rhythm.pattern[index] || !ev.isPrimary) return;
      drag.current = {
        y: ev.clientY,
        start: rhythm.pitchOffset[index] || 0,
        moved: false,
      };
    },
    [rhythm, index],
  );

  const handlePointerMove = useCallback(
    (ev: PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      const dy = d.y - ev.clientY;
      if (!d.moved) {
        if (Math.abs(dy) < DRAG_SLOP_PX) return;
        d.moved = true;
        setDragging(true);
        ev.currentTarget.setPointerCapture(ev.pointerId);
      }

      const max = Config.MAX_PITCH_OFFSET;
      const target = Math.max(
        -max,
        Math.min(max, d.start + Math.round(dy / DRAG_STEP_PX)),
      );
      let current = rhythm.pitchOffset[index] || 0;
      if (target === current) return;
      while (current !== target) {
        const up = target > current;
        repitchTick(rhythm.id, index, up ? 'INCREMENT' : 'DECREMENT');
        current += up ? 1 : -1;
      }

      // audition the new note while stopped; when playing the loop does it
      if (
        SIG_PLAY_STATE.value !== SequencerPlayState.STARTED &&
        Tone.getContext().state === 'running'
      ) {
        rhythm.play(Tone.now(), index);
      }
    },
    [rhythm, repitchTick, index],
  );

  const endDrag = useCallback(() => {
    // leave `moved` set so the click that follows the drag is swallowed
    if (drag.current && !drag.current.moved) drag.current = undefined;
    setDragging(false);
  }, []);

  const swallowClickAfterDrag = useCallback((ev: MouseEvent) => {
    if (drag.current?.moved) {
      ev.stopPropagation();
      ev.preventDefault();
    }
    drag.current = undefined;
  }, []);

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
            [styles.active]: active,
            [styles.enabled]: rhythm.pattern[index],
          })}
          type="button"
          onClick={handleClick}
        />
      )}
      {editPitch && (
        <div
          className={clsx(styles.slice, styles.tunable, {
            [styles.active]: active,
            [styles.enabled]: rhythm.pattern[index],
            [styles.dragging]: dragging,
          })}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={swallowClickAfterDrag}
        >
          {rhythm.pattern[index] > 0 && (
            <>
              <button
                className={clsx(styles.pitch, styles.top)}
                onClick={incrementPitch}
                title="Pitch up (or drag)"
                aria-label="Pitch up"
              >
                <Add />
              </button>
              <button
                className={clsx(styles.pitch, styles.bottom)}
                onClick={decrementPitch}
                title="Pitch down (or drag)"
                aria-label="Pitch down"
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
              <span>
                {rhythm.pitchOffset[index] < 0 && (
                  <span className={styles.sign}>−</span>
                )}
                {Math.abs(rhythm.pitchOffset[index])}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
