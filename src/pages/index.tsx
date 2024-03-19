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
    <section className="p-2 md:p-4">
      <nav className="flex w-full max-w-screen justify-between items-center mb-8">
        <h1 className="">{metaConfig.title}</h1>
        <div>
          <Link href="/about" className="border-b text-xs">
            About
          </Link>
        </div>
      </nav>

      <ul className="text-xs">
        <li className="my-1 flex items-center justify-between p-2 border-b border-b-neutral-600">
          <div className="w-1/3 text-xs">Name</div>
          <button
            disabled
            className="opacity-0 border border-current p-1 text-xs"
          >
            {'DEL'}
          </button>
        </li>
        {projects.map((p) => (
          <Link href={`/${p.id}`} className="block " passHref key={p.id}>
            <li
              key={p.id}
              className="my-1 flex items-center justify-between p-2 hover:bg-foreground hover:text-background"
            >
              <div className="w-1/3 flex-shrink">{p.name}</div>
              <div className="text-xs w-1/3 flex-shrink">
                {new Date(p.updatedAt).toLocaleTimeString(undefined, {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </div>
              <button
                className="border border-current p-1 px-4 hover:bg-alert text-xs cursor-pointer"
                onClick={async (ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  await removeFromCache(p.id);
                  await fetchIndexCache();
                }}
              >
                DEL
              </button>
            </li>
          </Link>
        ))}
      </ul>
      <button
        className="fixed bottom-8 right-6 border border-current p-1 text-sm px-8 cursor-pointer hover:bg-foreground hover:text-background bg-background text-foreground active:bg-neutral-200 active:bg-background"
        onClick={createNew}
      >
        + NEW
      </button>
    </section>
  );
};

export default Home;
