import * as React from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import styles from './Nav.module.css';
import { useAudioContext } from '../../contexts/AudioContext';
import { Config } from '../../config';
import Link from 'next/link';
import clsx from 'clsx';
import {
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

function NavButton({
  label,
  text,
  onClick,
  disabled,
  active,
  wide,
  onPress,
}: {
  label: string;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  wide?: boolean;
  /** fires on press rather than release; keyboard still uses click */
  onPress?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
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
        text.length === 1 && (wide ? styles.transport : styles.icon),
        active && styles.active,
      )}
    >
      <PixelText
        text={text}
        className={text.length === 1 ? 'h-2.5 md:h-3 w-auto' : 'h-2 md:h-2.5 w-auto'}
      />
    </button>
  );
}

/** Save, with a menu for renaming and downloading the project */
function SaveMenu({
  save,
  download,
  disabled,
}: {
  save: () => void;
  download: () => void;
  disabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onPointer(ev: PointerEvent) {
      if (!root.current?.contains(ev.target as Node)) setOpen(false);
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false);
    }
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function choose(action: () => void) {
    setOpen(false);
    action();
  }

  React.useEffect(() => {
    if (!open) setRenaming(false);
  }, [open]);


  return (
    <div ref={root} className={clsx(styles.cell, styles.split)}>
      <button
        type="button"
        title="Save"
        aria-label="Save"
        onClick={save}
        className={clsx(styles.cell, styles.button)}
      >
        <PixelText text="Save" className="h-2 md:h-2.5 w-auto" />
      </button>
      <button
        type="button"
        title="More save options"
        aria-label="More save options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={clsx(styles.cell, styles.button, styles.caret, {
          [styles.active]: open,
        })}
      >
        <PixelText text="▼" className="h-2 md:h-2.5 w-auto" />
      </button>

      {open && (
        <div role="menu" className={styles.menu}>
          {/* phones have no room for the name field in the bar */}
          {renaming ? (
            <input
              autoFocus
              type="text"
              aria-label="Name"
              value={SIG_NAME.value}
              placeholder={SIG_SEQUENCER.value?.id}
              onChange={(ev) => {
                SIG_NAME.value = ev.target.value;
              }}
              onBlur={() => choose(save)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') ev.currentTarget.blur();
              }}
              className={styles.rename}
            />
          ) : (
            <button
              role="menuitem"
              type="button"
              onClick={() => setRenaming(true)}
              className="md:hidden"
            >
              <PixelText text="Rename" label="Rename" className="h-2 md:h-2.5 w-auto" />
            </button>
          )}
          <button role="menuitem" type="button" onClick={() => choose(save)}>
            <PixelText text="Save" label="Save" className="h-2 md:h-2.5 w-auto" />
          </button>
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

  const playing = SIG_PLAY_STATE.value === SequencerPlayState.STARTED;
  const controlsOpen = SIG_CONTROLS_OPEN.value;
  const editPitch = SIG_EDIT_PITCH.value;

  // the same file format the index page exports and imports
  function download() {
    const project = SIG_SEQUENCER.value?.exportJSON();
    if (!project) return;
    downloadJSON(
      `edrums-${slug(SIG_NAME.value || project.id)}.json`,
      toBackup([project])
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

  return (
    <nav className={styles.nav}>
      <Link
        href="/"
        className={clsx(styles.cell, styles.button, styles.logo)}
        onClick={() => methods.stop()}
      >
        <h1 className="!transform-none not-italic text-[15px] leading-none flex">
          <Logo />
        </h1>
      </Link>

      <div className={clsx(styles.cell, styles.name)}>
        {children}
        <span className={styles.title}>
          {SIG_NAME.value || SIG_SEQUENCER.value?.id}
        </span>
      </div>

      <NavButton
        label={playing ? 'Stop' : 'Play'}
        text={playing ? '■' : '▶'}
        onPress={togglePlay}
        active={playing}
        wide
      />
      {!SIG_PORTRAIT_PHONE.value && (
        <NavButton
          label={controlsOpen ? 'Hide track controls' : 'Show track controls'}
          text="◧"
          onClick={() => {
            SIG_CONTROLS_OPEN.value = !controlsOpen;
          }}
          active={controlsOpen}
        />
      )}
      <NavButton
        label={editPitch ? 'Stop tuning notes' : 'Tune notes'}
        text="♪"
        onClick={() => {
          SIG_EDIT_PITCH.value = !editPitch;
        }}
        active={editPitch}
      />
      <NavButton
        label="Add track"
        text="+ Trk"
        onClick={methods.createTrack}
        disabled={
          SIG_TRACKS.value.length === Config.MAX_TRACKS ||
          !SIG_INITIALIZED.value
        }
      />
      <SaveMenu
        save={save}
        download={download}
        disabled={!SIG_INITIALIZED.value}
      />
    </nav>
  );
}
