// js/ui/Panel.js
// Originally an exact port of ui/panel.lua; now a gradient-filled,
// glowing "glass" panel with tech-corner framing and a display-font
// title, plus a vignette backdrop instead of a flat dim. Shop, Bank
// and Settings all build on this, so the upgrade cascades to them
// automatically.

import { theme } from '../theme.js';
import { Button } from './Button.js';
import * as fx from '../renderer/fx.js';

export class Panel {
  constructor(x, y, w, h, title) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = title;
    this.closeBtn = new Button(x + w - 44, y + 10, 34, 34, "X", {
      color: theme.red,
      textColor: theme.white,
      radius: 6,
    });
  }

  update(dt) {
    this.closeBtn.update(dt);
  }

  mousemoved(px, py) {
    this.closeBtn.mousemoved(px, py);
  }

  // Returns true if the close X was clicked.
  clickClose(px, py) {
    return this.closeBtn.click(px, py);
  }

  drawBackdrop(ctx, screenW, screenH) {
    // Radial dim instead of a flat scrim -- keeps focus on the panel
    // itself rather than flattening the whole screen to one color.
    const vg = ctx.createRadialGradient(
      screenW / 2, screenH / 2, screenH * 0.15,
      screenW / 2, screenH / 2, screenH * 0.85
    );
    vg.addColorStop(0, fx.rgb(theme.bg, 0.72));
    vg.addColorStop(1, fx.rgb(theme.bg, 0.9));
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, screenW, screenH);
  }

  drawFrame(ctx) {
    fx.glowPanel(ctx, this.x, this.y, this.w, this.h, 12, {
      top: fx.rgb(theme.panelTop, 0.98),
      bottom: fx.rgb(theme.panel, 0.98),
      border: fx.rgb(theme.panelBorder, 0.65),
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 26,
    });
    fx.techCorners(ctx, this.x, this.y, this.w, this.h, 16, fx.rgb(theme.accent, 0.4));

    // Title, glowing display font
    ctx.save();
    ctx.shadowColor = fx.rgb(theme.gold, 0.55);
    ctx.shadowBlur = 10;
    ctx.fillStyle = fx.rgb(theme.goldBright);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 17px Orbitron, "DejaVu Sans", sans-serif';
    ctx.fillText(this.title, this.x + this.w / 2, this.y + 16 + 9);
    ctx.restore();

    // Thin accent underline beneath the title
    ctx.fillStyle = fx.rgb(theme.accent, 0.4);
    ctx.fillRect(this.x + this.w / 2 - 24, this.y + 40, 48, 1.5);

    this.closeBtn.draw(ctx);
  }
}
