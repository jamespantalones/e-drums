import { forwardRef } from 'react';
import { Track } from '../../../lib/Track';
import { InstrumentPicker } from './InstrumentPicker';
import { PitchPicker } from './PitchPicker';
import { VolumePicker } from './VolumePicker';
import styles from './settingsPanel.module.css';
import clsx from 'clsx';
import { useAudioContext } from '../../../contexts/AudioContext';
import Close from '@mui/icons-material/Close';

export type Props = {
  open: boolean;
  close: () => void;
  rhythm: Track;
};

export const SettingsPanel = forwardRef<HTMLDialogElement, Props>(
  function Component(props, ref) {
    const {
      methods: { deleteTrack },
    } = useAudioContext();
    const { close, open, rhythm } = props;

    return (
      <dialog
        ref={ref}
        open={open}
        className={clsx(styles.dialog, {
          [styles.open]: open,
        })}
      >
        <div className={styles.strip}>
          <button className={styles.exit} title="Close" onClick={close}>
            <Close />
          </button>
        </div>

        <div className={styles.top}>
          <InstrumentPicker rhythm={rhythm} open={open} />
        </div>

        <div className={styles.bottom}>
          <div className={styles.faders}>
            <PitchPicker rhythm={rhythm} />
            <VolumePicker rhythm={rhythm} />
          </div>

          <button
            className="w-3/12 mx-auto block h-8 my-4 text-red-500 rounded text-xs uppercase border border-current"
            onClick={() => deleteTrack(rhythm.id)}
            title="Delete"
          >
            Delete
          </button>
        </div>
      </dialog>
    );
  }
);
