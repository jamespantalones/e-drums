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
import { useTrackStore } from '../state';

/**
 * Main goal of this AudioContext is
 * to provide singular set of UI operation
 * which in turn, update the underlying audio sequencer
 */
const AudioContext = createContext<AudioContextReturnType | undefined>(
  undefined
);

export function AudioContextProvider({ children }: { children: ReactNode }) {
  const actions = useTrackStore((state) => state.action);
  const tracks = useTrackStore((state) => state.tracks);
  const sequencer = useTrackStore((state) => state.sequencer);
  const bpm = useTrackStore((state) => state.bpm);

  function changeName(ev: React.ChangeEvent<HTMLInputElement>) {
    actions.changeName(ev.target.value);
  }

  // make sure the AudioContext is initialized
  const initialize = useCallback(async (data?: SerializedSequencer) => {
    try {
      // if pulling from offline storage
      if (data) {
        // set all values here
        actions.changeBpm(data.bpm);
        actions.changeName(data.name);
        actions.changeReverb(data.reverb);
        actions.changeVolume(data.volume);
        actions.changeSwing(data.swing);
        actions.setSerializedTracks(data.state.tracks);
        actions.setSequencer(
          new Sequencer({
            ...data,
            // TODO Fix
            id: data.id,
          })
        );
      }
      // otherwise, create a new track
      else {
        throw new Error('No data passed');
      }

      await sequencer?.init();
      actions.setInitialized(true);
    } catch (err) {
      console.log(err);
      return null;
    }
  }, []);

  /**
   * Starts playback
   */
  const play = useCallback(async () => {
    // start the AudioContext engine (on user interactive only)
    sequencer?.start();
  }, []);

  /**
   * Stops playback
   */
  const stop = useCallback(async () => {
    // call stop on the sequencer
    sequencer?.stop();
  }, []);

  const destroy = useCallback(() => {
    sequencer?.destroy();
    actions.setSequencer(null);
  }, []);

  const createTrack = useCallback(async () => {
    // add to Sequencer
    await sequencer?.addNewRhythm(generateTrack(tracks.length));
  }, [tracks.length]);

  const repitchTick = useCallback(
    (id: string, index: number, type: 'INCREMENT' | 'DECREMENT') => {
      sequencer?.repitchTick(id, index, type);
    },
    []
  );

  const toggleTick = useCallback((id: string, index: number) => {
    sequencer?.toggleTick(id, index);
  }, []);

  const setTrackVal = useCallback(
    async (track: Track, action: TrackAction): Promise<Track> => {
      if (!track[action.method]) {
        throw new Error(`${action.method} not implemented on Track`);
      }
      const v = await track[action.method](action.value as any);
      return v;
    },
    []
  );

  const clear = useCallback(() => {
    sequencer?.clear();
  }, []);

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

  const deleteTrack = useCallback((id: string) => {
    sequencer?.deleteTrack(id);
  }, []);

  const reorderTracks = useCallback((tracks: Track[]) => {
    // send copy to sequencer for serialization on save
    sequencer?.updateTracks(tracks);
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
      repitchTick,
      toggleTick,
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
      `useAudioContext must be used within an AudioContextProvider`
    );
  }

  return context;
}
