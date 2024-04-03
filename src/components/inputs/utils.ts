import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Define the output range [0, 3]
const outputMin = 0;
const outputMax = 3;

// Define the angle range [0, 360]
const angleMin = 0;
const angleMax = 360;

export function getDeg(
  cx: number,
  cy: number,
  pts: { x: number; y: number },
  startAngle: number,
  endAngle: number
) {
  let x = cx - pts.x;
  let y = cy - pts.y;

  let deg = (Math.atan(y / x) * 180) / Math.PI;

  if ((x < 0 && y >= 0) || (x < 0 && y < 0)) {
    deg += 90;
  } else {
    deg += 270;
  }

  let finalDeg = Math.min(Math.max(startAngle, deg), endAngle);
  return finalDeg;
}

export const convertRange = (
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
  oldValue: number
) => {
  return ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
};

export function scaleVolume(val: number) {
  // Ensure output is within the range [0, 3]
  val = Math.min(outputMax, Math.max(outputMin, val));

  // Calculate the mapped angle
  const mappedAngle =
    ((val - outputMin) / (outputMax - outputMin)) * (angleMax - angleMin) +
    angleMin;

  return mappedAngle;
}

export function scaleDegrees(degrees: number) {
  // Ensure degrees is within the range [0, 360]
  degrees = degrees % 360;
  if (degrees < 0) {
    degrees += 360;
  }

  // Calculate the mapped value
  const mappedValue = (degrees / 360) * (outputMax - outputMin) + outputMin;

  return mappedValue;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
