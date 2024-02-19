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
    <section className="p-4">
      <nav className="flex w-full justify-between items-center">
        <h1 className="text-5xl mb-8">{metaConfig.title}</h1>
        <div>
          <Link href="/about" className="border-b">
            About
          </Link>
        </div>
      </nav>

      <ul className="text-xs">
        <li className="my-1 flex items-center justify-between p-2 border-b">
          <div className="w-1/2 text-xs">Name</div>
          <div className="text-xs w-1/3">Updated</div>
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
              <div className="w-1/2">{p.name}</div>
              <div className="text-xs w-1/3">{p.updatedAt}</div>
              <button
                className="border border-current p-1 px-6 hover:bg-alert text-xs cursor-pointer"
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
        className="fixed bottom-8 right-6 border border-current p-1 text-sm px-8 cursor-pointer hover:bg-background hover:text-foreground bg-foreground text-background active:bg-neutral-200 active:bg-background"
        onClick={createNew}
      >
        + NEW
      </button>
    </section>
  );
};

export default Home;
