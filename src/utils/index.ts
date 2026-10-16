import { nanoid } from 'nanoid';
import { Config } from '../config';

export const generateId = () => nanoid(Config.ID_LENGTH);

export function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function padNumber(num?: number): string {
  if (!num) return '00';

  if (num < 10 && num > -1) {
    return `0${num}`;
  }

  if (num < 0 && num > -10) {
    return `-0${Math.abs(num)}`;
  }
  return `${num}`;
}

export function noop() {
  return undefined;
}

export function normalize(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}
