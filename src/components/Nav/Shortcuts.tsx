import * as React from 'react';
import { PixelText } from '../Logo/Logo';
import { dialogStyles } from '../Dialog/ConfirmDialog';
import { useKeyLabel } from '../../hooks/useHotKeys';
import styles from './Shortcuts.module.css';

export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['Space'], label: 'Play / stop' },
  { keys: ['t'], label: 'Tune notes' },
  { keys: ['Escape'], label: 'Stop tuning' },
  { keys: ['c'], label: 'Show / hide track controls' },
  { keys: ['[', ']'], label: 'Tempo down / up' },
  { keys: ['Ctrl+n'], label: 'Add track' },
  { keys: ['Ctrl+Backspace'], label: 'Remove last added track' },
  { keys: ['Mod+Shift+s'], label: 'Download file' },
  { keys: ['Shift+?'], label: 'Shortcuts' },
];

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const keyLabel = useKeyLabel();

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
      aria-label="Keyboard shortcuts"
      className={dialogStyles.dialog}
    >
      <div className={dialogStyles.body}>
        <PixelText text="Shortcuts" className="h-3 md:h-4 w-auto max-w-full" />
        <dl className={styles.list}>
          {SHORTCUTS.map(({ keys, label }) => (
            <React.Fragment key={label}>
              <dt className={styles.keys}>
                {keys.map((k) => (
                  <kbd key={k}>{keyLabel(k)}</kbd>
                ))}
              </dt>
              <dd>{label}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
      <div className={dialogStyles.actions}>
        <button type="button" autoFocus onClick={() => dialog.current?.close()}>
          <PixelText text="Close" className="h-2.5 w-auto" />
        </button>
      </div>
    </dialog>
  );
}
