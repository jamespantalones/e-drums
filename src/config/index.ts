import { SoundFile } from '../types';
import sounds from '../../public/sounds/config.json';

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

export const SOUNDS: SoundFile[] = sounds;
