import { Sequencer } from '../lib/Sequencer';
import { Track } from '../lib/Track';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    orient?: string;
  }
}

export type IndexTrack = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackAction =
  | {
      method: 'changeColor';
      value: [number, number, number];
    }
  | {
      method: 'addNote';
      value?: undefined;
    }
  | {
      method: 'removeNote';
      value: number;
    }
  | {
      method: 'changeInstrument';
      value?: SoundFile;
    }
  | { method: 'changeVolume'; value: number }
  | { method: 'changePitch'; value: number }
  | { method: 'setRhythmTicks'; value: number };

export type SequencerAction = {
  method: 'setBpm';
  value: number;
};
export type SoundFile = {
  name: string;
  files: string[];
  defaultFreqRange: [number, number];
};

export type Instrument = {
  sound: SoundFile;
  frequency: number;
};

export type TrackOpts = {
  onNotes?: number;
  totalNotes?: number;
  id?: string;
  pitch?: number;
  color?: [number, number, number];
  hue?: number;
  index: number;
  muted?: boolean;
  volume?: number;
  pattern?: number[];
  pitchOffset?: number[];
  instrument?: Instrument;
  updateSelfInParent: (
    child: Track,
    { needsReconnect }: { needsReconnect?: boolean }
  ) => void;
};

/**
 * Main State
 */
export type AudioContextType = {
  bpm: number;
  name: string | null;
  initialized: boolean;
  playing: boolean;
  stopCount: number;
  tick: number;
  tracks: Track[];
};

export type AudioContextReturnType = {
  state: AudioContextType;
  dispatch: React.Dispatch<AudioContextAction>;
  initialize: (data?: SerializedSequencer) => Promise<Sequencer | null>;
  sequencer: Sequencer | undefined;
  methods: {
    play: () => Promise<void>;
    stop: () => void;
    clear: () => void;
    deleteTrack: (id: string) => void;
    changeBpm: (bpm: number) => void;
    changeName: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    incrementBpm: () => void;
    decrementBpm: () => void;
    createTrack: () => void;
    repitchTick: (
      id: string,
      index: number,
      type: 'INCREMENT' | 'DECREMENT'
    ) => void;
    reorderTracks: (e: any) => void;
    toggleTick: (id: string, index: number) => void;
    setTrackVal: (track: Track, action: TrackAction) => Promise<Track>;
  };
};

export type AudioContextAction =
  | {
      type: 'INITIALIZE';
      value: Track[];
    }
  | {
      type: 'CHANGE_NAME';
      value: string;
    }
  | {
      type: '_PLAY';
    }
  | {
      type: '_STOP';
    }
  | {
      type: 'ADD_TRACK';
      value: Track;
    }
  | {
      type: 'SAVE';
    }
  | {
      type: 'DELETE_TRACK';
      value: string;
    }
  | {
      type: 'INCREMENT_TICK';
      value: number;
    }
  | {
      type: 'SET_BPM';
      value: number;
    }
  | { type: 'DECREMENT_BPM' }
  | { type: 'INCREMENT_BPM' }
  | {
      type: 'UPDATE_TRACKS';
      value: Track[];
    }
  | {
      type: 'UPDATE_TRACK';
      value: Track;
    };

export type SerializedTrack = {
  id: string;
  index: number;
  onNotes: number;
  totalNotes: number;
  pitch: number;
  color?: [number, number, number];
  hue?: number;
  audio?: SoundFile;
};

export type SerializedSequencer = {
  bpm: number;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  state: {
    rhythmIndex: number;
    tracks: SerializedTrack[];
  };
};

export enum SequencerPlayState {
  'STOPPED_AND_RESET',
  'STOPPED',
  'STARTED',
}

export enum SequencerEvents {
  SAVE = 'SAVE',
  ADJUST_TIME_SCALE = 'ADJUST_TIME_SCALE',
  TICK = 'TICK',

  ADD_NEW_RHYTHM = 'ADD_NEW_RHYTHM',

  DECREMENT_BEAT = 'DECREMENT_BEAT',
  DECREMENT_TICK = 'DECREMENT_TICK',

  INCREMENT_BEAT = 'INCREMENT_BEAT',

  INCREMENT_TICK = 'INCREMENT_TICK',

  REMOVE_RHYTHM = 'REMOVE_RHYTHM',

  RHYTHM_CHANGE = 'RHYTHM_CHANGE',
  TOGGLE_TICK = 'TOGGLE_TICK',

  FREQUENCY_CHANGE = 'FREQUENCY_CHANGE',
}