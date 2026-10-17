"""Synthesizes the 808-style samples in public/sounds (stdlib only).

    python3 bin/synth-sounds.py

Every sample is mapped to C3 by the sampler, so the track pitch control
transposes it relative to that.
"""
import math
import os
import random
import struct
import wave

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sounds')
TAU = 2 * math.pi

# metallic partials of the 808 hats and cymbal
METAL = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0]

random.seed(808)


def biquad(xs, kind, freq, q=0.707):
    w = TAU * freq / SR
    alpha = math.sin(w) / (2 * q)
    cw = math.cos(w)
    if kind == 'hp':
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
    elif kind == 'lp':
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
    else:  # band-pass, 0dB peak
        b = [alpha, 0, -alpha]
    a = [1 + alpha, -2 * cw, 1 - alpha]
    b = [v / a[0] for v in b]
    a1, a2 = a[1] / a[0], a[2] / a[0]
    x1 = x2 = y1 = y2 = 0.0
    out = []
    for x in xs:
        y = b[0] * x + b[1] * x1 + b[2] * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, x, y1, y
        out.append(y)
    return out


def square(freq, t):
    return 1.0 if (freq * t) % 1 < 0.5 else -1.0


def times(dur):
    return [n / SR for n in range(int(SR * dur))]


def decay(t, tau, attack=0.001):
    return min(1, t / attack) * math.exp(-t / tau)


def noise(n):
    return [random.uniform(-1, 1) for _ in range(n)]


def write(name, xs):
    # short fade so nothing ends on a click, then normalize
    fade = int(SR * 0.01)
    xs = [x * min(1, (len(xs) - i) / fade) for i, x in enumerate(xs)]
    peak = max(abs(x) for x in xs) or 1
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            b''.join(struct.pack('<h', int(x / peak * 0.89 * 32767)) for x in xs)
        )
    print('wrote', name)


def sub808():
    # tuned to C2, so it plays an octave below the pitch control
    f0, phase, out = 65.406, 0.0, []
    for t in times(1.6):
        phase += TAU * f0 * (1 + 1.6 * math.exp(-t / 0.018)) / SR
        drive = math.tanh(2.2 * math.sin(phase))
        out.append(drive * decay(t, 0.45, 0.002))
    return out


def metal(dur, tau, hp):
    ts = times(dur)
    raw = [sum(square(f, t) for f in METAL) / 6 for t in ts]
    raw = biquad(biquad(raw, 'bp', 10000, 0.6), 'hp', hp)
    return [x * decay(t, tau) for x, t in zip(raw, ts)]


def open_hat():
    return metal(0.6, 0.16, 7000)


def ride():
    ts = times(1.4)
    bell = metal(1.4, 0.45, 5000)
    hiss = biquad(noise(len(ts)), 'hp', 8000)
    return [b + 0.15 * h * decay(t, 0.25) for b, h, t in zip(bell, hiss, ts)]


def cowbell():
    ts = times(0.5)
    raw = [square(540, t) + square(800, t) for t in ts]
    raw = biquad(raw, 'bp', 2640, 1.2)
    # sharp strike into a slower ring, like the 808's two stage envelope
    return [
        x * (0.6 * decay(t, 0.012) + 0.4 * decay(t, 0.12)) for x, t in zip(raw, ts)
    ]


def clave():
    return [math.sin(TAU * 2500 * t) * decay(t, 0.025, 0.0005) for t in times(0.2)]


def shaker():
    ts = times(0.25)
    raw = biquad(noise(len(ts)), 'hp', 6000)
    # swells in rather than snapping, like beads settling
    return [x * min(1, t / 0.02) * math.exp(-max(0, t - 0.02) / 0.04) for x, t in zip(raw, ts)]


def hi_tom():
    ts = times(0.6)
    phase, out = 0.0, []
    hit = biquad(noise(len(ts)), 'bp', 3000, 0.8)
    for t, h in zip(ts, hit):
        phase += TAU * 196 * (1 + 0.35 * math.exp(-t / 0.05)) / SR
        out.append(math.sin(phase) * decay(t, 0.16) + 0.25 * h * decay(t, 0.008))
    return out


def snap():
    ts = times(0.25)
    raw = biquad(noise(len(ts)), 'bp', 1900, 2.5)
    return [x * decay(t, 0.03, 0.0005) for x, t in zip(raw, ts)]


SOUNDS = {
    '27_SUB_808.wav': sub808,
    '28_808_OH.wav': open_hat,
    '29_808_CB.wav': cowbell,
    '30_808_CLAVE.wav': clave,
    '31_SHAKER.wav': shaker,
    '32_HI_TOM.wav': hi_tom,
    '33_SNAP.wav': snap,
    '34_RIDE.wav': ride,
}

if __name__ == '__main__':
    for name, fn in SOUNDS.items():
        write(name, fn())
