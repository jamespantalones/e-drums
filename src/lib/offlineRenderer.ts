import * as Tone from 'tone';
import { store } from '../state';

const { getState, setState } = store;

export async function renderSequencerOffline(
  duration: number
): Promise<Tone.ToneAudioBuffer> {
  // 1. Destructure 'context' here. This is the OfflineAudioContext.
  return Tone.Offline(async ({ transport, context }) => {
    const { reverb, volume, tracks } = getState();
    // ------------------------------------------------------------
    // A. Recreate Master Chain
    // ------------------------------------------------------------
    // IMPORTANT: Pass { context } to ensure these nodes belong to the offline world
    const offlineReverb = new Tone.Reverb({ context });
    offlineReverb.wet.value = reverb / 100;
    await offlineReverb.generate();

    const offlineVolume = new Tone.Volume({
      context,
      volume,
    });

    // Connect Chain: Volume -> Reverb -> Offline Context Destination
    // DO NOT connect to Tone.Destination (that is the live speakers)
    offlineVolume.chain(offlineReverb, context.destination);

    // ------------------------------------------------------------
    // B. Recreate Tracks
    // ------------------------------------------------------------
    const offlineTracks = await Promise.all(
      tracks.map(async (track) => {
        // We need to create a new Sampler in the offline context.
        // We use the URL from the original track.
        // const sampler = new Tone.Sampler({
        //   context: context, // <--- EXPLICIT CONTEXT IS CRITICAL
        //   urls: {
        //     C4: track.url, // Assuming 'url' exists on your Track object
        //   },
        //   // If you don't have track.url, see the note below
        // }).connect(offlineVolume);

        // await sampler.loaded();

        // return {
        //   id: track.id,
        //   sampler: sampler,
        //   pattern: track.pattern,
        // };

        return {};
      })
    );

    // ------------------------------------------------------------
    // C. Schedule Transport
    // ------------------------------------------------------------
    transport.bpm.value = getState().bpm;
    transport.swing = getState().swing / 100;
    transport.swingSubdivision = '16t';

    let offlineTick = -1;

    transport.scheduleRepeat((time) => {
      offlineTick += 1;
      const nextIndex = offlineTick + 1;

      offlineTracks.forEach((t) => {
        //const currentTick = nextIndex % t.pattern.length;
        // if (t.pattern[currentTick] > 0) {
        //   // Trigger the note in the offline sampler
        //   t.sampler.triggerAttackRelease('C4', '16n', time, 1);
        // }
      });
    }, '16n');

    // ------------------------------------------------------------
    // D. Start
    // ------------------------------------------------------------
    transport.start();
  }, duration);
}

export const handleExport = async () => {
  console.log('Rendering...');

  // Render 4 bars (assuming 120 BPM, 4/4 time -> 2s per bar -> 8s total, adjust math as needed)
  // Or calculate exact duration: (60 / BPM) * 4 beats * numberOfBars
  const duration = 10;

  const buffer = await renderSequencerOffline(duration);

  console.log('Render finished', buffer);

  // Example: Download the file
  // const wavBlob = toWav(buffer); // You might need a helper to convert AudioBuffer to WAV blob
  // downloadBlob(wavBlob, "my-beat.wav");
};
