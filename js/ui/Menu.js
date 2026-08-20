// js/ui/Menu.js
// Originally an exact port of ui/menu.lua; now the game's showcase
// screen -- a pulsing glow-ringed emblem, a glowing display-font
// title, and an explicit "built with" tech badge so the modern stack
// underneath is visible on the very first screen a player sees.

import { theme } from '../theme.js';
import { Button } from './Button.js';
import * as fx from '../renderer/fx.js';

export class Menu {
  constructor(W) {
    this.W = W;
    const BTN_W = 190;
    const BTN_H = 42;
    const GAP = 12;
    const x = W / 2 - BTN_W / 2;
    let y = 330;

    this.loadBtn = new Button(x, y, BTN_W, BTN_H, "LOAD GAME", { color: theme.green, textColor: theme.white });
    y += BTN_H + GAP;
    this.newBtn = new Button(x, y, BTN_W, BTN_H, "NEW GAME", { color: theme.gold });
    y += BTN_H + GAP;
    this.howToPlayBtn = new Button(x, y, BTN_W, BTN_H, "HOW TO PLAY", { color: theme.panel, textColor: theme.gold });
    y += BTN_H + GAP;
    this.hallOfFameBtn = new Button(x, y, BTN_W, BTN_H, "HALL OF FAME", { color: theme.panel, textColor: theme.gold });
    y += BTN_H + GAP;
    this.settingsBtn = new Button(x, y, BTN_W, BTN_H, "SETTINGS", { color: theme.red, textColor: theme.white });
  }

  buttons() {
    return [this.loadBtn, this.newBtn, this.howToPlayBtn, this.hallOfFameBtn, this.settingsBtn];
  }

  update(dt, hasSave) {
    this.loadBtn.setDisabled(!hasSave);
    this.loadBtn.setLabel(hasSave ? "LOAD GAME" : "NO SAVE");
    for (const b of this.buttons()) b.update(dt);
  }

  mousemoved(x, y) {
    for (const b of this.buttons()) b.mousemoved(x, y);
  }

  // Returns "load" | "new" | "howToPlay" | "hallOfFame" | "settings" | null
  mousepressed(x, y) {
    if (this.loadBtn.click(x, y)) return "load";
    if (this.newBtn.click(x, y)) return "new";
    if (this.howToPlayBtn.click(x, y)) return "howToPlay";
    if (this.hallOfFameBtn.click(x, y)) return "hallOfFame";
    if (this.settingsBtn.click(x, y)) return "settings";
    return null;
  }

  draw(ctx) {
    const W = this.W;
    const gold = theme.gold;
    const creamDim = theme.creamDim;
    const p = fx.pulse(2.6);

    // Emblem -- concentric glow rings that slowly breathe
    ctx.save();
    ctx.translate(W / 2, 116);

    ctx.globalAlpha = 0.10 + 0.05 * p;
    ctx.fillStyle = fx.rgb(theme.goldBright);
    ctx.beginPath();
    ctx.arc(0, 0, 52 + p * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.75;
    ctx.shadowColor = fx.rgb(theme.gold, 0.7);
    ctx.shadowBlur = 14;
    ctx.strokeStyle = fx.rgb(theme.goldBright);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = fx.rgb(theme.accent, 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = fx.rgb(theme.goldBright);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-23, 0);
    ctx.lineTo(23, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -23);
    ctx.lineTo(0, 23);
    ctx.stroke();
    ctx.restore();

    // Title -- glowing display font
    ctx.save();
    ctx.shadowColor = fx.rgb(theme.gold, 0.65);
    ctx.shadowBlur = 22;
    ctx.fillStyle = fx.rgb(theme.goldBright);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '900 40px Orbitron, "DejaVu Sans", sans-serif';
    ctx.fillText("ZED EMPIRE", W / 2, 168);
    ctx.restore();

    // Subtitle
    ctx.fillStyle = fx.rgb(creamDim);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '11px "DejaVu Sans", sans-serif';
    ctx.fillText("A Zambian story of survival, choices and ambition.", W / 2, 222);

    // Divider
    ctx.fillStyle = fx.rgb(theme.panelBorder, 0.8);
    ctx.fillRect(100, 252, 220, 1);
    ctx.fillStyle = fx.rgb(theme.accentBright, 0.7);
    ctx.fillRect(178, 252, 64, 1.5);

    // "Built with modern tech" badge -- a small pill, not a claim
    // buried in the README the player never opens.
    const badgeText = "⚡  ONE CHOICE  ·  SHAPE OUR  ·  FUTURE";
    ctx.font = '9.5px "DejaVu Sans", sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 28;
    fx.glowPanel(ctx, W / 2 - badgeW / 2, 270, badgeW, 22, 11, {
      top: fx.rgb(theme.panelTop, 0.85),
      bottom: fx.rgb(theme.panel, 0.85),
      border: fx.rgb(theme.accent, 0.55),
      shadowColor: fx.rgb(theme.accent, 0.25),
      shadowBlur: 10,
      sheenAlpha: 0.05,
    });
    ctx.fillStyle = fx.rgb(theme.accentBright);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, W / 2, 281);

    // Buttons
    for (const b of this.buttons()) b.draw(ctx);

    // Footer
    ctx.fillStyle = fx.rgb(theme.muted);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '9px "DejaVu Sans", sans-serif';
    ctx.fillText("YOUR CHOICES SHAPE THE EMPIRE", W / 2, 632);
    ctx.fillText("v0.4  •  ZAMBIA EDITION", W / 2, 650);
  }
}
