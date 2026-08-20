// js/ui/Bank.js
// Exact port of ui/bank.lua

import { theme } from '../theme.js';
import { Button } from './Button.js';
import { Panel } from './Panel.js';

export class Bank {
  constructor(W) {
    this.W = W;
    this.active = false;
    this.savings = 0;
    this.message = "";
    this.messageTimer = 0;

    const panelW = 380;
    const panelH = 320;
    const panelX = (W - panelW) / 2;
    const panelY = 190;
    this.panel = new Panel(panelX, panelY, panelW, panelH, "BANK");

    const BTN_W = 260;
    const BTN_H = 44;
    const GAP = 12;
    const bx = W / 2 - BTN_W / 2;
    const by = panelY + 110;

    this.depositBtn = new Button(bx, by, BTN_W, BTN_H, "Deposit All (Min K20)", { color: theme.green, textColor: theme.white });
    this.withdrawBtn = new Button(bx, by + BTN_H + GAP, BTN_W, BTN_H, "Withdraw K20", { color: theme.green, textColor: theme.white });
  }

  deposit(state) {
    if (state.stats.money < 0) {
      this.message = "You are in debt! Pay creditors first.";
      this.messageTimer = 2;
      return;
    }
    if (state.stats.money >= 20) {
      this.savings += state.stats.money;
      this.message = `Deposited K${state.stats.money} into savings.`;
      state.stats.money = 0;
    } else {
      this.message = "Minimum deposit is K20.";
    }
    this.messageTimer = 2;
  }

  withdraw(state) {
    if (state.stats.money < 0) {
      this.message = "You are in debt! Pay creditors first.";
      this.messageTimer = 2;
      return;
    }
    if (this.savings >= 20) {
      state.stats.money += 20;
      this.savings -= 20;
      this.message = "Withdrew K20 from savings.";
    } else {
      this.message = "Insufficient savings. Need at least K20.";
    }
    this.messageTimer = 2;
  }

  buttons() {
    return [this.panel.closeBtn, this.depositBtn, this.withdrawBtn];
  }

  update(dt, state) {
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }
    if (state) {
      const inDebt = state.stats.money < 0;
      this.depositBtn.setDisabled(inDebt);
      this.withdrawBtn.setDisabled(inDebt);
    }
    for (const b of this.buttons()) b.update(dt);
  }

  mousemoved(x, y) {
    for (const b of this.buttons()) b.mousemoved(x, y);
  }

  mousepressed(x, y, state) {
    if (this.panel.clickClose(x, y)) {
      this.active = false;
      return true;
    }
    if (this.depositBtn.click(x, y)) { this.deposit(state); return true; }
    if (this.withdrawBtn.click(x, y)) { this.withdraw(state); return true; }
    return false;
  }

  draw(ctx, state) {
    this.panel.drawBackdrop(ctx, this.W, 720);
    this.panel.drawFrame(ctx);

    ctx.fillStyle = `rgb(${theme.cream[0]*255}, ${theme.cream[1]*255}, ${theme.cream[2]*255})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '14px "DejaVu Sans", sans-serif';
    ctx.fillText(`Cash on hand: K${state.stats.money}`, this.panel.x + this.panel.w / 2, this.panel.y + 45);
    ctx.fillText(`Savings: K${this.savings}`, this.panel.x + this.panel.w / 2, this.panel.y + 65);

    if (state.stats.money < 0) {
      ctx.fillStyle = `rgb(${theme.red[0]*255}, ${theme.red[1]*255}, ${theme.red[2]*255})`;
      ctx.fillText(`DEBT: K${Math.abs(state.stats.money)}`, this.panel.x + this.panel.w / 2, this.panel.y + 85);
    }

    this.depositBtn.draw(ctx);
    this.withdrawBtn.draw(ctx);

    if (this.messageTimer > 0) {
      ctx.fillStyle = `rgb(${theme.cream[0]*255}, ${theme.cream[1]*255}, ${theme.cream[2]*255})`;
      ctx.fillText(this.message, this.panel.x + this.panel.w / 2, this.panel.y + this.panel.h - 40);
    }
  }
}
