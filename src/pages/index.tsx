import type { NextPage } from 'next';
import * as React from 'react';
import Link from 'next/link';
import { generateId, noop } from '../utils';
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
import { metaConfig } from '../config/meta';

const Home: NextPage = () => {
  const router = useRouter();

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
    <section className="p-3 pt-5">
      <nav className="flex w-full max-w-screen justify-between items-center mb-8">
        <Link href="/" passHref>
          <h1 className="text-lg">{metaConfig.title}</h1>
        </Link>
        <div>
          <Link
            href="/about"
            className="border-b text-base block transition-transform hover:scale-x-75 hover:scale-y-150"
          >
            About
          </Link>
        </div>
      </nav>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-base text-neutral-400">
          An simple polyrhythm generator that works offline.
        </h2>
        <p className="mt-4 text-neutral-500">
          <small>
            *If visiting on a mobile device in portrait orientation, note that
            not all features are present. For now.
          </small>
        </p>
      </section>

      <ul className="text-xxs md:text-xs my-8 bg-neutral-900 max-w-2xl mx-auto p-4 rounded">
        {projects.map((p) => (
          <Link
            href={`/${p.id}`}
            className="block border-b border-1 border-neutral-800 last:border-none transition-transform hover:scale-y-150"
            passHref
            key={p.id}
          >
            <li
              key={p.id}
              className="my-1 flex items-center justify-between p-2 px-4 hover:bg-foreground hover:text-background"
            >
              <div className="w-1/3 flex-shrink">{p.name}</div>
              <div className="w-1/3 flex-shrink">
                {new Date(p.updatedAt).toLocaleTimeString(undefined, {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </div>
              <button
                className="p-1 px-4 bg-neutral-600 hover:bg-neutral-800 hover:text-foreground cursor-pointer"
                onClick={async (ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  const confirm = window.confirm(
                    `Are you sure you want to delete ${p.name}? This cannot be undone.`
                  );
                  if (confirm) {
                    await removeFromCache(p.id);
                    await fetchIndexCache();
                  }
                }}
              >
                DEL
              </button>
            </li>
          </Link>
        ))}
      </ul>
      <button
        className="fixed bottom-8 right-6 border border-current py-3 text-sm px-12 cursor-pointer bg-foreground text-background hover:bg-neutral-200 bg:text-foreground active:bg-neutral-200 active:bg-background"
        onClick={createNew}
      >
        + NEW
      </button>
    </section>
  );
};

export default Home;
