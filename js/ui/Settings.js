// js/ui/Settings.js
// Exact port of ui/settings.lua

import { theme } from '../theme.js';
import { Button } from './Button.js';
import { Panel } from './Panel.js';

export class Settings {
  constructor(W) {
    this.W = W;
    const BTN_W = 190;
    const BTN_H = 46;
    const GAP = 14;
    const panelW = 380;
    const panelH = 470;
    const panelX = (W - panelW) / 2;
    const panelY = 190;
    this.panel = new Panel(panelX, panelY, panelW, panelH, "SETTINGS");

    const bx = W / 2 - BTN_W / 2;
    let by = panelY + 80;

    this.quitBtn = new Button(bx, by, BTN_W, BTN_H, "QUIT GAME", { color: theme.red, textColor: theme.white });
    by += BTN_H + GAP;
    this.resetBtn = new Button(bx, by, BTN_W, BTN_H, "RESET GAME", { color: theme.redSoft, textColor: theme.white });
    by += BTN_H + GAP;
    this.menuBtn = new Button(bx, by, BTN_W, BTN_H, "MAIN MENU", { color: theme.green, textColor: theme.white });
    by += BTN_H + GAP;
    this.soundBtn = new Button(bx, by, BTN_W, BTN_H, "SOUND: ON", { color: theme.panel, textColor: theme.gold });
    by += BTN_H + GAP;
    this.howToPlayBtn = new Button(bx, by, BTN_W, BTN_H, "HOW TO PLAY", { color: theme.panel, textColor: theme.gold });
    by += BTN_H + GAP;
    this.feedbackBtn = new Button(bx, by, BTN_W, BTN_H, "SEND FEEDBACK", { color: theme.panel, textColor: theme.gold });

    this.confirmingReset = false;
    this.confirmTimer = 0;
  }

  reset() {
    this.confirmingReset = false;
    this.confirmTimer = 0;
  }

  buttons() {
    return [this.panel.closeBtn, this.quitBtn, this.resetBtn, this.menuBtn, this.soundBtn, this.howToPlayBtn, this.feedbackBtn];
  }

  update(dt) {
    for (const b of this.buttons()) b.update(dt);
    if (this.confirmingReset) {
      this.confirmTimer -= dt;
      if (this.confirmTimer <= 0) {
        this.confirmingReset = false;
        this.resetBtn.setLabel("RESET GAME");
      }
    }
  }

  mousemoved(x, y) {
    for (const b of this.buttons()) b.mousemoved(x, y);
  }

  // Returns "close" | "quit" | "reset" | "menu" | null
  // "reset" is only returned on the SECOND click (confirm step).
  mousepressed(x, y) {
    if (this.panel.clickClose(x, y)) {
      this.reset();
      return "close";
    }
    if (this.quitBtn.click(x, y)) {
      return "quit";
    }

    if (this.resetBtn.click(x, y)) {
      if (this.confirmingReset) {
        this.reset();
        return "reset";
      } else {
        this.confirmingReset = true;
        this.confirmTimer = 3;
        this.resetBtn.setLabel("TAP AGAIN TO CONFIRM");
        return null;
      }
    }

    if (this.menuBtn.click(x, y)) {
      this.reset();
      return "menu";
    }

    if (this.soundBtn.click(x, y)) {
      // Toggle sound handled by audio.js
      this.soundBtn.setLabel(this.soundBtn.label === "SOUND: ON" ? "SOUND: OFF" : "SOUND: ON");
      return "toggleSound";
    }
    if (this.howToPlayBtn.click(x, y)) {
      return "howToPlay";
    }
    if (this.feedbackBtn.click(x, y)) {
      return "feedback";
    }
    return null;
  }

  draw(ctx) {
    this.panel.drawBackdrop(ctx, this.W, 720);
    this.panel.drawFrame(ctx);
    this.quitBtn.draw(ctx);
    this.resetBtn.draw(ctx);
    this.menuBtn.draw(ctx);
    this.soundBtn.draw(ctx);
    this.howToPlayBtn.draw(ctx);
    this.feedbackBtn.draw(ctx);

    if (this.confirmingReset) {
      ctx.fillStyle = `rgb(${theme.creamDim[0]*255}, ${theme.creamDim[1]*255}, ${theme.creamDim[2]*255})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '12px "DejaVu Sans", sans-serif';
      ctx.fillText(
        "This deletes your save. Tap Reset again to confirm.",
        this.panel.x + this.panel.w / 2,
        this.feedbackBtn.y + this.feedbackBtn.h + 14
      );
    }
  }
}
