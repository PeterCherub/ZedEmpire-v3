// js/ui/Button.js
// Originally an exact port of ui/button.lua; now draws a gradient fill,
// a hover glow, a top sheen highlight, and a real "depress" animation
// on press instead of a flat color + darken. Also resolves string
// color names (e.g. "gold", "panel") against the theme -- some call
// sites in main.js pass names instead of [r,g,b] triplets, which
// previously produced invalid CSS colors (NaN channels) and silently
// mis-rendered the BANK / SHOP / MAP buttons.

import { theme } from '../theme.js';
import * as fx from '../renderer/fx.js';

export class Button {
  constructor(x, y, w, h, label, opts = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.color = fx.resolveColor(opts.color, theme.gold);
    this.textColor = fx.resolveColor(opts.textColor, theme.dark);
    this.disabled = opts.disabled || false;
    this.disabledLabel = opts.disabledLabel;
    this.radius = opts.radius || 6;
    this.hover = false;
    this.pressFlash = 0;
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (disabled) this.hover = false;
  }

  setLabel(label) {
    this.label = label;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.w &&
           py >= this.y && py <= this.y + this.h;
  }

  update(dt) {
    if (this.pressFlash > 0) {
      this.pressFlash = Math.max(0, this.pressFlash - dt / 0.12);
    }
  }

  mousemoved(px, py) {
    this.hover = (!this.disabled) && this.contains(px, py);
  }

  // Returns true if this click hit the button (and isn't disabled).
  click(px, py) {
    if (this.disabled) return false;
    if (this.contains(px, py)) {
      this.pressFlash = 1;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const base = this.disabled ? theme.disabled : this.color;
    const press = this.pressFlash;
    const yOff = press * 2; // physically "depresses" on tap

    let top = fx.lighten(base, this.hover && !this.disabled ? 0.20 : 0.12);
    let bottom = fx.darken(base, this.hover && !this.disabled ? 0.02 : 0.08);
    if (press > 0) {
      top = fx.darken(top, press * 0.16);
      bottom = fx.darken(bottom, press * 0.16);
    }

    ctx.save();
    if (!this.disabled) {
      ctx.shadowColor = this.hover ? fx.rgb(base, 0.55) : 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = this.hover ? 16 : 6;
    }
    fx.roundRectPath(ctx, this.x, this.y + yOff, this.w, this.h, this.radius);
    ctx.fillStyle = fx.vGradient(ctx, this.x, this.y + yOff, this.h, fx.rgb(top), fx.rgb(bottom));
    ctx.fill();
    ctx.restore();

    // Top sheen highlight
    ctx.save();
    fx.roundRectPath(ctx, this.x, this.y + yOff, this.w, this.h, this.radius);
    ctx.clip();
    const sheen = ctx.createLinearGradient(this.x, this.y + yOff, this.x, this.y + yOff + this.h * 0.6);
    sheen.addColorStop(0, `rgba(255,255,255,${this.disabled ? 0.04 : 0.18})`);
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(this.x, this.y + yOff, this.w, this.h * 0.6);
    ctx.restore();

    // Border
    ctx.strokeStyle = this.disabled ? 'rgba(255,255,255,0.06)' : fx.rgb(fx.lighten(base, 0.25), 0.55);
    ctx.lineWidth = 1;
    fx.roundRectPath(ctx, this.x, this.y + yOff, this.w, this.h, this.radius);
    ctx.stroke();

    const textColor = this.disabled ? theme.disabledText : this.textColor;
    ctx.fillStyle = fx.rgb(textColor);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = this.disabled ? (this.disabledLabel || this.label) : this.label;
    ctx.font = '14px "DejaVu Sans", sans-serif';
    ctx.fillText(label, this.x + this.w / 2, this.y + yOff + this.h / 2);
  }
}
