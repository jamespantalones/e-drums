import type { NextPage } from 'next';
import * as React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { generateId } from '../utils';
import { useOfflineStorage } from '../contexts/OfflineStorageContext';
import { useRouter } from 'next/router';
import { Sequencer } from '../lib/Sequencer';
import { Config } from '../config';
import { generateTrack } from '../lib/utils';
import {
  SIG_BPM,
  SIG_REVERB,
  SIG_SERIALIZED_TRACKS,
  SIG_SWING,
  SIG_VOLUME,
} from '../state/track';
import { PixelText, Wordmark } from '../components/Logo/Logo';
import { Intro } from '../components/Intro/Intro';
import { downloadJSON, parseBackup, slug, toBackup } from '../lib/backup';

const INTRO_KEY = 'edrums:intro-seen';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

// step cells between New and the file buttons; lit ones spell out E(5,8)
const STEPS = [1, 0, 1, 1, 0, 1, 1, 0];

const INVERT = 'hover:bg-white hover:text-black';

// Import / Export: two step cells wide on desktop, half a row on phones
const FILE_CELL =
  'col-span-4 md:col-span-2 flex items-center justify-center bg-black text-white py-5 md:py-0';

const FOCUS =
  'focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-current';

const Home: NextPage = () => {
  const router = useRouter();

  // the intro plays once per browser session; checked before paint so
  // returning to the index doesn't flash it
  const [showIntro, setShowIntro] = React.useState(true);

  useIsomorphicLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(INTRO_KEY) === '1') setShowIntro(false);
    } catch {}
  }, []);

  const wordmark = React.useRef<HTMLAnchorElement>(null);

  const introDone = React.useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {}
    setShowIntro(false);
  }, []);

  const {
    projects,
    removeFromCache,
    saveProjectToCache,
    fetchIndexCache,
    importProjects,
  } = useOfflineStorage();

  const fileInput = React.useRef<HTMLInputElement>(null);

  function exportAll() {
    const day = new Date().toISOString().slice(0, 10);
    downloadJSON(`edrums-${day}.json`, toBackup(projects));
  }

  async function importFiles(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(ev.target.files || []);
    // let the same file be picked again later
    ev.target.value = '';
    if (!files.length) return;

    try {
      const found = (
        await Promise.all(files.map(async (f) => parseBackup(await f.text())))
      ).flat();
      const { imported, skipped } = await importProjects(found);
      window.alert(
        `Imported ${imported} sequence${imported === 1 ? '' : 's'}.` +
          (skipped ? ` Kept ${skipped} newer cop${skipped === 1 ? 'y' : 'ies'} already saved here.` : ''),
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Import failed.');
    }
  }

  async function createNew() {
    const id = generateId();
    SIG_SERIALIZED_TRACKS.value = [generateTrack(0)];
    SIG_VOLUME.value = Config.DEFAULT_VOLUME;
    SIG_BPM.value = Config.DEFAULT_BPM;
    SIG_SWING.value = 10;
    SIG_REVERB.value = 13;

    const seq = new Sequencer({ id });
    const json = seq.exportJSON();
    // only needed to build the initial project; free its audio nodes
    seq.destroy();

    await saveProjectToCache(id, {
      ...json,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    router.push(`/${id}`);
  }

  return (
    <>
      {showIntro && <Intro onDone={introDone} target={wordmark} />}

      <main className="full-bleed min-h-screen bg-black text-white font-mono tracking-normal">
        <header className="border-b-4 border-white p-4 md:p-6">
          <h1 className="!transform-none not-italic">
            {/* hidden, not removed, while the intro word flies onto it */}
            <Link
              href="/"
              ref={wordmark}
              className={clsx('block', showIntro && 'invisible')}
            >
              <Wordmark className="block h-auto w-full" />
              <span className="sr-only">e-drums</span>
            </Link>
          </h1>
        </header>

        <div className="flex items-stretch border-b-4 border-white">
          <p className="flex-1 px-4 py-3 md:px-6 md:py-4 text-base md:text-lg text-neutral-400">
            Euclidean polyrhythm machine.
          </p>
          <Link
            href="/about"
            className={clsx(
              'flex items-center border-l-4 border-white px-4 md:px-6',
              INVERT,
              FOCUS,
            )}
          >
            <PixelText text="About" label="About" className="h-3 md:h-4 w-auto" />
          </Link>
        </div>

        {/* a step-sequencer row: New takes four cells, then steps, then the
            file buttons (their own row on phones) */}
        <div className="seq grid grid-cols-8 md:grid-cols-16 gap-1 bg-white border-b-4 border-white">
          <button
            onClick={createNew}
            className={clsx(
              'col-span-4 flex items-center justify-center bg-white text-black hover:bg-black hover:text-white active:bg-white active:text-black',
              FOCUS,
            )}
          >
            <PixelText
              text="+ New"
              label="New sequence"
              className="h-7 md:h-11 w-auto"
            />
          </button>
          {STEPS.map((lit, i) => (
            <div
              key={i}
              aria-hidden
              className={clsx(
                'seq-step aspect-square bg-black flex items-center justify-center',
                i >= 4 && 'hidden md:flex',
              )}
              style={{ '--i': i } as React.CSSProperties}
            >
              <div
                className={clsx(
                  'seq-dot w-1/4 h-1/4',
                  lit ? 'seq-lit bg-white' : 'border-2 border-neutral-700',
                )}
              />
            </div>
          ))}

          {/* a file backup outlives cleared browser storage */}
          <button
            className={clsx(FILE_CELL, INVERT, FOCUS)}
            title="Import sequences from a backup file"
            onClick={() => fileInput.current?.click()}
          >
            <PixelText text="Import" label="Import" className="h-3 md:h-4 w-auto" />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            multiple
            hidden
            onChange={importFiles}
          />
          <button
            className={clsx(
              FILE_CELL,
              'disabled:text-neutral-600 disabled:hover:bg-black',
              INVERT,
              FOCUS,
            )}
            title="Download every sequence as a backup file"
            onClick={exportAll}
            disabled={!projects.length}
          >
            <PixelText text="Export" label="Export all" className="h-3 md:h-4 w-auto" />
          </button>
        </div>

        <section>
          <h2 className="flex items-center gap-3 md:gap-4 border-b-4 border-white px-4 py-3 md:px-6">
            <PixelText text="Saved" label="Saved" className="h-3 md:h-4 w-auto" />
            <PixelText
              text={String(projects.length).padStart(2, '0')}
              label={`${projects.length} sequences`}
              className="h-3 md:h-4 w-auto text-neutral-500"
            />
          </h2>

          {projects.length === 0 ? (
            <p className="p-4 md:p-6 text-base md:text-lg text-neutral-500">
              Nothing saved yet.
            </p>
          ) : (
            <ul>
              {projects.map((p) => (
                <li
                  key={p.id}
                  className={clsx(
                    'flex items-stretch border-b-4 border-white',
                    INVERT,
                    'focus-within:bg-white focus-within:text-black',
                  )}
                >
                  <Link
                    href={`/${p.id}`}
                    className={clsx(
                      'flex flex-1 min-w-0 flex-col md:flex-row md:items-center gap-2 md:gap-6 p-4 md:px-6',
                      FOCUS,
                    )}
                  >
                    <span className="flex-1 min-w-0 overflow-hidden">
                      <PixelText
                        text={p.name || 'Untitled'}
                        label={p.name || 'Untitled'}
                        className="h-4 md:h-6 w-auto max-w-none"
                      />
                    </span>
                    <span className="shrink-0 text-sm md:text-base leading-none text-neutral-400">
                      {new Date(p.updatedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </Link>
                  <button
                    className={clsx(
                      'shrink-0 border-l-4 border-current px-5 md:px-8 hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white',
                      FOCUS,
                    )}
                    aria-label={`Download ${p.name}`}
                    title="Download"
                    onClick={() =>
                      downloadJSON(`edrums-${slug(p.name || p.id)}.json`, toBackup([p]))
                    }
                  >
                    <PixelText text="↓" className="h-3 md:h-4 w-auto" />
                  </button>
                  <button
                    className={clsx(
                      'shrink-0 border-l-4 border-current px-5 md:px-8 hover:bg-danger hover:text-white focus-visible:bg-danger focus-visible:text-white',
                      FOCUS,
                    )}
                    aria-label={`Delete ${p.name}`}
                    title="Delete"
                    onClick={async () => {
                      const confirm = window.confirm(
                        `Delete ${p.name}? This can't be undone.`,
                      );
                      if (confirm) {
                        await removeFromCache(p.id);
                        await fetchIndexCache();
                      }
                    }}
                  >
                    <PixelText text="X" className="h-3 md:h-4 w-auto" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="hidden portrait:block p-4 text-sm text-neutral-500">
          Holding your phone upright hides some controls. Turn it sideways for
          the full editor.
        </p>
      </main>
    </>
  );
};

export default Home;
