import { describe, expect, it } from 'vitest';
import { euclideanRhythm, generateRandomColor } from '../utils';

describe('Utils', () => {
  it('should generate a random hsl color', () => {
    expect(generateRandomColor()).toEqual(expect.stringContaining('hsl'));
  });

  describe('Euclidean Rhythm', () => {
    it('should return correct outputs', () => {
      expect(
        euclideanRhythm({
          onNotes: 4,
          totalNotes: 8,
        })
      ).toEqual([1, 0, 1, 0, 1, 0, 1, 0]);
      expect(euclideanRhythm({ onNotes: 2, totalNotes: 3 })).toEqual([1, 1, 0]);
    });
    it('should return correct outputs with pitch if provided', () => {
      expect(
        euclideanRhythm({
          onNotes: 4,
          totalNotes: 8,
          pitch: 50,
        })
      ).toEqual([50, 0, 50, 0, 50, 0, 50, 0]);
      expect(euclideanRhythm({ onNotes: 2, totalNotes: 3, pitch: 50 })).toEqual(
        [50, 50, 0]
      );
    });
    it('should return the previous patterns pitch if possible', () => {
      expect(
        euclideanRhythm({
          onNotes: 4,
          totalNotes: 8,
          previousPattern: [100, 0, 100, 0],
          pitch: 50,
        })
      ).toEqual([100, 0, 100, 0, 50, 0, 50, 0]);
    });
    it('should not have less onNotes than the previousPattern (if provided)', () => {
      expect(
        euclideanRhythm({
          onNotes: 4,
          totalNotes: 8,
          previousPattern: [100, 0, 100, 0, 100, 100, 100, 100],
          pitch: 50,
        })
      ).toEqual([100, 0, 100, 0, 50, 0, 50, 0]);
    });
  });
});