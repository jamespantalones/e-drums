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

const INTRO_KEY = 'edrums:intro-seen';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

// empty step cells after the New button; lit ones spell out E(5,12)
const STEPS = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0];

const INVERT = 'hover:bg-white hover:text-black';

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

  const introDone = React.useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {}
    setShowIntro(false);
  }, []);

  const { projects, removeFromCache, saveProjectToCache, fetchIndexCache } =
    useOfflineStorage();

  /**
   * Create a new sequencer
   */
  async function createNew() {
    const id = generateId();
    SIG_SERIALIZED_TRACKS.value = [generateTrack(0)];
    SIG_VOLUME.value = Config.DEFAULT_VOLUME;
    SIG_BPM.value = Config.DEFAULT_BPM;
    SIG_SWING.value = 10;
    SIG_REVERB.value = 13;

    const seq = new Sequencer({ id });

    const json = await seq.exportJSON();

    await saveProjectToCache(id, {
      ...json,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    router.push(`/${id}`);
  }

  return (
    <>
      {showIntro && <Intro onDone={introDone} />}

      <main className="full-bleed min-h-screen bg-black text-white font-term tracking-normal">
        <header className="border-b-4 border-white p-4 md:p-6">
          <h1 className="!transform-none not-italic">
            <Link href="/" className="block">
              <Wordmark className="block h-auto w-full" />
              <span className="sr-only">e-drums</span>
            </Link>
          </h1>
        </header>

        <div className="flex items-stretch border-b-4 border-white">
          <p className="flex-1 p-4 md:p-6 text-3xl md:text-5xl leading-none">
            Euclidean polyrhythm machine.
          </p>
          <Link
            href="/about"
            className={clsx(
              'flex items-center border-l-4 border-white px-4 md:px-8',
              INVERT,
              FOCUS,
            )}
          >
            <PixelText text="About" label="About" className="h-5 md:h-7 w-auto" />
          </Link>
        </div>

        {/* a step-sequencer row: New takes four cells, the rest are steps */}
        <div className="grid grid-cols-8 md:grid-cols-16 gap-1 bg-white border-b-4 border-white">
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
              className="h-6 md:h-9 w-auto"
            />
          </button>
          {STEPS.map((lit, i) => (
            <div
              key={i}
              aria-hidden
              className={clsx(
                'aspect-square bg-black flex items-center justify-center',
                i >= 4 && 'hidden md:flex',
              )}
            >
              <div
                className={clsx(
                  'w-1/4 h-1/4',
                  lit ? 'bg-white' : 'border-2 border-neutral-700',
                )}
              />
            </div>
          ))}
        </div>

        <section>
          <h2 className="flex items-center justify-between border-b-4 border-white p-4 md:px-6">
            <PixelText text="Saved" label="Saved" className="h-5 md:h-7 w-auto" />
            <PixelText
              text={String(projects.length).padStart(2, '0')}
              label={`${projects.length} sequences`}
              className="h-5 md:h-7 w-auto"
            />
          </h2>

          {projects.length === 0 ? (
            <p className="p-4 md:p-6 text-4xl md:text-5xl text-neutral-400">
              Nothing saved yet. Hit New and it lands here.
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
                        className="h-7 md:h-10 w-auto max-w-none"
                      />
                    </span>
                    <span className="shrink-0 text-2xl md:text-3xl leading-none">
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
                      'shrink-0 border-l-4 border-current px-5 md:px-8 hover:bg-black hover:text-white',
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
                    <PixelText text="X" className="h-5 md:h-7 w-auto" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="hidden portrait:block p-4 text-2xl text-neutral-400">
          Holding your phone upright hides some controls. Turn it sideways for
          the full editor.
        </p>
      </main>
    </>
  );
};

export default Home;
