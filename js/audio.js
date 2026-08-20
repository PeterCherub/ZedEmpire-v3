// js/audio.js
// Ported 1:1 from systems/audio.lua: every sound is synthesized from a
// formula at startup rather than loaded from a .wav/.mp3, so nothing
// can 404 or ship corrupted. Same sample rate, same envelope shape,
// same per-sound formulas -- only the playback API changed (an
// AudioBuffer + fresh AudioBufferSourceNode per play(), instead of
// love.audio.newSource + :clone()).

const SAMPLE_RATE = 22050;

const audio = {
  enabled: false,
  muted: false,
  ctx: null,
  buffers: {},
  musicSrc: null,
  musicGain: null,
};

function envelope(t, duration, attack = 0.01, release) {
  release = release ?? duration * 0.6;
  if (t < attack) return t / attack;
  const relStart = duration - release;
  if (t > relStart) return Math.max(0, (duration - t) / release);
  return 1;
}

// genFn(t, duration) -> sample in [-1, 1]
function makeBuffer(ctx, duration, genFn) {
  const samples = Math.max(1, Math.floor(SAMPLE_RATE * duration));
  const buffer = ctx.createBuffer(1, samples, SAMPLE_RATE);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    let s = genFn(t, duration);
    if (s > 1) s = 1;
    else if (s < -1) s = -1;
    data[i] = s;
  }
  return buffer;
}

// Browsers refuse to make sound before a user gesture, so the
// AudioContext is created lazily -- call audio.unlock() from the
// first pointerdown/click handler in main.js.
export function unlock() {
  if (audio.ctx) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.ctx = ctx;

    audio.buffers.click = makeBuffer(ctx, 0.045, (t, d) =>
      Math.sin(2 * Math.PI * 1200 * t) * envelope(t, d, 0.001, d * 0.85) * 0.22
    );

    audio.buffers.coin = makeBuffer(ctx, 0.18, (t, d) => {
      const f = t < d / 2 ? 880 : 1320;
      return Math.sin(2 * Math.PI * f * t) * envelope(t, d, 0.004, 0.08) * 0.3;
    });

    audio.buffers.error = makeBuffer(ctx, 0.2, (t, d) => {
      const f = 180;
      const square = Math.sin(2 * Math.PI * f * t) >= 0 ? 1 : -1;
      return square * envelope(t, d, 0.001, d * 0.7) * 0.16;
    });

    audio.buffers.choice = makeBuffer(ctx, 0.12, (t, d) =>
      Math.sin(2 * Math.PI * 220 * t) * envelope(t, d, 0.001, d) * 0.28
    );

    audio.buffers.debt = makeBuffer(ctx, 0.4, (t, d) => {
      const f = 520 - 340 * (t / d);
      return Math.sin(2 * Math.PI * f * t) * envelope(t, d, 0.01, d * 0.6) * 0.26;
    });

    audio.buffers.death = makeBuffer(ctx, 0.9, (t, d) => {
      const f = 400 - 320 * (t / d);
      return Math.sin(2 * Math.PI * f * t) * envelope(t, d, 0.02, d * 0.7) * 0.3;
    });

    audio.buffers.win = makeBuffer(ctx, 0.6, (t, d) => {
      const seg = d / 3;
      const f = t < seg ? 660 : t < seg * 2 ? 880 : 1100;
      return Math.sin(2 * Math.PI * f * t) * envelope(t, d, 0.01, 0.1) * 0.3;
    });

    // Background bed for gameplay -- a slow, sparse A-minor drone with
    // a soft "breathing" swell and a distant, irregular low pulse (like
    // a tired heartbeat). Nothing rhythmic or upbeat; it should sit
    // under the cards without competing with them. 16s loop, faded at
    // both edges so the loop point doesn't click.
    audio.buffers.bgMusic = makeBuffer(ctx, 16, (t, d) => {
      const freqs = [110.0, 130.81, 164.81]; // A2, C3, E3 -- A minor
      let s = 0;
      for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
      s /= freqs.length;

      const breathe = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.09 * t);

      const pulsePeriod = 4;
      const pulseT = t % pulsePeriod;
      let pulse = 0;
      if (pulseT < 0.35) {
        pulse = Math.sin(2 * Math.PI * 55 * pulseT) * envelope(pulseT, 0.35, 0.01, 0.3) * 0.35;
      }

      const edgeFade = Math.min(1, t / 0.6, (d - t) / 0.6);
      return (s * 0.16 * breathe + pulse) * edgeFade;
    });

    audio.enabled = true;
  } catch (e) {
    console.warn("Audio synthesis unavailable -- running without sound.", e);
    audio.enabled = false;
  }
}

audio.play = function (name) {
  if (!audio.enabled || audio.muted || !audio.ctx) return;
  const buffer = audio.buffers[name];
  if (!buffer) return;
  if (audio.ctx.state === "suspended") audio.ctx.resume();
  const src = audio.ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(audio.ctx.destination);
  src.start();
};

audio.setMuted = function (muted) {
  audio.muted = muted;
  if (audio.musicGain) {
    audio.musicGain.gain.setTargetAtTime(muted ? 0 : 1, audio.ctx.currentTime, 0.05);
  }
};

audio.toggleMuted = function () {
  audio.setMuted(!audio.muted);
  return audio.muted;
};

// Starts the looping background bed. Safe to call repeatedly -- a
// second call while it's already playing is a no-op instead of
// stacking a second source on top.
audio.playMusic = function () {
  if (!audio.enabled || !audio.ctx || !audio.buffers.bgMusic || audio.musicSrc) return;
  if (audio.ctx.state === "suspended") audio.ctx.resume();
  const src = audio.ctx.createBufferSource();
  src.buffer = audio.buffers.bgMusic;
  src.loop = true;
  const gain = audio.ctx.createGain();
  gain.gain.value = audio.muted ? 0 : 1;
  src.connect(gain);
  gain.connect(audio.ctx.destination);
  src.start();
  audio.musicSrc = src;
  audio.musicGain = gain;
};

audio.stopMusic = function () {
  if (audio.musicSrc) {
    try { audio.musicSrc.stop(); } catch (e) { /* already stopped */ }
    audio.musicSrc.disconnect();
    audio.musicSrc = null;
  }
  if (audio.musicGain) {
    audio.musicGain.disconnect();
    audio.musicGain = null;
  }
};

audio.unlock = unlock;

export default audio;
