import type { NextPage } from 'next';
import * as React from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { Reorder, useDragControls } from 'framer-motion';
import { Nav } from '../components/Nav/Nav';
import { TrackItem } from '../components/Track/Track';
import { useAudioContext } from '../contexts/AudioContext';
import { useOfflineStorage } from '../contexts/OfflineStorageContext';
import { useRouter } from 'next/router';
import isMobile from 'is-mobile';
import { useHotKeys } from '../hooks/useHotKeys';
import { useAutosave } from '../hooks/useAutosave';
import { SIG_BPM, SIG_NAME, SIG_SEQUENCER, SIG_TRACKS } from '../state/track';
import { Config } from '../config';
import { Loader } from 'lucide-react';
import { Footer } from '../components/Nav/Footer';
import { Input } from '../components/inputs/input';
import Link from 'next/link';
import { PixelText } from '../components/Logo/Logo';
import { loadUiPrefs } from '../state/ui';

const Track: NextPage = () => {
  useSignals();
  const [loaded, setLoaded] = React.useState(false);
  const [missing, setMissing] = React.useState(false);

  const {
    query: { id },
  } = useRouter();

  const { initialize, methods } = useAudioContext();

  const [mobile] = React.useState(isMobile());

  const _controls = useDragControls();

  const { loadProjectFromCache, saveProjectToCache } = useOfflineStorage();

  const save = async (_localName?: string) => {
    if (!SIG_SEQUENCER.value) return;

    await saveProjectToCache(id as string, {
      ...SIG_SEQUENCER.value.exportJSON(),
      name: SIG_NAME.value,
      updatedAt: new Date().toISOString(),
    });
  };

  React.useEffect(loadUiPrefs, []);

  React.useEffect(() => {
    async function load() {
      const project = await loadProjectFromCache(id as string);
      if (!project) {
        setMissing(true);
        return;
      }
      SIG_BPM.value = project?.bpm || Config.DEFAULT_BPM;
      await initialize(project);
      setLoaded(true);
    }

    if (!id) return;

    load();
  }, [id, loadProjectFromCache, initialize]);

  async function updateName(ev: React.ChangeEvent<HTMLInputElement>) {
    SIG_NAME.value = ev.target.value;
  }

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

  useHotKeys({ 'Meta+s': save, 'Ctrl+n': methods.createTrack });

  // declared before the unmount effect so its final save runs first,
  // while the sequencer state still exists
  useAutosave(save, loaded);

  React.useEffect(() => {
    return () => {
      methods.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (missing) {
    return (
      <main className="full-bleed min-h-screen bg-black text-white">
        <p className="border-b-4 border-white p-4 md:p-6 text-3xl md:text-5xl leading-none">
          No saved sequence called {id}. It may have been deleted, or saved
          in another browser.
        </p>
        <Link
          href="/"
          className="inline-block p-4 md:p-6 hover:bg-white hover:text-black"
        >
          <PixelText text="Back" label="Back" className="h-5 md:h-7 w-auto" />
        </Link>
      </main>
    );
  }

  if (!loaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Loader />
        </div>
      </div>
    );
  }
  return (
    <>
      <Nav save={() => save()}>
        <Input
          placeholder={(SIG_NAME.value || id) as string}
          value={SIG_NAME.value}
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
          className="edit__area"
          onReorder={methods.reorderTracks}
          values={SIG_TRACKS.value}
        >
          {SIG_TRACKS.value.map((rhythm, index) => (
            <TrackItem
              key={rhythm.id}
              rhythm={rhythm}
              index={index}
              mobile={mobile}
            />
          ))}
        </Reorder.Group>
        <Footer />
      </main>
    </>
  );
};

export default Track;
