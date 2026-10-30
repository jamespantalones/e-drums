import { DragControls } from 'framer-motion';
import styles from './ReorderIcon.module.css';
import { PixelText } from '../Logo/Logo';

interface Props {
  dragControls: DragControls;
  /** a full-size cell for upright layouts rather than the small icon */
  cell?: boolean;
}

export function ReorderIcon({ dragControls, cell = false }: Props) {
  return (
    <div
      className={cell ? styles.cell : styles.wrapper}
      title="Drag to reorder"
      onPointerDown={(ev) => dragControls.start(ev)}
    >
      <PixelText text="⠿" className="h-full w-auto" />
    </div>
  );
}
