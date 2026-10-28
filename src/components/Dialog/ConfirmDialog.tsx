import * as React from 'react';
import { PixelText } from '../Logo/Logo';
import styles from './Dialog.module.css';

export { styles as dialogStyles };

/** A modal yes/no, with Cancel focused so a stray tap does nothing */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialog = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) dialog.current?.close();
      }}
      aria-label={title}
      className={styles.dialog}
    >
      <div className={styles.body}>
        <PixelText text={title} className="h-3 md:h-4 w-auto max-w-full" />
        {message && <p className={styles.message}>{message}</p>}
      </div>
      <div className={styles.actions}>
        <button type="button" autoFocus onClick={() => dialog.current?.close()}>
          <PixelText text="Cancel" className="h-2.5 w-auto" />
        </button>
        <button
          type="button"
          className={styles.danger}
          onClick={() => {
            dialog.current?.close();
            onConfirm();
          }}
        >
          <PixelText text={confirmLabel} className="h-2.5 w-auto" />
        </button>
      </div>
    </dialog>
  );
}
