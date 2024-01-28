import { SoundFile } from '../types';

export const Config = {
  DEFAULT_BPM: 102,
  MAX_BPM: 280,
  MIN_BPM: 50,
  DEFAULT_VOLUME: -6,
  MIN_VOLUME: -24,
  MIN_REVERB: 0,
  MAX_REVERB: 100,
  MAX_VOLUME: 12,
  MIN_SLICES: 0,
  MAX_SLICES: 16,
  MAX_TRACKS: 16,
  ID_LENGTH: 10,
  MOBILE_CUTOFF: 768,
  SEED_SLICES_MAX_DESKTOP: 8,
  SEED_SLICES_MIN_DESKTOP: 3,
  SEED_SLICES_MAX_MOBILE: 7,
  SEED_SLICES_MIN_MOBILE: 2,
  CACHE_PREFIX: 'ER-1',
  CACHE_MASTER: 'CACHE_MASTER',
} as const;

export const SOUNDS: SoundFile[] = [
  {
    name: 'KICK',
    defaultFreqRange: [20, 80],
    files: ['2_FM_KICK.wav'],
  },
  {
    name: 'HAT1',
    defaultFreqRange: [20, 80],
    files: ['8_FM_HH.wav'],
  },
  {
    name: 'JB SNR',
    defaultFreqRange: [40, 80],
    files: ['30_JB_SNR.wav'],
  },

  {
    name: 'BASS',
    defaultFreqRange: [20, 80],
    files: ['1_FM_BASS.wav'],
  },

  {
    name: 'CONGA',
    defaultFreqRange: [20, 80],
    files: ['4_FM_CONGA.wav'],
  },

  {
    name: 'CLAP',
    defaultFreqRange: [20, 80],
    files: ['5_FM_CLAP.wav'],
  },

  {
    name: 'BONGO',
    defaultFreqRange: [20, 80],
    files: ['3_FM_BONGO.wav'],
  },

  {
    name: 'BELLS',
    defaultFreqRange: [20, 80],
    files: ['6_FM_BELLS.wav'],
  },

  {
    name: 'DOG',
    defaultFreqRange: [20, 80],
    files: ['7_FM_DOG.wav'],
  },

  {
    name: 'HAT2',
    defaultFreqRange: [20, 80],
    files: ['9_FM_HH_2.wav'],
  },
  {
    name: 'HONK',
    defaultFreqRange: [20, 80],
    files: ['10_FM_HONK.wav'],
  },
  {
    name: 'RIM',
    defaultFreqRange: [0, 40],
    files: ['11_FM_RIM.wav'],
  },
  {
    name: 'MARACAS',
    defaultFreqRange: [20, 60],
    files: ['12_FM_MARACAS.wav'],
  },
  {
    name: 'NOISE',
    defaultFreqRange: [20, 80],
    files: ['13_FM_NOISE.wav'],
  },
  {
    name: 'PLUCK',
    defaultFreqRange: [20, 80],
    files: ['14_FM_PLUCK.wav'],
  },
  {
    name: 'CYMBAL',
    defaultFreqRange: [20, 80],
    files: ['15_FM_CYMBAL.wav'],
  },
  {
    name: 'KAH!',
    defaultFreqRange: [20, 80],
    files: ['16_JB_KAH!.wav'],
  },
  {
    name: 'RING',
    defaultFreqRange: [40, 80],
    files: ['17_FM_RING.wav'],
  },
  {
    name: 'SNR',
    defaultFreqRange: [40, 80],
    files: ['23_FM_SNR.wav'],
  },
  {
    name: 'CONGA2',
    defaultFreqRange: [40, 80],
    files: ['18_FM_CONGA_2.wav'],
  },
  {
    name: 'ROTO',
    defaultFreqRange: [40, 80],
    files: ['19_FM_ROTO.wav'],
  },
  {
    name: 'SCRATCH',
    defaultFreqRange: [40, 80],
    files: ['20_FM_SCRATCH.wav'],
  },
  {
    name: 'SHAKER',
    defaultFreqRange: [40, 80],
    files: ['21_FM_SHAKER.wav'],
  },
  {
    name: 'SWEEP',
    defaultFreqRange: [40, 80],
    files: ['22_FM_SWEEP.wav'],
  },

  {
    name: 'STAB',
    defaultFreqRange: [40, 80],
    files: ['24_JB_STAB.wav'],
  },
  {
    name: 'T BASS',
    defaultFreqRange: [40, 80],
    files: ['25_TRITON_BASS.wav'],
  },
  {
    name: 'T CUICA',
    defaultFreqRange: [40, 80],
    files: ['26_TRITON_CUICA.wav'],
  },
  {
    name: 'TMG',
    defaultFreqRange: [40, 80],
    files: ['27_TRITON_MUTE_GIT.wav'],
  },
  {
    name: 'T SCRATCH',
    defaultFreqRange: [40, 80],
    files: ['28_TRITON_SCRATCH.wav'],
  },
  {
    name: 'JB KICK',
    defaultFreqRange: [40, 80],
    files: ['29_JB_KICK.wav'],
  },

  {
    name: 'HEY!',
    defaultFreqRange: [40, 80],
    files: ['31_JB_HEY!.wav'],
  },
  {
    name: 'YP HEY!',
    defaultFreqRange: [40, 80],
    files: ['32_YP_HEY!.wav'],
  },
  {
    name: 'FM BASS 2',
    defaultFreqRange: [40, 80],
    files: ['33_FM_BASS_2.wav'],
  },
  {
    name: 'FM CLAP 2',
    defaultFreqRange: [40, 80],
    files: ['34_FM_CLAP_2.wav'],
  },
  {
    name: 'FM DIB',
    defaultFreqRange: [40, 80],
    files: ['35_FM_DIB.wav'],
  },
  {
    name: 'FM LOW TOM',
    defaultFreqRange: [40, 80],
    files: ['36_FM_LOW_TOM.wav'],
  },
  {
    name: 'FM PIANO',
    defaultFreqRange: [40, 80],
    files: ['37_FM_PIANO.wav'],
  },
  {
    name: 'FM PLUCK 2',
    defaultFreqRange: [40, 80],
    files: ['38_FM_PLUCK_2.wav'],
  },
  {
    name: 'FM SHAKER 2',
    defaultFreqRange: [40, 80],
    files: ['39_FM_SHAKER_2.wav'],
  },
];
