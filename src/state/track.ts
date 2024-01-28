// Track specific state

import { signal } from '@preact/signals-react';
import { Config } from '../config';
import { SequencerPlayState, SerializedTrack } from '../types';
import { Track } from '../lib/Track';
import { Sequencer } from '../lib/Sequencer';

export const state = {
  SIG_BPM: signal<number>(Config.DEFAULT_BPM),
  SIG_SWING: signal<number>(0),
  SIG_INITIALIZED: signal<boolean>(false),
  SIG_NAME: signal<string>(''),
  SIG_VOLUME: signal<number>(Config.DEFAULT_VOLUME),
  SIG_PLAY_STATE: signal<SequencerPlayState>(
    SequencerPlayState.STOPPED_AND_RESET
  ),
  SIG_REVERB: signal<number>(Config.MIN_REVERB),
  SIG_SEQUENCER: signal<Sequencer | null>(null),
  SIG_TICK: signal<number>(-1),
  SIG_SERIALIZED_TRACKS: signal<SerializedTrack[]>([]),
  SIG_TRACKS: signal<Track[]>([]),
};

export const destroy = () => {
  state.SIG_BPM.value = 0;
  state.SIG_SWING.value = 0;
  state.SIG_INITIALIZED.value = false;
  state.SIG_NAME.value = '';
  state.SIG_VOLUME.value = Config.DEFAULT_VOLUME;
  state.SIG_PLAY_STATE.value = SequencerPlayState.STOPPED_AND_RESET;
  state.SIG_TICK.value = -1;
  state.SIG_SERIALIZED_TRACKS.value = [];
  state.SIG_TRACKS.value = [];
  state.SIG_REVERB.value = Config.MIN_REVERB;
};

export const {
  SIG_BPM,
  SIG_SWING,
  SIG_VOLUME,
  SIG_REVERB,
  SIG_INITIALIZED,
  SIG_NAME,
  SIG_PLAY_STATE,
  SIG_SEQUENCER,
  SIG_SERIALIZED_TRACKS,
  SIG_TICK,
  SIG_TRACKS,
} = state;
