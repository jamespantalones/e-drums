import * as Tone from 'tone';
import { Config, SOUNDS, publicUrl } from '../config';
import { Instrument, SoundFile, TrackOpts } from '../types';
import { generateId } from '../utils';

import {
  createAsyncSampler,
  euclideanRhythm,
  generateRandomColor,
} from './utils';
// maps the 0-100 volume control to sampler velocity 0-4
export const volumeScale = (volume: number) => (volume / 100) * 4;

export class Track {
  public color: [number, number, number];

  public soloed: boolean;

  public index: number;

  public hue: number;
  public onNotes: number;

  public totalNotes: number;

  public pitch: number;

  public volume: number;

  public prevVolume: number;

  public id: string;

  public muted: boolean;

  public sampler!: Tone.Sampler;

  public pattern: number[];
  public pitchOffset: number[];

  public isReady: boolean;

  public instrument: Instrument | null;

  public updateSelfInParent: (
    child: Track,
    { needsReconnect }: { needsReconnect?: true }
  ) => void;

  constructor(opts: TrackOpts) {
    const [hue, saturation, lightness] = generateRandomColor();
    this.index = opts.index;
    this.id = opts.id || generateId();
    this.updateSelfInParent = opts.updateSelfInParent;
    this.onNotes = opts.onNotes || 4;
    this.totalNotes = opts.totalNotes || 8;
    this.isReady = false;
    this.instrument = opts.instrument || null;
    this.color = opts.color || [hue, saturation, lightness];
    this.hue = opts.hue || hue;
    this.volume = opts.volume || 30;
    this.prevVolume = this.volume;
    this.pitch = opts.pitch || 50;
    this.muted = opts.muted || false;
    this.pattern = opts.pattern || [];
    this.pitchOffset = opts.pitchOffset || [];
    this.soloed = false;

    if (!opts.pattern) {
      const { pattern } = euclideanRhythm({
        onNotes: this.onNotes,
        totalNotes: this.totalNotes,
        pitch: this.pitch,
      });
      this.pattern = pattern;
    }
    if (!opts.pitchOffset) {
      const { pitchOffset } = euclideanRhythm({
        onNotes: this.onNotes,
        totalNotes: this.totalNotes,
        pitch: this.pitch,
      });
      this.pitchOffset = pitchOffset;
    }
  }

  public async init(): Promise<Track> {
    if (this.instrument) {
      if (!this.instrument.sound?.files[0]) {
        return this;
      }
      // saves keep the whole sound entry, and the sample files have since
      // been renamed, so look the sound up again in the current catalogue
      this.instrument.sound = currentSound(this.instrument.sound);
      try {
        this.sampler = await createAsyncSampler(
          publicUrl(`/sounds/${this.instrument.sound.files[0]}`)
        );
        this.isReady = true;
      } catch {
        // a missing sample shouldn't silence the rest of the project
        return this;
      }
    }

    this.handleMuteChange();

    return this;
  }

  private _createSoundFile(value?: SoundFile): Instrument {
    let sound = value;

    this.instrument = {
      sound: sound as SoundFile,
      frequency: this.pitch,
    };

    return this.instrument;
  }

  public clearSolo() {
    this.soloed = false;
    return this;
  }

  public toggleSolo(): Track {
    // TODO: Toggle solo for all tracks to false

    this.soloed = !this.soloed;

    if (this.soloed) {
      this.muted = false;
      this.handleMuteChange();
    }

    this.updateSelfInParent(this, {});

    return this;
  }

  public toggleMute(): Track {
    this.muted = !this.muted;

    this.handleMuteChange();
    return this;
  }

  private handleMuteChange() {
    if (this.muted) {
      this.prevVolume = this.volume;
      this.volume = 0;
    } else {
      this.volume = this.prevVolume;
    }
  }

  public play(time: number, tick: number) {
    if (!this.sampler || !this.isReady) {
      console.warn('Audio file not yet ready...');
      return;
    }

    const freq = Tone.Frequency(
      this.pitch + (this.pitchOffset[tick] || 0),
      'midi'
    ).toFrequency();

    const offset =
      Math.random() > 0.5 ? -Math.random() * 1.2 : Math.random() * 1.2;

    this.sampler.triggerAttack(freq + offset, time, volumeScale(this.volume));
  }

  public addNote(): Track {
    if (this.totalNotes + 1 > Config.MAX_SLICES) {
      this.updateSelfInParent(this, {});

      return this;
    }

    this.totalNotes += 1;
    this.pattern.push(0);
    this.pitchOffset.push(0);
    this.updateSelfInParent(this, {});
    return this;
  }

  public removeNote(index: number): Track {
    this.pattern = this.pattern.filter((_, i) => i !== index);
    this.pitchOffset = this.pitchOffset.filter((_, i) => i !== index);
    this.totalNotes -= 1;
    this.updateSelfInParent(this, {});
    return this;
  }

  public setRhythmTicks(value: number): Track {
    this.totalNotes = value;
    const length = this.pattern.length;

    if (value === length) {
      this.updateSelfInParent(this, {});
      return this;
    }

    if (value > length) {
      this.pattern.push(0);
      this.pitchOffset.push(0);
      this.updateSelfInParent(this, {});
      return this;
    }

    this.pattern.pop();
    this.pitchOffset.pop();
    this.updateSelfInParent(this, {});
    return this;
  }

  public async changeColor(value: [number, number, number]): Promise<Track> {
    this.color = value;
    this.updateSelfInParent(this, { needsReconnect: undefined });
    return this;
  }

  public async changeInstrument(value: SoundFile): Promise<Track> {
    this.isReady = false;

    const file = publicUrl(
      `/sounds/${this._createSoundFile(value).sound.files[0]}`
    );

    if (this.sampler) {
      this.sampler.dispose();
    }

    this.sampler = await createAsyncSampler(file);
    this.isReady = true;

    this.updateSelfInParent(this, { needsReconnect: true });
    return this;
  }
  public changePitch(value: number): Track {
    this.pitch = value;
    return this;
  }

  public changeVolume(value: number): Track {
    if (this.muted) {
      this.prevVolume = value;
    } else {
      this.volume = value;
      this.prevVolume = value;
    }

    return this;
  }

  public toggleNote(index: number): Track {
    this.pattern = this.pattern.map((p, i) => {
      if (i === index) return 1 - p;
      return p;
    });

    return this;
  }

  public noteOff(): Track {
    this.pitchOffset = this.pitchOffset.map(() => 0);

    this.pattern = this.pattern.map(() => 0);

    return this;
  }

  public repitchNote(index: number, type: 'INCREMENT' | 'DECREMENT'): Track {
    this.pitchOffset = this.pitchOffset.map((p, i) => {
      if (index !== i) return p;
      const next = p + (type === 'INCREMENT' ? 1 : -1);
      return Math.max(
        -Config.MAX_PITCH_OFFSET,
        Math.min(Config.MAX_PITCH_OFFSET, next)
      );
    });

    return this;
  }

  public exportJSON() {
    const { sampler, updateSelfInParent, ...rest } = this;

    return rest;
  }
}

const bare = (s: string) =>
  s
    .toUpperCase()
    .replace(/\.WAV$/, '')
    .replace(/^\d+_/, '')
    .replace(/^FM[ _]/, '')
    .replace(/[^A-Z0-9]/g, '');

function currentSound(saved: SoundFile): SoundFile {
  return (
    SOUNDS.find((s) => s.files[0] === saved.files[0]) ||
    SOUNDS.find((s) => s.name === saved.name) ||
    SOUNDS.find((s) => bare(s.files[0]) === bare(saved.files[0])) ||
    SOUNDS.find((s) => bare(s.name) === bare(saved.name)) ||
    SOUNDS[0]
  );
}
