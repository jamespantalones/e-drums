'use client';

import { Sequencer } from '../lib/Sequencer';
import { Track } from '../lib/Track';

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
} from 'react';
import { generateTrack } from '../lib/utils';
import { Config } from '../config';
import {
  useSequencer,
  useTrackActions,
  useTrackMetadata,
  useTracks,
} from '../state';

/**
 * Main goal of this AudioContext is
 * to provide singular set of UI operation
 * which in turn, update the underlying audio sequencer
 */
const AudioContext = createContext<AudioContextReturnType | undefined>(
  undefined,
);

export function AudioContextProvider({ children }: { children: ReactNode }) {
  const actions = useTrackActions();
  const tracks = useTracks();
  const sequencer = useSequencer();
  const { bpm } = useTrackMetadata();

  function changeName(ev: React.ChangeEvent<HTMLInputElement>) {
    actions.changeName(ev.target.value);
  }

  // make sure the AudioContext is initialized
  const initialize = useCallback(
    async (data?: SerializedSequencer) => {
      try {
        let localSequencer: Sequencer | null = sequencer;
        // if pulling from offline storage
        if (data) {
          // set all values here
          actions.changeBpm(data.bpm);
          actions.changeName(data.name);
          actions.changeReverb(data.reverb);
          actions.changeVolume(data.volume);
          actions.changeSwing(data.swing);
          actions.setSerializedTracks(data.state.tracks);

          localSequencer = new Sequencer({
            ...data,
            // TODO Fix
            id: data.id,
          });

          // sequencer exists here...
          console.log('set', localSequencer, actions);
        }
        // otherwise, create a new track
        else {
          throw new Error('No data passed');
        }

        await localSequencer?.init();
        actions.setInitialized(true);
        actions.setSequencer(localSequencer);
      } catch (err) {
        console.log(err);
        return null;
      }
    },
    [actions, sequencer],
  );

  /**
   * Starts playback
   */
  const play = useCallback(async () => {
    // start the AudioContext engine (on user interactive only)
    sequencer?.start();
    console.log('seq', sequencer);
  }, [sequencer]);

  /**
   * Stops playback
   */
  const stop = useCallback(async () => {
    // call stop on the sequencer
    sequencer?.stop();
  }, [sequencer]);

  const destroy = useCallback(() => {
    sequencer?.destroy();
    actions.setSequencer(null);
  }, [sequencer, actions]);

  const createTrack = useCallback(async () => {
    // add to Sequencer
    await sequencer?.addNewRhythm(generateTrack(tracks.length));
  }, [tracks.length, sequencer]);

  const repitchTick = useCallback(
    (id: string, index: number, type: 'INCREMENT' | 'DECREMENT') => {
      sequencer?.repitchTick(id, index, type);
    },
    [sequencer],
  );

  const toggleTick = useCallback(
    (id: string, index: number) => {
      sequencer?.toggleTick(id, index);
    },
    [sequencer],
  );

  const setTrackVal = useCallback(
    async (track: Track, action: TrackAction): Promise<Track> => {
      if (!track[action.method]) {
        throw new Error(`${action.method} not implemented on Track`);
      }
      const v = await track[action.method](action.value as any);
      return v;
    },
    [],
  );

  const clear = useCallback(() => {
    sequencer?.clear();
  }, [sequencer]);

  const decrementBpm = useCallback(() => {
    const curr = bpm;
    if (curr - 1 >= Config.MIN_BPM) {
      actions.changeBpm(curr - 1);
    }
  }, [bpm, actions]);

  const incrementBpm = useCallback(() => {
    const curr = bpm;
    if (curr + 1 <= Config.MAX_BPM) {
      actions.changeBpm(curr + 1);
    }
  }, [bpm, actions]);

  const deleteTrack = useCallback(
    (id: string) => {
      sequencer?.deleteTrack(id);
    },
    [sequencer],
  );

  const reorderTracks = useCallback(
    (tracks: Track[]) => {
      // send copy to sequencer for serialization on save
      sequencer?.updateTracks(tracks);
    },
    [sequencer],
  );

  function setTracks(serializedTracks: SerializedSequencer['state']['tracks']) {
    actions.setSerializedTracks(serializedTracks);
  }

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
      repitchTick,
      toggleTick,
      setTracks,
      setTrackVal,
    },
  };

  const start = useCallback(async () => {
    await Tone.start();
    document.querySelector('button')?.removeEventListener('click', start);
  }, []);

  useEffect(() => {
    return () => {
      document.querySelector('button')?.removeEventListener('click', start);
    };
  }, [start]);

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
