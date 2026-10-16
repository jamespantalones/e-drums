import { useSignals } from '@preact/signals-react/runtime';
import styles from './Footer.module.css';
import { Slider } from '../inputs/Slider';
import { SIG_BPM, SIG_SWING } from '../../state/track';
import { Config } from '../../config';

export function Footer() {
  useSignals();

  function handleBPMChange(bpm: number) {
    SIG_BPM.value = bpm;
  }

  function handleSwingChange(swing: number) {
    SIG_SWING.value = swing;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.slidecontainer}>
        <Slider
          onChange={handleBPMChange}
          variant="footer"
          label="Tempo"
          value={SIG_BPM.value}
          min={Config.MIN_BPM}
          max={Config.MAX_BPM}
        />
      </div>

      <div className={styles.slidecontainer}>
        <Slider
          onChange={handleSwingChange}
          variant="footer"
          label="Swing"
          value={SIG_SWING.value}
          min={0}
          max={100}
          step={1}
        />
      </div>
    </footer>
  );
}
