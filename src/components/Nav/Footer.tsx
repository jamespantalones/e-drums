import { useSignals } from '@preact/signals-react/runtime';
import styles from './Footer.module.css';
import { Slider } from '../inputs/Slider';
import { SIG_BPM, SIG_REVERB, SIG_SWING, SIG_VOLUME } from '../../state/track';
import { Config } from '../../config';

export function Footer() {
  useSignals();

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

  return (
    <footer className={styles.footer}>
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
    </footer>
  );
}
