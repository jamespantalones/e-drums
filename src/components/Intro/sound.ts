/**
 * Intro sound: a robot voice. A plain Web Audio context is used only to
 * detect (and unlock) autoplay, so the intro doesn't touch Tone.js.
 */

// novelty / retro voices, best first (macOS ships most of these)
const ROBOT_VOICES = ['Zarvox', 'Trinoids', 'Fred', 'Ralph', 'Albert'];

let ctx: AudioContext | undefined;

export function getAudioContext() {
  if (typeof window === 'undefined') return undefined;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return undefined;
    ctx = new Ctor();
  }
  return ctx;
}

/** True when sound can play without waiting for a tap or key press */
export function canAutoplay() {
  const nav = navigator as Navigator & {
    userActivation?: { hasBeenActive: boolean };
  };
  if (nav.userActivation?.hasBeenActive) return true;
  return getAudioContext()?.state === 'running';
}

export async function unlockAudio() {
  const audio = getAudioContext();
  if (audio && audio.state !== 'running') {
    await audio.resume().catch(() => undefined);
  }
}

function pickVoice(voices: SpeechSynthesisVoice[]) {
  for (const name of ROBOT_VOICES) {
    const match = voices.find((v) => v.name.startsWith(name));
    if (match) return { voice: match, robotic: true };
  }
  const english = voices.find((v) => v.lang.startsWith('en'));
  return { voice: english, robotic: false };
}

/** Voices load asynchronously in some browsers; call early to warm the list */
export function preloadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
}

export function speak(text: string, maxWait = 3000): Promise<void> {
  return new Promise((resolve) => {
    const synth = typeof window !== 'undefined' && window.speechSynthesis;
    if (!synth) return resolve();

    const utterance = new SpeechSynthesisUtterance(text);
    const { voice, robotic } = pickVoice(synth.getVoices());
    if (voice) utterance.voice = voice;
    // without a novelty voice, fake it with a low, slow delivery
    utterance.pitch = robotic ? 1 : 0.1;
    utterance.rate = robotic ? 0.9 : 0.7;

    const timeout = window.setTimeout(resolve, maxWait);
    const done = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    utterance.onend = done;
    utterance.onerror = done;

    synth.cancel();
    synth.speak(utterance);
  });
}

export function stopSpeaking() {
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
}
