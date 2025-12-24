import { create, createStore, useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Config } from '../config';
import { Sequence } from 'tone';
import { SequencerPlayState, SerializedTrack } from '../types';
import { Sequencer } from '../lib/Sequencer';
import { Track } from '../lib/Track';

export type TrackState = {
  bpm: number;
  initialized: boolean;
  name: string;
  playState: SequencerPlayState;
  reverb: number;
  sequencer: Sequencer | null;
  serializedTracks: SerializedTrack[];
  swing: number;
  tick: number;
  tracks: Track[];
  volume: number;
};

export type TrackAction = {
  changeBpm: (bpm: number) => void;
  changeName: (name: string) => void;
  destroy: () => void;
  changeReverb: (reverb: number) => void;
  changeVolume: (volume: number) => void;
  changeSwing: (swing: number) => void;
  setInitialized: (initialized: boolean) => void;
  setSequencer: (sequencer: Sequencer | null) => void;
  setPlayState: (playState: SequencerPlayState) => void;
  setTick: (tick: number) => void;
  setSerializedTracks: (serializedTracks: SerializedTrack[]) => void;
  setTracks: (tracks: Track[]) => void;
};

export const store = createStore<TrackState & { action: TrackAction }>(
  (set) => ({
    bpm: Config.DEFAULT_BPM,
    initialized: false,
    swing: 0,
    name: '',
    playState: SequencerPlayState.STOPPED_AND_RESET,
    reverb: Config.MIN_REVERB,
    sequencer: null,
    serializedTracks: [],
    tick: -1,
    tracks: [],
    volume: Config.DEFAULT_VOLUME,
    bears: 0,
    action: {
      changeBpm: (bpm: number) => set({ bpm }),
      changeName: (name: string) => set({ name }),
      changeReverb: (reverb: number) => set({ reverb }),
      changeVolume: (volume: number) => set({ volume }),
      changeSwing: (swing: number) => set({ swing }),
      setInitialized: (initialized: boolean) => set({ initialized }),
      setSequencer: (sequencer: Sequencer | null) => set({ sequencer }),
      setPlayState: (playState: SequencerPlayState) => set({ playState }),
      setTick: (tick: number) => set({ tick }),
      setSerializedTracks: (serializedTracks: SerializedTrack[]) =>
        set({ serializedTracks }),
      setTracks: (tracks: Track[]) => set({ tracks }),
      destroy: () =>
        set((state) => ({
          bpm: 0,
          swing: 0,
          initialized: false,
          name: '',
          volume: Config.DEFAULT_VOLUME,
          playState: SequencerPlayState.STOPPED_AND_RESET,
          tick: -1,
          serializedTracks: [],
          tracks: [],
          reverb: Config.MIN_REVERB,
        })),
    },
  })
);

export function useTrackActions() {
  return useStore(store, (state) => state.action);
}

export function useTracks() {
  return useStore(store, (state) => state.tracks);
}

export function useSequencer() {
  return useStore(store, (state) => state.sequencer);
}

export function useTrackMetadata() {
  return useStore(
    store,
    useShallow((state) => ({
      name: state.name,
      bpm: state.bpm,
      reverb: state.reverb,
      swing: state.swing,
      volume: state.volume,
      playState: state.playState,
      initialized: state.initialized,
    }))
  );
}

export function useTick() {
  return useStore(store, (state) => state.tick);
}
