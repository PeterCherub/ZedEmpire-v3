// js/ui/HowToPlay.js
// In-game rules reference. Built the same way as Settings/Shop/Bank:
// a Panel with buttons on top. Content is paginated (not scrolled) --
// this codebase has no scroll/drag-list primitive yet, and pagination
// reuses the Button component with zero new input handling.

import { theme } from '../theme.js';
import { Button } from './Button.js';
import { Panel } from './Panel.js';
import { wrapText } from '../renderer/draw.js';

const PAGES = [
  {
    title: 'THE BASICS',
    lines: [
      'You start on the streets of Lusaka with almost nothing, and travel through all 10 provinces of Zambia chapter by chapter.',
      'Each day you face one card: a situation with two choices. There is no single "right" answer -- every choice trades one thing for another.',
      'Six stats track your life -- Food, Security, Money, Reputation, Skill, Territory -- shown at the top of the screen at all times.',
      'Every choice changes some of these stats, and one in-game Day always passes per card.',
      'Some choices are remembered by the story and can come back to affect you many cards later, sometimes in a different chapter.',
    ],
  },
  {
    title: 'FOOD & SECURITY -- WHAT ENDS YOUR STORY',
    lines: [
      'Food and Security are your survival stats. If EITHER hits 0, your story ends there: 0 Food means you collapse from hunger, 0 Security means you have nothing left to protect yourself.',
      'Almost every choice costs some Food and/or Security, even the "safe" ones -- just getting through the day drains you a little.',
      'To refill them: some story choices restore Food or Security directly (a meal, a night indoors). Or visit the SHOP -- K10 buys +5 Food, K10 buys +1 Security.',
      'Keeping both stats high at once is expensive, so you will often have to choose which one to protect on a given day.',
    ],
  },
  {
    title: 'MONEY & DEBT',
    lines: [
      'Money (K, Kwacha) rises and falls with your choices -- jobs pay, purchases cost, scams and robberies drain it.',
      'Money CAN go negative. If it does, you are in DEBT -- the Shop and Bank both lock you out of purchases until you are back above K0.',
      'Debt is dangerous on its own: stay in debt for 2 days in a row and creditors catch up with you. Game over.',
      'The BANK protects money you are not using. Deposit All (minimum K20) moves cash into savings, safe from most in-story losses. Withdraw K20 at a time when you need cash again.',
    ],
  },
  {
    title: 'REPUTATION, SKILL & TERRITORY',
    lines: [
      'Reputation reflects how people in the story see you -- it rises for generosity and standing up for others, and falls for selfishness, scams, and getting caught.',
      'Skill builds from hard work and hands-on experience -- labor, trades, and tough situations you push through.',
      'Territory is your growing footprint. It mainly grows through the Shop (K300 = +0.5 Territory), though some story choices move it directly too.',
      'None of these three end your game the way Food and Security do -- think of them as your long-term standing, and Territory as where spare money goes once your immediate needs are covered.',
    ],
  },
  {
    title: 'LOSSES & SECOND CHANCES',
    lines: [
      'If your story ends -- Food or Security hits 0, an arrest goes badly, or debt catches up with you -- that is a LOSS. It is not necessarily the end of the whole game.',
      'Your FIRST loss is a SETBACK: you start over from Chapter 1 with fresh stats, but your Bank savings carry over.',
      'A SECOND loss gets you robbed: your Bank savings are emptied to K0 before you start over again.',
      'Finish all 10 chapters without losing to complete ZedEmpire.',
    ],
  },
];

export class HowToPlay {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.page = 0;

    const panelW = 380;
    const panelH = 560;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2 - 20;
    this.panel = new Panel(panelX, panelY, panelW, panelH, 'HOW TO PLAY');

    const NAV_W = 110;
    const NAV_H = 40;
    const navY = panelY + panelH - NAV_H - 18;

    this.prevBtn = new Button(panelX + 18, navY, NAV_W, NAV_H, '< BACK', { color: theme.panel, textColor: theme.gold });
    this.nextBtn = new Button(panelX + panelW - NAV_W - 18, navY, NAV_W, NAV_H, 'NEXT >', { color: theme.gold, textColor: theme.dark });
  }

  reset() {
    this.page = 0;
  }

  buttons() {
    return [this.panel.closeBtn, this.prevBtn, this.nextBtn];
  }

  update(dt) {
    this.prevBtn.setDisabled(this.page === 0);
    this.nextBtn.setDisabled(this.page === PAGES.length - 1);
    for (const b of this.buttons()) b.update(dt);
  }

  mousemoved(x, y) {
    for (const b of this.buttons()) b.mousemoved(x, y);
  }

  // Returns "close" | "prev" | "next" | null
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
      if (this.page < PAGES.length - 1) this.page += 1;
      return 'next';
    }
    return null;
  }

  draw(ctx) {
    this.panel.drawBackdrop(ctx, this.W, this.H);
    this.panel.drawFrame(ctx);

    const p = PAGES[this.page];
    const innerX = this.panel.x + 22;
    const innerW = this.panel.w - 44;
    let y = this.panel.y + 58;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = `rgb(${theme.goldBright[0] * 255}, ${theme.goldBright[1] * 255}, ${theme.goldBright[2] * 255})`;
    ctx.font = '700 13px "DejaVu Sans", sans-serif';
    ctx.fillText(p.title, innerX, y);
    y += 26;

    ctx.font = '12px "DejaVu Sans", sans-serif';
    ctx.fillStyle = `rgb(${theme.cream[0] * 255}, ${theme.cream[1] * 255}, ${theme.cream[2] * 255})`;
    for (const line of p.lines) {
      y = wrapText(ctx, line, innerX, y, innerW, 17) + 22;
    }

    // Page indicator, centered between the nav buttons.
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
    ctx.font = '11px "DejaVu Sans", sans-serif';
    ctx.fillText(`${this.page + 1} / ${PAGES.length}`, this.panel.x + this.panel.w / 2, this.prevBtn.y + 13);

    this.prevBtn.draw(ctx);
    this.nextBtn.draw(ctx);
  }
}
