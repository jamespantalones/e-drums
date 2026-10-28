import * as Tone from 'tone';

// a half-note echo, so every repeat lands on the beat
export const echoTime = (bpm: number) => (60 / bpm) * 2;

/**
 * A DJ-mixer style dub echo driven by one 0-100 depth control. Each pass
 * round the loop is filtered and softly clipped, so repeats get darker and
 * thinner and the tail can't run away. Turning depth down closes the input
 * but lets the tail ring out.
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
      frequency: 100,
      Q: 0.707,
    });
    this.lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 6000,
      Q: 0.707,
    });
    // unity gain for quiet signals, so the loop gain never passes the feedback
    this.clip = new Tone.WaveShaper((x) => Math.tanh(x));
    this.feedback = new Tone.Gain(0.45);
    this.output = new Tone.Gain(0.9);

    this.input.chain(this.delay, this.highpass, this.lowpass, this.clip);
    this.clip.chain(this.feedback, this.delay);
    this.clip.connect(this.output);
  }

  setTempo(bpm: number) {
    this.delay.delayTime.rampTo(echoTime(bpm), 0.05);
  }

  setDepth(value: number) {
    const d = Math.min(1, Math.max(0, value / 100));
    // dropping depth fades the loop slowly so the tail trails off
    const fall = d < this.depth ? 1.5 : 0.05;
    this.depth = d;

    this.input.gain.rampTo(0.85 * Math.sqrt(d), 0.05);
    this.feedback.gain.rampTo(0.45 + 0.45 * d, fall);
    this.highpass.frequency.rampTo(100 + 150 * d, fall);
    this.lowpass.frequency.rampTo(6000 - 3000 * d, fall);
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
