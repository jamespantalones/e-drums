import styles from './Footer.module.css';
import { Slider } from '../inputs/Slider';
import { Config } from '../../config';
import { useTrackStore } from '../../state';

export function Footer() {
  const actions = useTrackStore((state) => state.action);
  const bpm = useTrackStore((state) => state.bpm);
  const swing = useTrackStore((state) => state.swing);
  const volume = useTrackStore((state) => state.volume);
  function handleBPMChange(bpm: number) {
    actions.changeBpm(bpm);
  }

  function handleSwingChange(swing: number) {
    actions.changeSwing(swing);
  }

  function handleVolumeChange(vol: number) {
    actions.changeVolume(vol);
  }

  function handleReverbChange(rev: number) {
    actions.changeReverb(rev);
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.slidecontainer}>
        <Slider
          onChange={handleBPMChange}
          label="Tempo"
          value={bpm}
          min={Config.MIN_BPM}
          max={Config.MAX_BPM}
        />
      </div>

      <div className={styles.slidecontainer}>
        <Slider
          onChange={handleVolumeChange}
          label="Vol."
          value={volume}
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
