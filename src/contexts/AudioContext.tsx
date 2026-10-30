import { Sequencer } from '../lib/Sequencer';
import { Track } from '../lib/Track';
import {
  SIG_DELAY,
  SIG_REVERB,
  SIG_SWING,
  SIG_VOLUME,
  destroy as destroySignals,
  markChanged,
} from '../state/track';
import { batch } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import {
  AudioContextReturnType,
  SerializedSequencer,
  TrackAction,
} from '../types';
import * as Tone from 'tone';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { generateTrack } from '../lib/utils';
import { Config } from '../config';
import {
  SIG_BPM,
  SIG_INITIALIZED,
  SIG_NAME,
  SIG_SEQUENCER,
  SIG_SERIALIZED_TRACKS,
  SIG_TRACKS,
} from '../state/track';

const AudioContext = createContext<AudioContextReturnType | undefined>(
  undefined,
);

export function AudioContextProvider({ children }: { children: ReactNode }) {
  useSignals();

  function changeName(ev: React.ChangeEvent<HTMLInputElement>) {
    SIG_NAME.value = ev.target.value;
  }

  const initialize = useCallback(async (data?: SerializedSequencer) => {
    try {
      if (data) {
        batch(() => {
          SIG_BPM.value = data.bpm;
          SIG_NAME.value = data.name;
          SIG_REVERB.value = data.reverb;
          SIG_DELAY.value = data.delay ?? 0;
          SIG_VOLUME.value = data.volume;
          SIG_SWING.value = data.swing;
          SIG_SERIALIZED_TRACKS.value = data.state.tracks;
          SIG_SEQUENCER.value = new Sequencer({
            ...data,
            id: data.id,
          });
        });
      } else {
        throw new Error('No data passed');
      }

      await SIG_SEQUENCER.value?.init();

      SIG_INITIALIZED.value = true;
    } catch (err) {
      console.log(err);
      return null;
    }
  }, []);

  const play = useCallback(async () => {
    // start the AudioContext engine (on user interactive only)
    SIG_SEQUENCER.value?.start();
  }, []);

  const stop = useCallback(async () => {
    SIG_SEQUENCER.value?.stop();
  }, []);

  const destroy = useCallback(() => {
    SIG_SEQUENCER.value?.destroy();
    SIG_SEQUENCER.value = null;
    destroySignals();
  }, []);

  // newest last; tracks can be reordered, so their position doesn't say
  const added = useRef<string[]>([]);

  const createTrack = useCallback(async () => {
    const track = await SIG_SEQUENCER.value?.addNewRhythm(
      generateTrack(
        SIG_TRACKS.value.length,
        SIG_TRACKS.value.flatMap((t) => t.instrument?.sound.name ?? []),
      ),
    );
    if (track) added.current.push(track.id);
  }, []);

  // the newest track added this session, else the bottom one
  const removeLastTrack = useCallback(() => {
    const ids = new Set(SIG_TRACKS.value.map((t) => t.id));
    added.current = added.current.filter((id) => ids.has(id));
    const id = added.current.pop() ?? SIG_TRACKS.value.at(-1)?.id;
    if (id) SIG_SEQUENCER.value?.deleteTrack(id);
  }, []);

  const repitchTick = useCallback(
    (id: string, index: number, type: 'INCREMENT' | 'DECREMENT') => {
      SIG_SEQUENCER.value?.repitchTick(id, index, type);
    },
    [],
  );

  const toggleTick = useCallback((id: string, index: number) => {
    SIG_SEQUENCER.value?.toggleTick(id, index);
  }, []);

  const setTrackVal = useCallback(
    async (track: Track, action: TrackAction): Promise<Track> => {
      if (!track[action.method]) {
        throw new Error(`${action.method} not implemented on Track`);
      }
      const v = await track[action.method](action.value as any);
      markChanged();
      return v;
    },
    [],
  );

  const clear = useCallback(() => {
    SIG_SEQUENCER.value?.clear();
  }, []);

  const decrementBpm = useCallback(() => {
    const curr = SIG_BPM.value;
    if (curr - 1 >= Config.MIN_BPM) {
      SIG_BPM.value--;
    }
  }, []);

  const incrementBpm = useCallback(() => {
    SIG_BPM.value++;
    const curr = SIG_BPM.value;
    if (curr + 1 <= Config.MAX_BPM) {
      SIG_BPM.value++;
    }
  }, []);

  const deleteTrack = useCallback((id: string) => {
    SIG_SEQUENCER.value?.deleteTrack(id);
  }, []);

  const reorderTracks = useCallback((tracks: Track[]) => {
    // send copy to sequencer for serialization on save
    SIG_SEQUENCER.value?.updateTracks(tracks);
  }, []);

  const value = {
    initialize,
    methods: {
      deleteTrack,
      reorderTracks,
      changeName,
      destroy,
      play,
      stop,
      clear,
      incrementBpm,
      decrementBpm,
      createTrack,
      removeLastTrack,
      repitchTick,
      toggleTick,
      setTrackVal,
    },
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);

  if (context === undefined) {
    throw new Error(
      `useAudioContext must be used within an AudioContextProvider`,
    );
  }

  return context;
}
