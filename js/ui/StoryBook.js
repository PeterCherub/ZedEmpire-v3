// js/ui/StoryBook.js
// Shows the player's run back to them as a story: one page per choice,
// in the order they made it. Opened from the Game Over / Game Complete
// screens via a "MY STORY" button, reading player.history (built up in
// main.js commitChoice() via player.recordChoice()).

import { theme } from '../theme.js';
import { Button } from './Button.js';
import { Panel } from './Panel.js';
import { wrapText } from '../renderer/draw.js';

const PER_PAGE = 3;

export class StoryBook {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.page = 0;
    this.entries = [];

    const panelW = 380;
    const panelH = 560;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2 - 20;
    this.panel = new Panel(panelX, panelY, panelW, panelH, 'YOUR STORY');

    const NAV_W = 110;
    const NAV_H = 40;
    const navY = panelY + panelH - NAV_H - 18;

    this.prevBtn = new Button(panelX + 18, navY, NAV_W, NAV_H, '< BACK', { color: theme.panel, textColor: theme.gold });
    this.nextBtn = new Button(panelX + panelW - NAV_W - 18, navY, NAV_W, NAV_H, 'NEXT >', { color: theme.gold, textColor: theme.dark });
  }

  open(history) {
    this.entries = Array.isArray(history) ? history : [];
    this.page = 0;
  }

  pageCount() {
    return Math.max(1, Math.ceil(this.entries.length / PER_PAGE));
  }

  reset() {
    this.page = 0;
  }

  buttons() {
    return [this.panel.closeBtn, this.prevBtn, this.nextBtn];
  }

  update(dt) {
    this.prevBtn.setDisabled(this.page === 0);
    this.nextBtn.setDisabled(this.page >= this.pageCount() - 1);
    for (const b of this.buttons()) b.update(dt);
  }

  mousemoved(x, y) {
    for (const b of this.buttons()) b.mousemoved(x, y);
  }

  mousepressed(x, y) {
    if (this.panel.clickClose(x, y)) {
      this.reset();
      return 'close';
    }
    if (this.prevBtn.click(x, y)) {
      if (this.page > 0) this.page -= 1;
      return 'prev';
    }
    if (this.nextBtn.click(x, y)) {
      if (this.page < this.pageCount() - 1) this.page += 1;
      return 'next';
    }
    return null;
  }

  draw(ctx) {
    this.panel.drawBackdrop(ctx, this.W, this.H);
    this.panel.drawFrame(ctx);

    const innerX = this.panel.x + 22;
    const innerW = this.panel.w - 44;
    let y = this.panel.y + 54;

    if (this.entries.length === 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '12px "DejaVu Sans", sans-serif';
      ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
      ctx.fillText('No choices recorded for this run yet.', this.panel.x + this.panel.w / 2, y + 20);
    } else {
      const start = this.page * PER_PAGE;
      const slice = this.entries.slice(start, start + PER_PAGE);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const entry of slice) {
        ctx.font = '700 12px "DejaVu Sans", sans-serif';
        ctx.fillStyle = `rgb(${theme.goldBright[0] * 255}, ${theme.goldBright[1] * 255}, ${theme.goldBright[2] * 255})`;
        ctx.fillText(`Chapter ${entry.chapter} \u2014 ${entry.province}, Day ${entry.day}`, innerX, y);
        y += 20;

        ctx.font = 'italic 11px "DejaVu Sans", sans-serif';
        ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
        y = wrapText(ctx, entry.situation, innerX, y, innerW, 15) + 8;

        ctx.font = '700 11px "DejaVu Sans", sans-serif';
        ctx.fillStyle = `rgb(${theme.cream[0] * 255}, ${theme.cream[1] * 255}, ${theme.cream[2] * 255})`;
        y = wrapText(ctx, `You chose: ${entry.choiceLabel}`, innerX, y, innerW, 15) + 4;

        ctx.font = '11px "DejaVu Sans", sans-serif';
        ctx.fillStyle = `rgb(${theme.cream[0] * 255}, ${theme.cream[1] * 255}, ${theme.cream[2] * 255})`;
        y = wrapText(ctx, entry.result, innerX, y, innerW, 15) + 22;
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
    ctx.font = '11px "DejaVu Sans", sans-serif';
    ctx.fillText(`${this.page + 1} / ${this.pageCount()}`, this.panel.x + this.panel.w / 2, this.prevBtn.y + 13);

    this.prevBtn.draw(ctx);
    this.nextBtn.draw(ctx);
  }
}
