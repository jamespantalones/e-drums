import * as Tone from 'tone';

// 3/4 of a beat: patterns loop on the bar, so an echo on a whole or half
// note lands under the hit it copied; this one falls between hits
export const echoTime = (bpm: number) => (60 / bpm) * 0.75;

/**
 * A DJM-style echo on one 0-100 LEVEL/DEPTH control. The first half brings
 * the echo up to the level of the dry sound; the second half raises the
 * feedback towards long dub tails. Each pass round the loop is filtered and
 * softly clipped, so repeats darken and can't run away, and turning it down
 * lets the tail ring out rather than cutting it.
 */
export class DubEcho {
  public input: Tone.Gain;
  public output: Tone.Gain;

  private delay: Tone.Delay;
  private highpass: Tone.Filter;
  private lowpass: Tone.Filter;
  private clip: Tone.WaveShaper;
  private feedback: Tone.Gain;
  private depth = 0;

  constructor(bpm: number, minBpm: number) {
    this.input = new Tone.Gain(0);
    this.delay = new Tone.Delay(echoTime(bpm), echoTime(minBpm));
    this.highpass = new Tone.Filter({
      type: 'highpass',
      frequency: 40,
      Q: 0.707,
    });
    this.lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 8000,
      Q: 0.707,
    });
    // unity gain for quiet signals, so the loop gain never passes the
    // feedback; loud repeats round off instead of building up
    this.clip = new Tone.WaveShaper((x) => 1.5 * Math.tanh(x / 1.5));
    this.feedback = new Tone.Gain(0.7);
    this.output = new Tone.Gain(1);

    this.input.chain(this.delay, this.highpass, this.lowpass, this.clip);
    this.clip.chain(this.feedback, this.delay);
    this.clip.connect(this.output);
  }

  setTempo(bpm: number) {
    this.delay.delayTime.rampTo(echoTime(bpm), 0.05);
  }

  setDepth(value: number) {
    const d = Math.min(1, Math.max(0, value / 100));
    const tail = Math.max(0, d - 0.5) * 2;
    // dropping depth fades the loop slowly so the tail trails off
    const fall = d < this.depth ? 1.5 : 0.05;
    this.depth = d;

    this.input.gain.rampTo(Math.min(1, d * 2), 0.05);
    this.feedback.gain.rampTo(0.7 + 0.22 * tail, fall);
    this.highpass.frequency.rampTo(40 + 260 * tail, fall);
    this.lowpass.frequency.rampTo(8000 - 5000 * tail, fall);
    // makes up what the heavier filtering takes from the first repeats
    this.output.gain.rampTo(1 + 0.6 * tail, fall);
  }

  dispose() {
    [
      this.input,
      this.delay,
      this.highpass,
      this.lowpass,
      this.clip,
      this.feedback,
      this.output,
    ].forEach((node) => node.dispose());
  }
}
