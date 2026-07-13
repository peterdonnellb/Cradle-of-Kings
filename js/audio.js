// audio.js — Lightweight procedural sound effects via the WebAudio API.
// No audio files: every effect is synthesized on the fly (oscillators + gain envelopes),
// which sidesteps licensing entirely and keeps the whole game dependency-free.

let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, duration = 0.12, type = 'sine', gain = 0.15, delay = 0, slideTo = null }) {
  if (muted) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, t0 + duration);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  click: () => tone({ freq: 520, duration: 0.06, type: 'triangle', gain: 0.08 }),
  move: () => tone({ freq: 300, duration: 0.09, type: 'sine', gain: 0.1, slideTo: 380 }),
  attackHit: () => {
    tone({ freq: 180, duration: 0.14, type: 'sawtooth', gain: 0.16, slideTo: 90 });
    tone({ freq: 90, duration: 0.1, type: 'square', gain: 0.08, delay: 0.02 });
  },
  unitDeath: () => tone({ freq: 220, duration: 0.35, type: 'sawtooth', gain: 0.12, slideTo: 60 }),
  cityFounded: () => {
    tone({ freq: 392, duration: 0.16, type: 'triangle', gain: 0.12 });
    tone({ freq: 523, duration: 0.22, type: 'triangle', gain: 0.12, delay: 0.1 });
  },
  buildingComplete: () => tone({ freq: 440, duration: 0.14, type: 'triangle', gain: 0.1, slideTo: 550 }),
  techComplete: () => {
    tone({ freq: 523, duration: 0.14, type: 'sine', gain: 0.12 });
    tone({ freq: 659, duration: 0.14, type: 'sine', gain: 0.12, delay: 0.09 });
    tone({ freq: 784, duration: 0.2, type: 'sine', gain: 0.12, delay: 0.18 });
  },
  turnEnd: () => tone({ freq: 260, duration: 0.1, type: 'sine', gain: 0.09, slideTo: 200 }),
  diplomacy: () => tone({ freq: 349, duration: 0.18, type: 'triangle', gain: 0.1, slideTo: 440 }),
  victory: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, duration: 0.3, type: 'triangle', gain: 0.14, delay: i * 0.14 }));
  },
  defeat: () => {
    [392, 349, 293, 220].forEach((f, i) => tone({ freq: f, duration: 0.35, type: 'sawtooth', gain: 0.1, delay: i * 0.16 }));
  },
};

export function setMuted(value) { muted = value; }
export function isMuted() { return muted; }
