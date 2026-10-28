import { describe, expect, it, vi } from 'vitest';
import { Track } from '../Track';
import { SOUNDS } from '../../config';

describe('Track', () => {
  it('should create a new track', () => {
    expect(
      new Track({
        index: 0,
        updateSelfInParent: vi.fn(),
      })
    ).toEqual(
      expect.objectContaining({
        color: expect.any(Array),
        id: expect.any(String),
        index: 0,
        instrument: null,
        isReady: false,
        onNotes: 4,
        pattern: [1, 0, 1, 0, 1, 0, 1, 0],
        pitch: 50,
        totalNotes: 8,
        updateSelfInParent: expect.any(Function),
        volume: 30,
      })
    );
  });
  it('should export a JSON representation of the track', async () => {
    const track = new Track({
      instrument: {
        sound: SOUNDS[0],
        frequency: 50,
      },
      index: 0,
      updateSelfInParent: vi.fn(),
    });

    expect(await track.exportJSON()).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        index: 0,
        onNotes: 4,
        totalNotes: 8,
        isReady: false,
        instrument: {
          sound: SOUNDS[0],
          frequency: 50,
        },
        color: expect.any(Array),
        hue: expect.any(Number),
        volume: 30,
        prevVolume: 30,
        pitch: 50,
        pattern: [1, 0, 1, 0, 1, 0, 1, 0],
        pitchOffset: [0, 0, 0, 0, 0, 0, 0, 0],
        muted: false,
      })
    );
  });
});
