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

export function scaleColor(value: number) {
  // Ensure the input value is within the range [0, 100]
  value = Math.min(100, Math.max(0, value));

  // Calculate the amount of red component
  let red = Math.floor(255 * (value / 100));

  // Calculate the amount of green component

  // Convert RGB values to hexadecimal format
  let rs = red.toString(16).padStart(2, '0');
  let gs = '20';
  let bs = '20'; // Blue component remains 0

  // Return the color in hexadecimal format
  return `#${rs}${gs}${bs}`;
}

// Function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b];
}
