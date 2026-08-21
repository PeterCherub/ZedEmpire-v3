// js/ui/Slider.js
// Originally an exact port of ui/slider.lua; now a gradient track with
// glowing left/right tint and a gradient, glowing knob so the game's
// signature interaction feels as polished as everything around it.

import { theme } from '../theme.js';
import * as fx from '../renderer/fx.js';

export class Slider {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.knobRadius = height / 2 + 4;
    this.centerX = x + width / 2;
    this.centerY = y + height / 2;
    this.maxOffset = width / 2 - this.knobRadius;

    this.offset = 0;
    this.dragging = false;
    this.dragStartMouseX = 0;
    this.dragStartOffset = 0;

    this.threshold = 0.62;
  }

  reset() {
    this.offset = 0;
    this.dragging = false;
  }

  knobX() {
    return this.centerX + this.offset;
  }

  containsPoint(px, py) {
    const dx = px - this.knobX();
    const dy = py - this.centerY;
    return (dx * dx + dy * dy) <= (this.knobRadius * this.knobRadius);
  }

  mousepressed(px, py) {
    if (this.containsPoint(px, py)) {
      this.dragging = true;
      this.dragStartMouseX = px;
      this.dragStartOffset = this.offset;
    }
  }

  mousemoved(px, py) {
    if (!this.dragging) return;
    const delta = px - this.dragStartMouseX;
    let newOffset = this.dragStartOffset + delta;
    if (newOffset < -this.maxOffset) newOffset = -this.maxOffset;
    if (newOffset > this.maxOffset) newOffset = this.maxOffset;
    this.offset = newOffset;
  }

  // Returns "left", "right", or null (snap back, no choice made)
  mousereleased() {
    if (!this.dragging) return null;
    this.dragging = false;

    const frac = this.offset / this.maxOffset;
    let result = null;
    if (frac <= -this.threshold) {
      result = "left";
    } else if (frac >= this.threshold) {
      result = "right";
    }

    this.offset = 0;
    return result;
  }

  draw(ctx, leftLabel, rightLabel) {
    // Track
    fx.glowPanel(ctx, this.x, this.y, this.width, this.height, this.height / 2, {
      top: fx.rgb(fx.lighten(theme.bg, 0.02)),
      bottom: fx.rgb(theme.bg),
      border: fx.rgb(theme.panelBorder, 0.55),
      shadowColor: 'rgba(0,0,0,0.35)',
      shadowBlur: 8,
      sheenAlpha: 0.04,
    });

    // Tint the half being dragged toward, with a soft edge glow
    const pull = Math.abs(this.offset) / this.maxOffset;
    if (this.offset < -6) {
      ctx.save();
      fx.roundRectPath(ctx, this.x, this.y, this.width, this.height, this.height / 2);
      ctx.clip();
      ctx.fillStyle = fx.rgb(theme.greenBright, 0.15 + pull * 0.35);
      ctx.fillRect(this.x, this.y, this.width / 2, this.height);
      ctx.restore();
    } else if (this.offset > 6) {
      ctx.save();
      fx.roundRectPath(ctx, this.x, this.y, this.width, this.height, this.height / 2);
      ctx.clip();
      ctx.fillStyle = fx.rgb(theme.redSoft, 0.15 + pull * 0.35);
      ctx.fillRect(this.centerX, this.y, this.width / 2, this.height);
      ctx.restore();
    }

    // Labels
    ctx.fillStyle = fx.rgb(theme.cream);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.font = '12px "DejaVu Sans", sans-serif';
    ctx.fillText(leftLabel, this.x, this.y - 4);
    ctx.textAlign = 'right';
    ctx.fillText(rightLabel, this.x + this.width, this.y - 4);

    // Knob -- gradient fill + glow
    const kx = this.knobX();
    const ky = this.centerY;

    ctx.save();
    ctx.shadowColor = fx.rgb(theme.gold, 0.55);
    ctx.shadowBlur = this.dragging ? 16 : 9;
    const g = ctx.createRadialGradient(kx - 3, ky - 3, 1, kx, ky, this.knobRadius);
    g.addColorStop(0, fx.rgb(theme.goldBright));
    g.addColorStop(1, fx.rgb(fx.darken(theme.gold, 0.08)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(kx, ky, this.knobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = fx.rgb(theme.divider);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kx, ky, this.knobRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Knob center dot
    ctx.fillStyle = fx.rgb(theme.dark);
    ctx.beginPath();
    ctx.arc(kx, ky, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
