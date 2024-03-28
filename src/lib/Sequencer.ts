import * as Tone from 'tone';
import { Transport } from 'tone/build/esm/core/clock/Transport';
import {
  SequencerPlayState,
  SerializedSequencer,
  SerializedTrack,
} from '../types';
import { Track } from './Track';
import { effect } from '@preact/signals-react';
import {
  SIG_BPM,
  SIG_INITIALIZED,
  SIG_NAME,
  SIG_PLAY_STATE,
  SIG_REVERB,
  SIG_SERIALIZED_TRACKS,
  SIG_SWING,
  SIG_TICK,
  SIG_TRACKS,
  SIG_VOLUME,
} from '../state/track';

export interface SequencerOpts {
  initialTracks?: SerializedTrack[];
  id: string;
}

// ------------------------------------------------------------
// Sequencer Class
// ------------------------------------------------------------
export class Sequencer {
  public context: Tone.BaseContext | null;
  public name: string | null;
  public bpm: number;
  public createdAt: string;
  public updatedAt: string;
  public swing: number;
  public id: string;
  public reverb: number;

  private reverbChain: Tone.Reverb;
  private chain!: Tone.Volume;

  private transport!: Transport;

  constructor(opts: SequencerOpts) {
    this.bpm = SIG_BPM.value;
    this.context = null;
    this.id = opts.id;
    // set initial name to the track id
    this.name = this.id;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.reverbChain = new Tone.Reverb();
    this.chain = new Tone.Volume(SIG_VOLUME.value);
    this.swing = SIG_SWING.value / 100;
    this.reverb = 0;

    SIG_TRACKS.value = (SIG_SERIALIZED_TRACKS.value || []).map((track) => {
      return new Track({
        ...track,
        updateSelfInParent: this.updateChild,
      });
    });

    SIG_TICK.value = -1;

    // listen fsor signal changes
    effect(() => {
      if (this.bpm !== SIG_BPM.value) {
        this.setBpm(SIG_BPM.value);
      }

      this.chain.volume.value = SIG_VOLUME.value;
      this.reverbChain.wet.value = SIG_REVERB.value / 100;
    });
  }

  async init() {
    this.reverbChain.wet.value = SIG_REVERB.value / 100;
    // this.reverb.decay = '1';

    this.chain.chain(this.reverbChain, Tone.Destination);

    // load all initial tracks
    const trackPromises = SIG_TRACKS.value.map((t) => t.init());
    const resolvedTracks = await Promise.all(trackPromises);

    // loop through each resolved track and connect to chain
    resolvedTracks.forEach((track) => {
      if (track.isReady) {
        track.sampler.connect(this.chain);
      }
    });
    SIG_TRACKS.value = resolvedTracks;

    SIG_INITIALIZED.value = true;

    // for each track, create it

    return this;
  }

  async start() {
    if (!SIG_INITIALIZED.value) {
      await this.init();
    }

    if (SIG_PLAY_STATE.value === SequencerPlayState.STARTED) {
      return;
    }

    // if transport hasn't been set up.. set it up
    this._setupTransport();

    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }

    Tone.Transport.start();
    SIG_PLAY_STATE.value = SequencerPlayState.STARTED;

    console.log('START');
  }

  // stop the transport
  stop() {
    this.transport?.stop();
    if (SIG_PLAY_STATE.value === SequencerPlayState.STARTED) {
      SIG_PLAY_STATE.value = SequencerPlayState.STOPPED;
      return;
    }

    if (SIG_PLAY_STATE.value === SequencerPlayState.STOPPED) {
      SIG_PLAY_STATE.value = SequencerPlayState.STOPPED_AND_RESET;
      // rewind everything
      SIG_TICK.value = -1;

      return;
    }
  }

  private _setupTransport() {
    this.transport = Tone.Transport;
    this.transport.cancel();

    this.context = Tone.getContext();

    // ************************************************************
    // main loop
    // ************************************************************
    // on every 16th note...
    this.transport?.scheduleRepeat((time) => {
      // increment rhythm index
      SIG_TICK.value += 1;

      Tone.Transport.swingSubdivision = '16t';
      Tone.Transport.swing = SIG_SWING.value / 100;
      Tone.Transport.bpm.value = SIG_BPM.value;

      // TODO: check
      Tone.Draw.anticipation = 0.23;

      // IMPORTANT: any UI updates need to be called
      // here to not block main thread
      Tone.Draw.schedule(() => {
        // call the current tick increment
        // SIG_TICK.value = this.state.rhythmIndex;
        // this.onTick(this.state.rhythmIndex);
      }, time);

      // get the next index
      let nextIndex = SIG_TICK.value + 1;

      SIG_TRACKS.value.forEach((track) => {
        const currentTick = nextIndex % track.pattern.length;
        if (track.pattern[currentTick] > 0) {
          // normal time
          track.play(time, currentTick);
        }
      });

      // use the callback time to schedule events
    }, '16n');
  }

  public async addNewRhythm(rhythm: SerializedTrack): Promise<Track> {
    if (!SIG_INITIALIZED.value) {
      await this.init();
    }

    const nextTrack = new Track({
      ...rhythm,
      updateSelfInParent: this.updateChild,
    });

    await nextTrack.init();

    if (nextTrack.isReady) {
      nextTrack.sampler.connect(this.chain);
    }

    // update in state
    SIG_TRACKS.value = [...SIG_TRACKS.value, nextTrack];
    SIG_SERIALIZED_TRACKS.value = [
      ...SIG_SERIALIZED_TRACKS.value,
      nextTrack.exportJSON(),
    ];

    return nextTrack;
  }

  public repitchTick(
    id: string,
    index: number,
    type: 'INCREMENT' | 'DECREMENT'
  ) {
    let rhythmTarget: Track | undefined = undefined;

    SIG_TRACKS.value = SIG_TRACKS.value.map((rhythm) => {
      // if we have a target
      if (rhythm.id === id) {
        const track = rhythm.repitchNote(index, type);
        rhythmTarget = track;
        return track;
      }

      return rhythm;
    });

    return [rhythmTarget, SIG_TRACKS.value];
  }

  public toggleTick(id: string, index: number): [Track | undefined, Track[]] {
    let rhythmTarget: Track | undefined = undefined;

    SIG_TRACKS.value = SIG_TRACKS.value.map((rhythm) => {
      // if we have a target
      if (rhythm.id === id) {
        const track = rhythm.toggleNote(index);
        rhythmTarget = track;
        return track;
      }

      return rhythm;
    });

    return [rhythmTarget, SIG_TRACKS.value];
  }

  private setBpm(val: number) {
    this.bpm = val;
    if (this.transport) {
      this.transport.bpm.value = val;
    }
  }

  public clearSolos() {
    SIG_TRACKS.value = SIG_TRACKS.value.map((t) => t.clearSolo());
  }

  public clear() {
    SIG_TRACKS.value = SIG_TRACKS.value.map((t) => t.noteOff());
  }

  public updateTracks(tracks: Track[]) {
    SIG_TRACKS.value = tracks;
    SIG_SERIALIZED_TRACKS.value = tracks.map((t) => t.exportJSON());
  }

  updateChild = (
    child: Track,
    { needsReconnect }: { needsReconnect?: boolean }
  ) => {
    SIG_TRACKS.value = SIG_TRACKS.value.map((track) => {
      if (track.id === child.id) {
        if (needsReconnect) {
          child.sampler.connect(this.chain);
        }
        return child;
      }
      return track;
    });
  };

  public deleteTrack(id: string): [string, Track[]] {
    SIG_TRACKS.value = SIG_TRACKS.value.filter((r) => r.id !== id);
    return [id, SIG_TRACKS.value];
  }

  public destroy() {
    this.transport?.stop();
  }

  public exportJSON(): SerializedSequencer {
    // update timestamp for save

    return {
      id: this.id,
      state: {
        rhythmIndex: SIG_TICK.value,
        tracks: SIG_TRACKS.value.map((t) => t.exportJSON()),
      },
      bpm: SIG_BPM.value,
      volume: SIG_VOLUME.value,
      swing: SIG_SWING.value,
      reverb: SIG_REVERB.value,
      name: SIG_NAME.value || this.id,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }
}
