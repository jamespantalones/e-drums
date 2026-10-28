import { useAudioContext } from '../../contexts/AudioContext';
import { Track } from '../../lib/Track';
import styles from './Track.module.css';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo } from 'react';
import { Slice } from './Slice';

import {
  Reorder,
  motion,
  useDragControls,
  useReducedMotion,
} from 'framer-motion';
import { useSignals } from '@preact/signals-react/runtime';
import {
  CONTROLS_EASE,
  SIG_CONTROLS_OPEN,
  SIG_EDIT_PITCH,
  SIG_PORTRAIT_PHONE,
} from '../../state/ui';
import { Edit } from './Edit';
import { useDeleteTrackOnEmpty } from './useDeleteTrackOnEmpty';
import { trackChroma, trackLightness } from '../../lib/utils';

export function TrackItem({
  rhythm,
  mobile,
}: {
  index: number;
  rhythm: Track;
  mobile: boolean;
}) {
  // every track re-renders on the toggle, so framer can measure the move
  useSignals();
  const open = SIG_CONTROLS_OPEN.value || SIG_PORTRAIT_PHONE.value;
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : CONTROLS_EASE;

  const {
    methods: { setTrackVal },
  } = useAudioContext();

  const editPitch = SIG_EDIT_PITCH.value;

  const { length } = useMemo(() => rhythm.pattern, [rhythm.pattern]);

  const removeNote = useCallback(
    (index: number) => {
      setTrackVal(rhythm, { method: 'removeNote', value: index });
    },
    [rhythm, setTrackVal],
  );

  const dragControls = useDragControls();

  const style: React.CSSProperties = {
    '--track-h': rhythm.color[0],
    '--track-c': trackChroma(rhythm.color[1]),
    '--track-l': trackLightness(rhythm.color[2]),
  } as React.CSSProperties;

  useDeleteTrackOnEmpty(rhythm);

  return (
    <Reorder.Item
      value={rhythm}
      className={clsx(styles.section, {})}
      data-color={rhythm.color}
      style={style}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      transition={transition}
    >
      <div className={clsx(styles['track-wrapper'], styles.group)}>
        <Edit
          open={open}
          rhythm={rhythm}
          removeNote={removeNote}
          dragControls={dragControls}
        />

        {/* the steps glide to their new spot as the controls swap */}
        <motion.div
          layout="position"
          transition={transition}
          className={styles.slices}
        >
          {rhythm.pattern.map((_, index) => (
            <div key={`${rhythm.id}-${index}`}>
              <Slice
                index={index}
                rhythm={rhythm}
                length={length}
                editPitch={editPitch}
                mobile={mobile}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </Reorder.Item>
  );
}
