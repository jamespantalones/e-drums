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
  SIG_DELAY,
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
import { Config } from '../config';

// a dotted 8th echo, the classic syncopated repeat
const delayTime = (bpm: number) => (60 / bpm) * 0.75;

// 0-100 controls to send gains; echoes at full send sit a bit under the dry hit
const reverbLevel = (value: number) => value / 100;
const delayLevel = (value: number) => (value / 100) * 0.7;

export interface SequencerOpts {
  initialTracks?: SerializedTrack[];
  id: string;
  createdAt?: string;
}

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
  private delayChain: Tone.FeedbackDelay;
  // effect send levels; the dry signal always plays at full level
  private reverbSend: Tone.Gain;
  private delaySend: Tone.Gain;
  private chain!: Tone.Volume;

  private transport!: Transport;

  // the step being scheduled; SIG_TICK follows it on the draw clock
  private step = -1;
  private disposeEffect: () => void;

  constructor(opts: SequencerOpts) {
    this.bpm = SIG_BPM.value;
    this.context = null;
    this.id = opts.id;
    this.name = this.id;
    this.createdAt = opts.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.reverbChain = new Tone.Reverb({ wet: 1 });
    this.delayChain = new Tone.FeedbackDelay({
      delayTime: delayTime(SIG_BPM.value),
      maxDelay: delayTime(Config.MIN_BPM),
      feedback: 0.35,
      wet: 1,
    });
    this.reverbSend = new Tone.Gain(reverbLevel(SIG_REVERB.value));
    this.delaySend = new Tone.Gain(delayLevel(SIG_DELAY.value));
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

    this.disposeEffect = effect(() => {
      if (this.bpm !== SIG_BPM.value) {
        this.setBpm(SIG_BPM.value);
      }

      this.chain.volume.value = SIG_VOLUME.value;
      this.reverbSend.gain.rampTo(reverbLevel(SIG_REVERB.value), 0.05);
      this.delaySend.gain.rampTo(delayLevel(SIG_DELAY.value), 0.05);
    });
  }

  async init() {
    // dry straight out, with reverb and delay added on top as sends;
    // echoes also feed the reverb so they sit in the same room
    this.chain.connect(Tone.Destination);
    this.chain.chain(this.reverbSend, this.reverbChain, Tone.Destination);
    this.chain.chain(this.delaySend, this.delayChain, Tone.Destination);
    this.delayChain.connect(this.reverbSend);

    const trackPromises = SIG_TRACKS.value.map((t) => t.init());
    const resolvedTracks = await Promise.all(trackPromises);

    resolvedTracks.forEach((track) => {
      if (track.isReady) {
        track.sampler.connect(this.chain);
      }
    });
    SIG_TRACKS.value = resolvedTracks;

    SIG_INITIALIZED.value = true;

    return this;
  }

  async start() {
    if (!SIG_INITIALIZED.value) {
      await this.init();
    }

    if (SIG_PLAY_STATE.value === SequencerPlayState.STARTED) {
      return;
    }

    this._setupTransport();

    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }

    Tone.Transport.start();
    SIG_PLAY_STATE.value = SequencerPlayState.STARTED;
  }

  stop() {
    this.transport?.stop();
    if (SIG_PLAY_STATE.value === SequencerPlayState.STARTED) {
      SIG_PLAY_STATE.value = SequencerPlayState.STOPPED;
      return;
    }

    if (SIG_PLAY_STATE.value === SequencerPlayState.STOPPED) {
      SIG_PLAY_STATE.value = SequencerPlayState.STOPPED_AND_RESET;
      this.step = -1;
      SIG_TICK.value = -1;

      return;
    }
  }

  private _setupTransport() {
    this.transport = Tone.Transport;
    this.transport.cancel();

    this.context = Tone.getContext();

    // steps are 16ths, so swing delays every other 16th
    Tone.Transport.swingSubdivision = '16n';
    // later tempo changes arrive through setBpm
    this.setBpm(SIG_BPM.value);

    this.transport?.scheduleRepeat((time) => {
      const step = (this.step += 1);

      Tone.Transport.swing = SIG_SWING.value / 100;

      // this callback runs ahead of the audio; move the playhead
      // when the step is actually heard
      Tone.Draw.schedule(() => {
        SIG_TICK.value = step;
      }, time);

      SIG_TRACKS.value.forEach((track) => {
        const currentTick = step % track.pattern.length;
        if (track.pattern[currentTick] > 0) {
          track.play(time, currentTick);
        }
      });
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
    this.delayChain.delayTime.rampTo(delayTime(val), 0.05);
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
    this.transport?.cancel();
    this.disposeEffect();
    SIG_TRACKS.value.forEach((track) => track.sampler?.dispose());
    this.chain.dispose();
    this.reverbChain.dispose();
    this.delayChain.dispose();
    this.reverbSend.dispose();
    this.delaySend.dispose();
  }

  public exportJSON(): SerializedSequencer {
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
      delay: SIG_DELAY.value,
      name: SIG_NAME.value || this.id,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }
}
