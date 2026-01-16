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
  SEED_SLICES_MAX_DESKTOP: 5,
  SEED_SLICES_MIN_DESKTOP: 1,
  SEED_SLICES_MAX_MOBILE: 5,
  SEED_SLICES_MIN_MOBILE: 1,
  CACHE_PREFIX: 'ER-1',
  CACHE_MASTER: 'CACHE_MASTER',
} as const;

export const SOUNDS: SoundFile[] = sounds;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

console.log('BASE_PATH:', BASE_PATH);
export function publicUrl(relativePath: string) {
  return `${BASE_PATH}/${relativePath}`.replace(/\/+/g, '/');
}
