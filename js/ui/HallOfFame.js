// js/ui/HallOfFame.js
// Lists past runs recorded on THIS device (see game/halloffame.js).
// Opened from the main menu. This is local, not a shared/online
// leaderboard -- there's no backend behind ZedEmpire to compare
// players against each other yet.

import { theme } from '../theme.js';
import { Button } from './Button.js';
import { Panel } from './Panel.js';
import { wrapText } from '../renderer/draw.js';
import { getRuns } from '../game/halloffame.js';
import { fetchGlobalLeaderboard, backendConfigured } from '../game/backend.js';

const PER_PAGE = 4;

const OUTCOME_LABEL = {
  setback: 'Setback',
  robbed: 'Robbed',
  completed: 'Completed the journey',
};

export class HallOfFame {
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.page = 0;
    this.runs = [];
    this.tab = 'local'; // "local" | "global"
    this.globalRuns = [];
    this.globalStatus = 'idle'; // "idle" | "loading" | "loaded" | "error" | "unconfigured"

    const panelW = 380;
    const panelH = 560;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2 - 20;
    this.panel = new Panel(panelX, panelY, panelW, panelH, 'HALL OF FAME');

    const TAB_W = 160;
    const TAB_H = 32;
    const tabY = panelY + 46;
    this.localTabBtn = new Button(panelX + panelW / 2 - TAB_W - 4, tabY, TAB_W, TAB_H, 'MY RUNS', { color: theme.gold, textColor: theme.dark });
    this.globalTabBtn = new Button(panelX + panelW / 2 + 4, tabY, TAB_W, TAB_H, 'GLOBAL', { color: theme.panel, textColor: theme.gold });

    const NAV_W = 110;
    const NAV_H = 40;
    const navY = panelY + panelH - NAV_H - 18;

    this.prevBtn = new Button(panelX + 18, navY, NAV_W, NAV_H, '< BACK', { color: theme.panel, textColor: theme.gold });
    this.nextBtn = new Button(panelX + panelW - NAV_W - 18, navY, NAV_W, NAV_H, 'NEXT >', { color: theme.gold, textColor: theme.dark });
  }

  open() {
    this.runs = getRuns();
    this.tab = 'local';
    this.page = 0;
  }

  activeList() {
    return this.tab === 'local' ? this.runs : this.globalRuns;
  }

  loadGlobal() {
    if (this.globalStatus === 'loading') return;
    if (!backendConfigured()) {
      this.globalStatus = 'unconfigured';
      return;
    }
    this.globalStatus = 'loading';
    fetchGlobalLeaderboard(25)
      .then((rows) => {
        this.globalRuns = rows;
        this.globalStatus = 'loaded';
      })
      .catch(() => {
        this.globalStatus = 'error';
      });
  }

  pageCount() {
    return Math.max(1, Math.ceil(this.activeList().length / PER_PAGE));
  }

  reset() {
    this.page = 0;
  }

  buttons() {
    return [this.panel.closeBtn, this.localTabBtn, this.globalTabBtn, this.prevBtn, this.nextBtn];
  }

  update(dt) {
    this.prevBtn.setDisabled(this.page === 0);
    this.nextBtn.setDisabled(this.page >= this.pageCount() - 1);
    this.localTabBtn.color = this.tab === 'local' ? theme.gold : theme.panel;
    this.localTabBtn.textColor = this.tab === 'local' ? theme.dark : theme.gold;
    this.globalTabBtn.color = this.tab === 'global' ? theme.gold : theme.panel;
    this.globalTabBtn.textColor = this.tab === 'global' ? theme.dark : theme.gold;
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
    if (this.localTabBtn.click(x, y)) {
      this.tab = 'local';
      this.page = 0;
      return 'tab';
    }
    if (this.globalTabBtn.click(x, y)) {
      this.tab = 'global';
      this.page = 0;
      if (this.globalStatus === 'idle') this.loadGlobal();
      return 'tab';
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
    this.localTabBtn.draw(ctx);
    this.globalTabBtn.draw(ctx);

    const innerX = this.panel.x + 22;
    const innerW = this.panel.w - 44;
    let y = this.panel.y + 96;

    const list = this.activeList();

    if (this.tab === 'global' && this.globalStatus !== 'loaded') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '12px "DejaVu Sans", sans-serif';
      ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
      let msg = 'Loading global runs...';
      if (this.globalStatus === 'unconfigured') msg = 'Global leaderboard is not set up yet.';
      else if (this.globalStatus === 'error') msg = 'Could not reach the global leaderboard.';
      ctx.fillText(msg, this.panel.x + this.panel.w / 2, y + 20);
    } else if (list.length === 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '12px "DejaVu Sans", sans-serif';
      ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
      const msg = this.tab === 'local' ? 'No runs recorded yet on this device.' : 'No global runs yet -- be the first.';
      ctx.fillText(msg, this.panel.x + this.panel.w / 2, y + 20);
    } else {
      const start = this.page * PER_PAGE;
      const slice = list.slice(start, start + PER_PAGE);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      slice.forEach((run, i) => {
        const rank = start + i + 1;
        ctx.font = '700 12px "DejaVu Sans", sans-serif';
        ctx.fillStyle = `rgb(${theme.goldBright[0] * 255}, ${theme.goldBright[1] * 255}, ${theme.goldBright[2] * 255})`;
        const who = this.tab === 'global' ? `${run.player_name || 'Anonymous'} \u2014 ` : '';
        ctx.fillText(`#${rank} \u2014 ${who}Chapter ${run.chapter}, ${run.province} (Day ${run.day})`, innerX, y);
        y += 20;

        ctx.font = '11px "DejaVu Sans", sans-serif';
        ctx.fillStyle = `rgb(${theme.cream[0] * 255}, ${theme.cream[1] * 255}, ${theme.cream[2] * 255})`;
        const outcome = OUTCOME_LABEL[run.outcome] || run.outcome;
        y = wrapText(ctx, `${outcome} \u2014 Rep ${run.stats?.reputation ?? '?'}, Skill ${run.stats?.skill ?? '?'}, Territory ${run.stats?.territory ?? '?'}`, innerX, y, innerW, 15) + 6;

        if (run.headline) {
          ctx.font = 'italic 11px "DejaVu Sans", sans-serif';
          ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
          y = wrapText(ctx, run.headline, innerX, y, innerW, 15) + 6;
        }
        y += 10;
      });
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = `rgb(${theme.creamDim[0] * 255}, ${theme.creamDim[1] * 255}, ${theme.creamDim[2] * 255})`;
    ctx.font = '11px "DejaVu Sans", sans-serif';
    ctx.fillText(`${this.page + 1} / ${this.pageCount()}`, this.panel.x + this.panel.w / 2, this.prevBtn.y + 13);

    this.prevBtn.draw(ctx);
    this.nextBtn.draw(ctx);
  }
}
