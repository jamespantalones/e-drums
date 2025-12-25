'use client';

import { Reorder, useDragControls } from 'framer-motion';
import { Nav } from '../../components/Nav/Nav';
import { TrackItem } from '../../components/Track/Track';
import { useAudioContext } from '../../contexts/AudioContext';
import { useOfflineStorage } from '../../contexts/OfflineStorageContext';
import isMobile from 'is-mobile';
import { useHotKeys } from '../../hooks/useHotKeys';

import { Config } from '../../config';
import { Loader } from '../../components/Loader';
import { Footer } from '../../components/Nav/Footer';
import { Input } from '../../components/inputs/input';
import { handleExport } from '../../lib/offlineRenderer';
import { useEffect, useState } from 'react';
import {
  useSequencer,
  useTrackActions,
  useTrackMetadata,
  useTracks,
} from '../../state';

export function Track({ id }: { id: string }) {
  const actions = useTrackActions();
  const tracks = useTracks();
  const sequencer = useSequencer();
  const { name } = useTrackMetadata();
  const [loaded, setLoaded] = useState(false);

  const { initialize, methods } = useAudioContext();

  //const [mobile] = useState(isMobile());

  // const _controls = useDragControls();

  const { loadProjectFromCache, saveProjectToCache } = useOfflineStorage();

  const save = async (_localName?: string) => {
    if (!sequencer) return;

    await saveProjectToCache(id as string, {
      ...sequencer.exportJSON(),
      name: name,
      updatedAt: new Date().toISOString(),
    });

    // render offline
    await handleExport();
  };

  useEffect(() => {
    async function load() {
      const project = await loadProjectFromCache(id as string);

      console.log('Loaded project from cache:', project);
      actions.changeBpm(project?.bpm || Config.DEFAULT_BPM);
      await initialize(project);
      setLoaded(true);
    }

    if (!id) return;

    load();
  }, [id, loadProjectFromCache, initialize]);

  async function updateName(ev: React.ChangeEvent<HTMLInputElement>) {
    actions.changeName(ev.target.value);
  }

  // allow enter key to blur input
  function handleKeyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.key === 'Enter') {
      if (ev.target) {
        (ev.target as HTMLInputElement).blur();
      }
    }
  }

  function handleBlur() {
    save();
  }

  // all hot-keys require commande
  //useHotKeys({ 'Meta+s': save, 'Ctrl+n': methods.createTrack });

  // unmount effect
  // useEffect(() => {
  //   return () => {
  //     methods.destroy();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  if (!loaded) {
    return <h1>Loading...</h1>;
  }
  return (
    <>
      <Nav save={() => save()}>
        <Input
          placeholder={(name || id) as string}
          defaultValue={name || id}
          onChange={updateName}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          type="text"
          title="Name"
        ></Input>
      </Nav>
      <main>
        <Reorder.Group
          axis="y"
          // @ts-expect-error
          className="edit__area"
          onReorder={methods.reorderTracks}
          values={tracks}
        >
          {tracks.map((rhythm, index) => (
            <TrackItem
              key={rhythm.id}
              rhythm={rhythm}
              index={index}
              mobile={false}
            />
          ))}
        </Reorder.Group>
        <Footer />
      </main>
    </>
  );
}
