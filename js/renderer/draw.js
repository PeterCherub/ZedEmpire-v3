// js/renderer/draw.js
// Originally an exact port of ui/draw.lua; now layered with gradient
// fills, glow, a display font, and an animated ambient background
// (js/renderer/fx.js) for a modern, eye-catching presentation. All
// original function signatures are kept intact so main.js / the rest
// of the UI layer didn't need to change shape.

import { theme } from '../theme.js';
import fonts from '../fonts.js';
import * as fx from './fx.js';

const statOrder = ["food", "money", "reputation", "skill", "security", "territory"];
const statLabels = {
  food: "Food",
  money: "Money",
  reputation: "Reputation",
  skill: "Skill",
  security: "Security",
  territory: "Territory",
};

// Icon cache
const icons = {};

export function loadIcons() {
  const iconPaths = {
    food: "assets/icons/food.png",
    money: "assets/icons/money.png",
    reputation: "assets/icons/reputation.png",
    skill: "assets/icons/skill.png",
    security: "assets/icons/security.png",
    territory: "assets/icons/territory.png",
  };
  for (const [key, path] of Object.entries(iconPaths)) {
    const img = new Image();
    img.src = path;
    img.onload = () => { icons[key] = img; };
    img.onerror = () => {
      console.warn(`Could not load icon: ${path}`);
    };
  }
}

// Animated gradient wash + drifting motes + vignette, instead of a
// flat fill. Every screen calls this first, so it's the single
// biggest driver of the new "premium" feel.
export function background(ctx, w, h) {
  fx.drawAmbient(ctx, w, h);
}

export function ledger(ctx, state, x, y, width) {
  const gold = theme.gold;
  const cream = theme.cream;
  const creamDim = theme.creamDim;

  fx.glowPanel(ctx, x, y, width, 92, 10, {
    top: fx.rgb(theme.ledgerBg, 0.97),
    bottom: fx.rgb(fx.darken(theme.ledgerBg, 0.03), 0.97),
    border: fx.rgb(theme.panelBorder, 0.55),
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowBlur: 16,
  });

  // Divider, with a soft gold glow line under it
  ctx.fillStyle = fx.rgb(theme.divider, 0.9);
  ctx.fillRect(x + 10, y + 90, width - 20, 1.5);

  // Title, glowing display font
  ctx.save();
  ctx.shadowColor = fx.rgb(theme.gold, 0.6);
  ctx.shadowBlur = 8;
  ctx.fillStyle = fx.rgb(theme.goldBright);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fonts.getDisplay(13, 700);
  ctx.fillText("ZED EMPIRE", x + 14, y + 9);
  ctx.restore();

  // Stage name
  ctx.fillStyle = fx.rgb(creamDim);
  ctx.textAlign = 'right';
  ctx.font = '11px "DejaVu Sans", sans-serif';
  ctx.fillText(state.stageName, x + width - 14, y + 9);

  // Stats
  const colWidth = width / 3;
  const iconSize = 20;

  for (let i = 0; i < statOrder.length; i++) {
    const key = statOrder[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const sx = x + 14 + col * colWidth;
    const sy = y + 34 + row * 26;
    const value = state.stats[key];
    const valueText = key === "money" ? `K${value}` : String(value);

    let color;
    let critical = false;
    if (key === "money" && value < 0) {
      color = theme.red; critical = true;
    } else if (key !== "money" && value <= 5) {
      color = theme.redSoft; critical = true;
    } else if (key === "money") {
      color = theme.goldBright;
    } else {
      color = theme.cream;
    }

    let textX = sx;
    const icon = icons[key];
    if (icon && icon.complete) {
      if (critical) {
        // Pulsing red halo behind at-risk stat icons -- draws the eye
        // to what needs attention without any extra text.
        const p = fx.pulse(1.4);
        ctx.save();
        ctx.globalAlpha = 0.25 + 0.25 * p;
        ctx.fillStyle = fx.rgb(theme.red);
        ctx.beginPath();
        ctx.arc(sx + iconSize / 2, sy - 3 + iconSize / 2, iconSize / 2 + 3 + p * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.drawImage(icon, sx, sy - 3, iconSize, iconSize);
      textX = sx + iconSize + 6;
    } else {
      ctx.fillStyle = fx.rgb(color);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '12px "DejaVu Sans", sans-serif';
      ctx.fillText(statLabels[key].substring(0, 1) + ":", sx, sy);
      textX = sx + 20;
    }

    ctx.fillStyle = fx.rgb(color);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '15px "DejaVu Sans", sans-serif';
    ctx.fillText(valueText, textX, sy - 1);
  }
}

// `entrance` (0..1, optional) drives a fade + slide-up when a fresh
// card is presented -- 1 means fully settled.
export function situationCard(ctx, text, x, y, width, height, entrance = 1) {
  const cream = theme.cream;
  const e = Math.max(0, Math.min(1, entrance));
  const ease = 1 - Math.pow(1 - e, 3);
  const yOff = (1 - ease) * 14;
  const alpha = 0.25 + 0.75 * ease;

  ctx.save();
  ctx.globalAlpha = alpha;

  fx.glowPanel(ctx, x, y + yOff, width, height, 12, {
    top: fx.rgb(theme.panelTop, 0.97),
    bottom: fx.rgb(theme.panel, 0.97),
    border: fx.rgb(theme.panelBorder, 0.6),
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowBlur: 20,
  });
  fx.techCorners(ctx, x, y + yOff, width, height, 14, fx.rgb(theme.accent, 0.35));

  ctx.fillStyle = fx.rgb(cream);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '17px "DejaVu Sans", sans-serif';
  wrapText(ctx, text, x + 18, y + yOff + 18, width - 36, 24);
  ctx.restore();
}

// Result text after a choice. Wraps and grows downward instead of
// squeezing everything onto one clipped line, and reports the total
// height it used so the caller can place whatever comes after it
// (e.g. the CONTINUE button) without the two colliding.
export function resultBanner(ctx, text, x, y, width) {
  const cream = theme.cream;
  const padX = 16;
  const padY = 14;
  const lineHeight = 20;
  const innerWidth = width - padX * 2;

  ctx.save();
  ctx.font = '14px "DejaVu Sans", sans-serif';
  ctx.textAlign = 'left';
  const lineCount = countWrappedLines(ctx, text, innerWidth);
  const height = padY * 2 + lineCount * lineHeight;

  fx.glowPanel(ctx, x, y, width, height, 8, {
    top: fx.rgb(fx.lighten(theme.green, 0.08), 0.95),
    bottom: fx.rgb(theme.greenDark, 0.95),
    border: fx.rgb(theme.greenBright, 0.5),
    shadowColor: fx.rgb(theme.green, 0.35),
    shadowBlur: 14,
  });

  ctx.fillStyle = fx.rgb(cream);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  wrapText(ctx, text, x + padX, y + padY, innerWidth, lineHeight);
  ctx.restore();

  return height;
}

// How many lines wrapText would produce for this text/width, without
// drawing anything -- lets resultBanner size itself before it draws.
function countWrappedLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  let line = '';
  let lines = 1;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      line = words[i] + ' ';
      lines += 1;
    } else {
      line = testLine;
    }
  }
  return lines;
}

export function centeredTitle(ctx, text, y, w) {
  ctx.save();
  ctx.shadowColor = fx.rgb(theme.gold, 0.55);
  ctx.shadowBlur = 12;
  ctx.fillStyle = fx.rgb(theme.goldBright);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = fonts.getDisplay(18, 700);
  ctx.fillText(text, w / 2, y);
  ctx.restore();
}

export function statChip(ctx, text, x, y, w) {
  const creamDim = theme.creamDim;

  fx.glowPanel(ctx, x, y, w, 24, 12, {
    top: fx.rgb(theme.panelTop, 0.9),
    bottom: fx.rgb(theme.panel, 0.9),
    border: fx.rgb(theme.panelBorder, 0.5),
    shadowBlur: 6,
    sheenAlpha: 0.05,
  });

  ctx.fillStyle = fx.rgb(creamDim);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '10px "DejaVu Sans", sans-serif';
  ctx.fillText(text, x + w / 2, y + 12);
}

// wrapText -- unchanged behavior, kept here since draw.js owns the
// canvas-has-no-printf text wrapping the README describes. Returns
// the y position just AFTER the last line drawn (i.e. one lineHeight
// past its baseline), so callers can position whatever comes next
// relative to how much space the text actually used instead of
// guessing with a fixed offset.
export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x + (ctx.textAlign === 'center' ? maxWidth / 2 : 0), curY, maxWidth);
      line = words[i] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x + (ctx.textAlign === 'center' ? maxWidth / 2 : 0), curY, maxWidth);
  return curY + lineHeight;
}
