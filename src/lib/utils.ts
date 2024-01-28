import * as Tone from 'tone';
import { generateId } from '../utils';
import { Config, SOUNDS } from '../config';
import { Instrument, SerializedTrack } from '../types';

export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Random color
 * @returns
 */
export function generateRandomColor(): [number, number, number] {
  const hue = randomRange(0, 360);
  const saturation = randomRange(45, 97);
  const lightness = randomRange(52, 90);

  return [hue, saturation, lightness];
}

export function generateTrack(index = 0) {
  let random =
    Math.floor(Math.random() * Config.SEED_SLICES_MAX_DESKTOP) +
    Config.SEED_SLICES_MIN_DESKTOP;

  const soundIndex = Math.floor(Math.random() * (SOUNDS.length - 1));

  const sound = SOUNDS[index];

  if (!sound) {
    throw new Error(`Missing sound ${soundIndex}`);
  }

  const track: SerializedTrack & { instrument: Instrument } = {
    id: generateId(),
    index,
    onNotes: Math.floor(random / 2),
    totalNotes: random,
    pitch: 50,
    instrument: {
      frequency: 50,
      sound,
    },
  };
  return track;
}

export function compareArrays(a: number[], b: number[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function euclideanRhythm(opts: {
  onNotes: number;
  totalNotes: number;
  pitch?: number;
  previousPitchOffsets?: number[];
}): { pattern: number[]; pitchOffset: number[] } {
  const { totalNotes, onNotes } = opts;

  // groups and slots are initially empty arrays.
  // groups will store the final rhythmic pattern and
  // slots will store the 'on' beats from
  // the previous pattern (if one was given)
  let groups: number[][] = [];
  let slots: number[] = [];

  // A loop creates the initial pattern in the groups array.
  // If the current iteration index is less than the maximum
  // number of 'on' beats (stableOnNotes), it adds an array
  // containing 1, else an array containing 0.
  const stableOnNotes = Math.max(onNotes, slots.length);

  for (let i = 0; i < totalNotes; i += 1) {
    groups.push([Number(i < stableOnNotes)]);
  }

  let l: number;

  // The main part of the rhythm generation occurs here.
  // It works by repeatedly splitting the pattern into two halves
  // and merging them together, creating a sort of 'rotational symmetry'.
  // This process continues until no further changes can be made, resulting in
  // the final rhythm.
  while ((l = groups.length - 1)) {
    let start = 0;
    let [first] = groups;

    while (start < l && compareArrays(first, groups[start])) {
      start++;
    }

    if (start === l) break;

    let end = l;
    let last = groups[l];

    while (end > 0 && compareArrays(last, groups[end])) {
      end--;
    }

    if (end === 0) break;

    const count = Math.min(start, l - end);
    groups = groups
      .slice(0, count)
      .map((g, i) => g.concat(groups[l - i]))
      .concat(groups.slice(count, -count));
  }

  const binaryArray = groups.flat().map((a) => {
    if (a === 0) return 0;
    return 1;
  });

  return {
    pattern: binaryArray,
    pitchOffset: binaryArray.map((b) => 0),
  };
}

export function createAsyncSampler(file: string): Promise<Tone.Sampler> {
  return new Promise((resolve, reject) => {
    function onLoad() {
      const sampler = new Tone.Sampler({
        C3: buffer,
      });
      return resolve(sampler);
    }

    function onError(err: Error) {
      return reject(err);
    }

    const buffer = new Tone.Buffer(file, onLoad, onError);
  });
}
