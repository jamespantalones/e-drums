import * as React from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import styles from './Nav.module.css';
import { useAudioContext } from '../../contexts/AudioContext';
import { Config } from '../../config';
import Link from 'next/link';
import clsx from 'clsx';
import {
  SIG_BPM,
  SIG_INITIALIZED,
  SIG_NAME,
  SIG_PLAY_STATE,
  SIG_SEQUENCER,
  SIG_TRACKS,
} from '../../state/track';
import { SequencerPlayState } from '../../types';
import { Logo, PixelText } from '../Logo/Logo';
import {
  SIG_CONTROLS_OPEN,
  SIG_EDIT_PITCH,
  SIG_PORTRAIT_PHONE,
} from '../../state/ui';
import { downloadJSON, slug, toBackup } from '../../lib/backup';
import { dialogStyles } from '../Dialog/ConfirmDialog';
import { useHotKeys, useKeyLabel } from '../../hooks/useHotKeys';
import { ShortcutsDialog } from './Shortcuts';

function NavButton({
  label,
  text,
  onClick,
  disabled,
  active,
  large,
  onPress,
  shortcut,
}: {
  label: string;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  /** a bigger glyph, for play/stop */
  large?: boolean;
  /** fires on press rather than release; keyboard still uses click */
  onPress?: () => void;
  /** shown in the hint, already formatted */
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
      onPointerDown={
        onPress &&
        ((ev) => {
          if (ev.button === 0) onPress();
        })
      }
      onClick={(ev) => {
        if (!onPress) onClick?.();
        else if (ev.detail === 0) onPress();
      }}
      disabled={disabled}
      className={clsx(
        styles.cell,
        styles.button,
        styles.icon,
        large && styles.transport,
        active && styles.active,
      )}
    >
      <PixelText text={text} className="h-2.5 md:h-3 w-auto" />
    </button>
  );
}

/** Phones show the name as text; tapping it renames in a dialog */
function TitleButton({ save }: { save: () => void }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = React.useState('');
  const name = SIG_NAME.value || SIG_SEQUENCER.value?.id || '';

  function open() {
    setDraft(SIG_NAME.value);
    dialog.current?.showModal();
  }

  function commit(ev: React.FormEvent) {
    ev.preventDefault();
    const next = draft.trim();
    if (next) SIG_NAME.value = next;
    dialog.current?.close();
    save();
  }

  return (
    <>
      <button
        type="button"
        className={styles.title}
        onClick={open}
        aria-label={`Rename ${name}`}
      >
        {name}
      </button>
      <dialog
        ref={dialog}
        aria-label="Rename"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) dialog.current?.close();
        }}
        className={dialogStyles.dialog}
      >
        <form onSubmit={commit}>
          <label className={dialogStyles.body}>
            <PixelText text="Name" className="h-2.5 w-auto" />
            <input
              className={dialogStyles.field}
              autoFocus
              type="text"
              value={draft}
              placeholder={SIG_SEQUENCER.value?.id}
              onChange={(ev) => setDraft(ev.target.value)}
              enterKeyHint="done"
            />
          </label>
          <div className={dialogStyles.actions}>
            <button type="button" onClick={() => dialog.current?.close()}>
              <PixelText text="Cancel" className="h-2.5 w-auto" />
            </button>
            <button type="submit" className={dialogStyles.primary}>
              <PixelText text="Rename" className="h-2.5 w-auto" />
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** Everything that doesn't need a button of its own; the project autosaves */
function MoreMenu({
  save,
  download,
  removeTrack,
  showShortcuts,
  disabled,
}: {
  save: () => void;
  download: () => void;
  /** undefined when there's no track to remove */
  removeTrack?: () => void;
  showShortcuts: () => void;
  disabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);

  useHotKeys({
    // autosave makes this redundant, but it keeps the browser's own
    // save-page dialog away
    'Mod+s': {
      inFields: true,
      handler: () => {
        if (!disabled) save();
      },
    },
    'Mod+Shift+s': () => {
      if (!disabled) download();
    },
    ...(open && { Escape: () => setOpen(false) }),
  });

  React.useEffect(() => {
    if (!open) return;
    function onPointer(ev: PointerEvent) {
      if (!root.current?.contains(ev.target as Node)) setOpen(false);
    }
    window.addEventListener('pointerdown', onPointer);
    return () => window.removeEventListener('pointerdown', onPointer);
  }, [open]);

  function choose(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={root} className={clsx(styles.cell, styles.split)}>
      <button
        type="button"
        title="More"
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={clsx(styles.cell, styles.button, styles.icon, {
          [styles.active]: open,
        })}
      >
        <PixelText text="▼" className="h-2 md:h-2.5 w-auto" />
      </button>

      {open && (
        <div role="menu" className={styles.menu}>
          <button
            role="menuitem"
            type="button"
            onClick={() => choose(download)}
            disabled={disabled}
          >
            <PixelText
              text="Download file"
              label="Download file"
              className="h-2 md:h-2.5 w-auto"
            />
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => removeTrack && choose(removeTrack)}
            disabled={!removeTrack}
          >
            <PixelText
              text="Remove last track"
              label="Remove last track"
              className="h-2 md:h-2.5 w-auto"
            />
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => choose(showShortcuts)}
          >
            <PixelText
              text="Shortcuts"
              label="Shortcuts"
              className="h-2 md:h-2.5 w-auto"
            />
          </button>
        </div>
      )}
    </div>
  );
}

export function Nav({
  save,
  children,
}: {
  save: () => Promise<void>;
  children: React.ReactNode;
}) {
  useSignals();

  const { methods } = useAudioContext();
  const keyLabel = useKeyLabel();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  const playing = SIG_PLAY_STATE.value === SequencerPlayState.STARTED;
  const controlsOpen = SIG_CONTROLS_OPEN.value;
  const editPitch = SIG_EDIT_PITCH.value;

  // the same file format the index page exports and imports
  function download() {
    const project = SIG_SEQUENCER.value?.exportJSON();
    if (!project) return;
    downloadJSON(
      `edrums-${slug(SIG_NAME.value || project.id)}.json`,
      toBackup([project]),
    );
  }

  function togglePlay() {
    if (playing) {
      methods.stop();
      return;
    }
    methods.stop();
    methods.play();
  }

  const canAddTrack =
    SIG_INITIALIZED.value && SIG_TRACKS.value.length < Config.MAX_TRACKS;

  const canRemoveTrack = SIG_INITIALIZED.value && SIG_TRACKS.value.length > 0;

  function nudgeTempo(by: number) {
    SIG_BPM.value = Math.min(
      Config.MAX_BPM,
      Math.max(Config.MIN_BPM, SIG_BPM.value + by),
    );
  }

  useHotKeys({
    // beats activating whichever button has focus
    Space: () => {
      if (SIG_INITIALIZED.value) togglePlay();
    },
    t: () => {
      SIG_EDIT_PITCH.value = !editPitch;
    },
    ...(editPitch && {
      Escape: () => {
        SIG_EDIT_PITCH.value = false;
      },
    }),
    c: () => {
      if (!SIG_PORTRAIT_PHONE.value) SIG_CONTROLS_OPEN.value = !controlsOpen;
    },
    '[': { repeat: true, handler: () => nudgeTempo(-1) },
    ']': { repeat: true, handler: () => nudgeTempo(1) },
    'Ctrl+n': () => {
      if (canAddTrack) methods.createTrack();
    },
    'Ctrl+Backspace': () => {
      if (canRemoveTrack) methods.removeLastTrack();
    },
    'Shift+?': () => setShortcutsOpen(true),
  });

  return (
    <nav className={styles.nav} style={{ viewTransitionName: 'nav' }}>
      <Link
        href="/"
        className={clsx(styles.cell, styles.button, styles.logo)}
        onClick={() => methods.stop()}
      >
        <h1 className="!transform-none not-italic text-[15px] leading-none flex">
          <Logo transitionName="wordmark" />
        </h1>
      </Link>

      <div className={clsx(styles.cell, styles.name)}>
        {children}
        <TitleButton save={save} />
      </div>

      <NavButton
        label={playing ? 'Stop' : 'Play'}
        text={playing ? '■' : '▶'}
        onPress={togglePlay}
        active={playing}
        shortcut={keyLabel('Space')}
        large
      />
      {!SIG_PORTRAIT_PHONE.value && (
        <NavButton
          label={controlsOpen ? 'Hide track controls' : 'Show track controls'}
          text="◧"
          onClick={() => {
            SIG_CONTROLS_OPEN.value = !controlsOpen;
          }}
          active={controlsOpen}
          shortcut={keyLabel('c')}
        />
      )}
      <NavButton
        label={editPitch ? 'Stop tuning notes' : 'Tune notes'}
        text="♪"
        onClick={() => {
          SIG_EDIT_PITCH.value = !editPitch;
        }}
        active={editPitch}
        shortcut={keyLabel('t')}
      />
      <NavButton
        label="Add track"
        text="+"
        onClick={methods.createTrack}
        disabled={!canAddTrack}
        shortcut={keyLabel('Ctrl+n')}
      />
      <MoreMenu
        save={save}
        download={download}
        removeTrack={canRemoveTrack ? methods.removeLastTrack : undefined}
        showShortcuts={() => setShortcutsOpen(true)}
        disabled={!SIG_INITIALIZED.value}
      />
      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </nav>
  );
}
