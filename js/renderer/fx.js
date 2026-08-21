// js/renderer/fx.js
// Shared visual-polish helpers used across draw.js, Button.js, Panel.js,
// Map.js, Slider.js and Menu.js: color math, gradients, glowing panels,
// and a lightweight ambient particle/vignette background system. Kept
// dependency-free (no libraries) -- just Canvas2D, so it stays true to
// the project's "vanilla JS + Canvas" approach while looking a lot
// more like a modern, built-for-2026 game UI.

import { theme } from '../theme.js';

// Polyfill roundRect if needed. fx.js is the most-imported module in
// the renderer/UI layer, so registering it here guarantees it's in
// place before anything (Button, Panel, draw.js, Map) tries to use it.
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = [r];
    const radii = r.map(v => Math.min(v, Math.min(w, h) / 2));
    if (radii.length === 0) radii.push(0);
    this.moveTo(x + radii[0], y);
    this.lineTo(x + w - radii[0], y);
    this.quadraticCurveTo(x + w, y, x + w, y + radii[0]);
    this.lineTo(x + w, y + h - radii[0]);
    this.quadraticCurveTo(x + w, y + h, x + w - radii[0], y + h);
    this.lineTo(x + radii[0], y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radii[0]);
    this.lineTo(x, y + radii[0]);
    this.quadraticCurveTo(x, y, x + radii[0], y);
    return this;
  };
}

export function rgb(c, a) {
  const r = Math.round(Math.min(1, Math.max(0, c[0])) * 255);
  const g = Math.round(Math.min(1, Math.max(0, c[1])) * 255);
  const b = Math.round(Math.min(1, Math.max(0, c[2])) * 255);
  return a === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function lighten(c, f) {
  return [Math.min(1, c[0] + f), Math.min(1, c[1] + f), Math.min(1, c[2] + f)];
}

export function darken(c, f) {
  return [Math.max(0, c[0] - f), Math.max(0, c[1] - f), Math.max(0, c[2] - f)];
}

export function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Resolves a color that may be an [r,g,b] triplet (0-1 floats) OR a
// theme key name like "gold" / "panel" -- so callers can pass either
// without every call site needing to know which.
export function resolveColor(c, fallback) {
  if (Array.isArray(c)) return c;
  if (typeof c === 'string' && theme[c]) return theme[c];
  return fallback;
}

export function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function vGradient(ctx, x, y, h, topCss, bottomCss) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, topCss);
  g.addColorStop(1, bottomCss);
  return g;
}

// A rounded panel with a vertical gradient fill, a soft drop shadow, a
// faint top "sheen" highlight, and a crisp 1px border. This one shape
// underlies the ledger, situation card, panels, chips, and buttons --
// it's the thing that makes flat single-color rects look like a real
// modern UI kit instead of a wireframe.
export function glowPanel(ctx, x, y, w, h, r, opts = {}) {
  const {
    top, bottom, border, shadowColor = 'rgba(0,0,0,0.4)', shadowBlur = 14,
    sheen = true, sheenAlpha = 0.07, borderWidth = 1,
  } = opts;

  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillStyle = vGradient(ctx, x, y, h, top, bottom);
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();

  if (sheen) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, r);
    ctx.clip();
    const s = ctx.createLinearGradient(x, y, x, y + h * 0.55);
    s.addColorStop(0, `rgba(255,255,255,${sheenAlpha})`);
    s.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = s;
    ctx.fillRect(x, y, w, h * 0.55);
    ctx.restore();
  }

  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = borderWidth;
    roundRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
  }
}

// Small L-shaped corner brackets -- a cheap, unmistakably "tech UI"
// framing device used on panels/menus to signal the modern build.
export function techCorners(ctx, x, y, w, h, size = 12, color = 'rgba(255,255,255,0.35)') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  const corners = [
    [x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * dy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + size * dx, cy);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------
// Ambient background: gradient wash + drifting gold motes + vignette.
// Self-timed via performance.now() so nothing else in the codebase has
// to plumb dt through to the renderer.
// ---------------------------------------------------------------
let particles = null;
let lastT = null;

function initParticles(w, h, n = 24) {
  particles = Array.from({ length: n }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.5 + Math.random() * 1.4,
    speed: 5 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 10,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.06 + Math.random() * 0.16,
  }));
}

export function drawAmbient(ctx, w, h) {
  const now = performance.now();
  if (!particles) initParticles(w, h);
  const dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 0;
  lastT = now;

  // Base vertical wash
  ctx.fillStyle = vGradient(ctx, 0, 0, h, rgb(theme.bgTop), rgb(theme.bg));
  ctx.fillRect(0, 0, w, h);

  // Soft warm spotlight, upper third
  const rad = ctx.createRadialGradient(w / 2, h * 0.16, 4, w / 2, h * 0.16, w * 0.95);
  rad.addColorStop(0, 'rgba(214,163,84,0.07)');
  rad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, w, h);

  // Drifting motes
  ctx.save();
  for (const p of particles) {
    p.y -= p.speed * dt;
    p.phase += dt * 0.6;
    p.x += Math.sin(p.phase) * p.drift * dt;
    if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
    if (p.x < -8) p.x = w + 8;
    if (p.x > w + 8) p.x = -8;
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = rgb(theme.goldBright);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.32, w / 2, h / 2, h * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

// A gentle sine pulse in [0,1], for glowing rings / breathing highlights.
export function pulse(period = 2.2) {
  return 0.5 + 0.5 * Math.sin(performance.now() / 1000 * (Math.PI * 2 / period));
}
