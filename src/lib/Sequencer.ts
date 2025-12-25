import * as Tone from 'tone';
import { Transport } from 'tone/build/esm/core/clock/Transport';
import {
  SequencerPlayState,
  SerializedSequencer,
  SerializedTrack,
} from '../types';
import { Track } from './Track';
import { store } from '../state';

const { getState, setState } = store;

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

  // new
  constructor(opts: SequencerOpts) {
    this.bpm = getState().bpm;
    this.context = null;
    this.id = opts.id;
    // set initial name to the track id
    this.name = this.id;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.reverbChain = new Tone.Reverb();
    this.chain = new Tone.Volume(getState().volume);
    this.swing = getState().swing / 100;
    this.reverb = 0;

    store.getState().tracks = (getState().serializedTracks || []).map(
      (track) => {
        return new Track({
          ...track,
          updateSelfInParent: this.updateChild,
        });
      }
    );

    setState({ tick: -1 });

    const unsubscribe = store.subscribe((state, oldState) => {
      if (this.bpm !== state.bpm) {
        this.setBpm(state.bpm);
      }

      this.chain.volume.value = state.volume;
      this.reverbChain.wet.value = state.reverb / 100;
    });
  }

  async init() {
    this.reverbChain.wet.value = getState().reverb / 100;
    // this.reverb.decay = '1';

    this.chain.chain(this.reverbChain, Tone.Destination);

    console.log('sequencer init');

    // load all initial tracks
    const trackPromises = getState().tracks.map((t) => t.init());
    const resolvedTracks = await Promise.all(trackPromises);

    console.log('track promises resolved', resolvedTracks, trackPromises);

    // loop through each resolved track and connect to chain
    resolvedTracks.forEach((track) => {
      if (track.isReady) {
        track.sampler.connect(this.chain);
      }
    });

    setState({ tracks: resolvedTracks });
    setState({ initialized: true });

    // for each track, create it

    return this;
  }

  async start() {
    console.log('sequencer start called', getState().initialized);

    if (!getState().initialized) {
      await this.init();
    }

    if (getState().playState === SequencerPlayState.STARTED) {
      return;
    }

    // if transport hasn't been set up.. set it up
    this._setupTransport();

    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }

    Tone.Transport.start();

    setState((s) => ({ ...s, playState: SequencerPlayState.STARTED }));
  }

  // stop the transport
  stop() {
    this.transport?.stop();
    if (getState().playState === SequencerPlayState.STARTED) {
      setState({ playState: SequencerPlayState.STOPPED });
      return;
    }

    if (getState().playState === SequencerPlayState.STOPPED) {
      setState({ playState: SequencerPlayState.STOPPED_AND_RESET });
      // rewind everything
      setState({ tick: -1 });

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
      setState({ tick: getState().tick + 1 });

      Tone.Transport.swingSubdivision = '16t';
      Tone.Transport.swing = getState().swing / 100;
      Tone.Transport.bpm.value = getState().bpm;
      // TODO: check
      Tone.Draw.anticipation = 0.23;

      // IMPORTANT: any UI updates need to be called
      // here to not block main thread
      Tone.Draw.schedule(() => {
        //setState({ tick: getState().tick });
        // call the current tick increment
        // SIG_TICK.value = this.state.rhythmIndex;
        // this.onTick(this.state.rhythmIndex);
      }, time);

      // get the next index
      let nextIndex = getState().tick + 1;

      getState().tracks.forEach((track) => {
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
    if (!getState().initialized) {
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
    setState({ tracks: [...getState().tracks, nextTrack] });
    setState({
      serializedTracks: [
        ...getState().serializedTracks,
        nextTrack.exportJSON(),
      ],
    });

    return nextTrack;
  }

  public repitchTick(
    id: string,
    index: number,
    type: 'INCREMENT' | 'DECREMENT'
  ) {
    setState((s) => {
      let rhythmTarget: Track | undefined = undefined;
      const updatedTracks = s.tracks.map((rhythm) => {
        // if we have a target
        if (rhythm.id === id) {
          const track = rhythm.repitchNote(index, type);
          rhythmTarget = track;
          return track;
        }
        return rhythm;
      });
      return {
        ...s,
        tracks: updatedTracks,
      };
    });
    const updatedTracks = getState().tracks;
    const rhythmTarget = updatedTracks.find((t) => t.id === id);
    return [rhythmTarget, updatedTracks];
  }

  public toggleTick(id: string, index: number): [Track | undefined, Track[]] {
    setState((s) => {
      let rhythmTarget: Track | undefined = undefined;
      const updatedTracks = s.tracks.map((rhythm) => {
        // if we have a target
        if (rhythm.id === id) {
          const track = rhythm.toggleNote(index);
          rhythmTarget = track;
          return track;
        }
        return rhythm;
      });
      return {
        ...s,
        tracks: updatedTracks,
      };
    });
    const updatedTracks = getState().tracks;
    const rhythmTarget = updatedTracks.find((t) => t.id === id);
    return [rhythmTarget, updatedTracks];
  }

  private setBpm(val: number) {
    this.bpm = val;
    if (this.transport) {
      this.transport.bpm.value = val;
    }
  }

  public clearSolos() {
    setState((s) => ({
      ...s,
      tracks: s.tracks.map((t) => t.clearSolo()),
    }));
  }

  public clear() {
    setState((s) => ({
      ...s,
      tracks: s.tracks.map((t) => t.noteOff()),
    }));
  }

  public updateTracks(tracks: Track[]) {
    setState((s) => ({
      ...s,
      tracks,
      serializedTracks: tracks.map((t) => t.exportJSON()),
    }));
  }

  updateChild = (
    child: Track,
    { needsReconnect }: { needsReconnect?: boolean }
  ) => {
    setState((s) => {
      return {
        ...s,
        tracks: s.tracks.map((track) => {
          if (track.id === child.id) {
            if (needsReconnect) {
              child.sampler.connect(this.chain);
            }
            return child;
          }
          return track;
        }),
      };
    });
  };

  public deleteTrack(id: string): [string, Track[]] {
    setState((s) => ({
      ...s,
      tracks: s.tracks.filter((r) => r.id !== id),
      serializedTracks: s.serializedTracks.filter((r) => r.id !== id),
    }));
    return [id, getState().tracks];
  }

  public destroy() {
    this.transport?.stop();
  }

  public exportJSON(): SerializedSequencer {
    // update timestamp for save

    const { tick, tracks, bpm, volume, swing, reverb, name } = getState();

    return {
      id: this.id,
      state: {
        rhythmIndex: tick,
        tracks: tracks.map((t) => t.exportJSON()),
      },
      bpm,
      volume,
      swing,
      reverb,
      name: name || this.id,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }
}
