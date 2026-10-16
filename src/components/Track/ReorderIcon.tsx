import { DragControls } from 'framer-motion';
import styles from './ReorderIcon.module.css';
import { PixelText } from '../Logo/Logo';

interface Props {
  dragControls: DragControls;
}

export function ReorderIcon({ dragControls }: Props) {
  return (
    <div
      className={styles.wrapper}
      onPointerDown={(ev) => dragControls.start(ev)}
    >
      <PixelText text="⠿" className="h-full w-auto" />
    </div>
  );
}
