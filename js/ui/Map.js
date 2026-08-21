import { theme } from "../theme.js";
import { Button } from "./Button.js";
import { chapters } from "../content/chapters.js";
import * as fx from "../renderer/fx.js";

const points = [
 [210,500],[205,440],[210,370],[245,330],[185,285],
 [125,250],[95,340],[260,500],[300,400],[290,230]
];

export class Map {
  constructor(W,H){
    this.W=W; this.H=H; this.active=false; this.currentChapter=1;
    this.completedChapters=new Set();
    this.locations=chapters.map((c,i)=>({...c,completed:false,x:points[i][0],y:points[i][1]}));
    this.backBtn=new Button(W/2-50,H-60,100,40,"BACK",{color:theme.gold,radius:6});
  }
  setCompleted(n){this.completedChapters.add(n); const l=this.locations.find(x=>x.number===n); if(l)l.completed=true;}
  setCurrent(n){this.currentChapter=n;}
  update(dt){this.backBtn.update(dt||0);}
  mousemoved(x,y){this.backBtn.mousemoved(x,y);}
  mousepressed(x,y){if(this.backBtn.click(x,y)){this.active=false;return "back";}return null;}
  draw(ctx){
    // Note: main.js's render() already calls draw.background() (the
    // ambient gradient/motes/vignette) before dispatching here, so
    // this only draws the map's own panel/nodes on top of it.
    ctx.save();
    ctx.shadowColor = fx.rgb(theme.gold, 0.5);
    ctx.shadowBlur = 12;
    ctx.fillStyle = fx.rgb(theme.goldBright);
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.font = '700 22px Orbitron, "DejaVu Sans", sans-serif';
    ctx.fillText("ZAMBIA — 10 CHAPTERS", this.W / 2, 22);
    ctx.restore();

    fx.glowPanel(ctx, 30, 65, this.W - 60, this.H - 145, 14, {
      top: fx.rgb(theme.panelTop, 0.92),
      bottom: fx.rgb(theme.panel, 0.92),
      border: fx.rgb(theme.panelBorder, 0.6),
      shadowColor: 'rgba(0,0,0,0.45)',
      shadowBlur: 20,
    });
    fx.techCorners(ctx, 30, 65, this.W - 60, this.H - 145, 14, fx.rgb(theme.accent, 0.35));

    // Journey trail -- glowing dashed line between provinces
    ctx.save();
    ctx.strokeStyle = fx.rgb(theme.accent, 0.35);
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.locations.forEach((l, i) => { if (i === 0) ctx.moveTo(l.x, l.y); else ctx.lineTo(l.x, l.y); });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    for (const loc of this.locations) {
      const unlocked = loc.number <= this.currentChapter;
      const isCurrent = loc.number === this.currentChapter;
      const nodeColor = loc.completed ? theme.greenBright : (isCurrent ? theme.goldBright : theme.disabled);

      if (isCurrent) {
        const p = fx.pulse(1.6);
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.18 * p;
        ctx.fillStyle = fx.rgb(theme.goldBright);
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, 16 + p * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      if (unlocked) { ctx.shadowColor = fx.rgb(nodeColor, 0.7); ctx.shadowBlur = 8; }
      ctx.fillStyle = fx.rgb(nodeColor);
      ctx.beginPath();
      ctx.arc(loc.x, loc.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = fx.rgb(theme.dark, 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(loc.x, loc.y, 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = fx.rgb(unlocked ? theme.cream : theme.muted);
      ctx.font = '10px "DejaVu Sans", sans-serif';
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(`${loc.number}. ${loc.province}`, loc.x, loc.y + 16);
    }

    this.backBtn.draw(ctx);

    ctx.fillStyle = fx.rgb(theme.muted);
    ctx.font = '10px "DejaVu Sans", sans-serif';
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    const cur = this.locations.find(l => l.number === this.currentChapter);
    ctx.fillText(cur ? `Current chapter: ${cur.number} — ${cur.province}` : "The whole journey is being mapped.", this.W / 2, this.H - 20);
  }
}
