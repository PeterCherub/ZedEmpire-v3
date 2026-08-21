// js/ui/Shop.js
// Exact port of ui/shop.lua

import { theme } from '../theme.js';
import { Button } from './Button.js';
import { Panel } from './Panel.js';

export class Shop {
  constructor(W) {
    this.W = W;
    this.active = false;
    this.message = "";
    this.messageTimer = 0;

    const panelW = 380;
    const panelH = 360;
    const panelX = (W - panelW) / 2;
    const panelY = 190;
    this.panel = new Panel(panelX, panelY, panelW, panelH, "SHOP");

    const BTN_W = 340;
    const BTN_H = 44;
    const GAP = 12;
    const bx = W / 2 - BTN_W / 2;
    const by = panelY + 135;

    this.foodBtn = new Button(bx, by, BTN_W, BTN_H, "Buy Food (K10 = +5F)", { color: theme.green, textColor: theme.white });
    this.territoryBtn = new Button(bx, by + BTN_H + GAP, BTN_W, BTN_H, "Buy Territory (K300 = +0.5T)", { color: theme.green, textColor: theme.white });
    this.securityBtn = new Button(bx, by + (BTN_H + GAP) * 2, BTN_W, BTN_H, "Buy Security (K10 = +1S)", { color: theme.green, textColor: theme.white });
  }

  buyFood(state) {
    if (state.stats.money < 0) {
      this.message = "You are in debt! Pay it back first.";
      this.messageTimer = 2;
      return;
    }
    if (state.stats.money >= 10) {
      state.stats.money -= 10;
      state.stats.food += 5;
      this.message = "Bought 5 Food for K10.";
    } else {
      this.message = "Not enough money! Need K10.";
    }
    this.messageTimer = 2;
  }

  buyTerritory(state) {
    if (state.stats.money < 0) {
      this.message = "You are in debt! Pay it back first.";
      this.messageTimer = 2;
      return;
    }
    if (state.stats.money >= 300) {
      state.stats.money -= 300;
      state.stats.territory += 0.5;
      this.message = "Bought 0.5 Territory for K300.";
    } else {
      this.message = "Not enough money! Need K300.";
    }
    this.messageTimer = 2;
  }

  buySecurity(state) {
    if (state.stats.money < 0) {
      this.message = "You are in debt! Pay it back first.";
      this.messageTimer = 2;
      return;
    }
    if (state.stats.money >= 10) {
      state.stats.money -= 10;
      state.stats.security += 1;
      this.message = "Bought 1 Security for K10.";
    } else {
      this.message = "Not enough money! Need K10.";
    }
    this.messageTimer = 2;
  }

  buttons() {
    return [this.panel.closeBtn, this.foodBtn, this.territoryBtn, this.securityBtn];
  }

  update(dt, state) {
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }
    if (state) {
      const inDebt = state.stats.money < 0;
      this.foodBtn.setDisabled(inDebt);
      this.territoryBtn.setDisabled(inDebt);
      this.securityBtn.setDisabled(inDebt);
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
    if (this.foodBtn.click(x, y)) { this.buyFood(state); return true; }
    if (this.territoryBtn.click(x, y)) { this.buyTerritory(state); return true; }
    if (this.securityBtn.click(x, y)) { this.buySecurity(state); return true; }
    return false;
  }

  draw(ctx, state) {
    this.panel.drawBackdrop(ctx, this.W, 720);
    this.panel.drawFrame(ctx);

    const inDebt = state.stats.money < 0;

    ctx.fillStyle = inDebt ? `rgb(${theme.redSoft[0]*255}, ${theme.redSoft[1]*255}, ${theme.redSoft[2]*255})` : `rgb(${theme.cream[0]*255}, ${theme.cream[1]*255}, ${theme.cream[2]*255})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '14px "DejaVu Sans", sans-serif';
    ctx.fillText(`Money: K${state.stats.money}`, this.panel.x + this.panel.w / 2, this.panel.y + 45);

    ctx.fillStyle = `rgb(${theme.cream[0]*255}, ${theme.cream[1]*255}, ${theme.cream[2]*255})`;
    ctx.fillText(`Food: ${state.stats.food}`, this.panel.x + this.panel.w / 2, this.panel.y + 65);
    ctx.fillText(`Security: ${state.stats.security}`, this.panel.x + this.panel.w / 2, this.panel.y + 85);

    if (inDebt) {
      ctx.fillStyle = `rgb(${theme.red[0]*255}, ${theme.red[1]*255}, ${theme.red[2]*255})`;
      ctx.fillText("YOU ARE IN DEBT! NO PURCHASES ALLOWED", this.panel.x + this.panel.w / 2, this.panel.y + 110);
    }

    this.foodBtn.draw(ctx);
    this.territoryBtn.draw(ctx);
    this.securityBtn.draw(ctx);

    if (this.messageTimer > 0) {
      ctx.fillStyle = `rgb(${theme.cream[0]*255}, ${theme.cream[1]*255}, ${theme.cream[2]*255})`;
      ctx.fillText(this.message, this.panel.x + this.panel.w / 2, this.panel.y + this.panel.h - 40);
    }
  }
}
