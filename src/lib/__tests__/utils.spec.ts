import { describe, expect, it } from 'vitest';
import { euclideanRhythm, generateRandomColor } from '../utils';

describe('Utils', () => {
  it('should generate a random [hue, saturation, lightness] color', () => {
    const color = generateRandomColor();
    expect(color).toHaveLength(3);
    color.forEach((v) => expect(v).toEqual(expect.any(Number)));
  });

  describe('Euclidean Rhythm', () => {
    it('should return correct outputs', () => {
      expect(
        euclideanRhythm({
          onNotes: 4,
          totalNotes: 8,
        })
      ).toEqual({
        pattern: [1, 0, 1, 0, 1, 0, 1, 0],
        pitchOffset: [0, 0, 0, 0, 0, 0, 0, 0],
      });
      expect(euclideanRhythm({ onNotes: 2, totalNotes: 3 })).toEqual({
        pattern: [1, 1, 0],
        pitchOffset: [0, 0, 0],
      });
    });
  });
});
