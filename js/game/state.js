// js/game/state.js
// Exact port of systems/state.lua

export class State {
  constructor() {
    this.day = 1;
    this.chapter = 1;
    this.stage = 1;
    this.stageName = "Stage 1 -- The Hustler";
    // Display name used for local and global Hall of Fame entries.
    this.playerName = "Anonymous";

    this.stats = {
      food: 20,
      money: 10,
      reputation: 5,
      skill: 5,
      security: 6,
      territory: 0,
    };

    this.flags = {};
    this.bankSavings = 0;

    // The player's "life story" -- one entry per choice made this run,
    // in order. Used to generate the story recap on game over / game
    // complete.
    this.history = [];
  }

  recordChoice(entry) {
    this.history.push(entry);
  }

  applyDeltas(deltas) {
    if (!deltas) return;
    for (const [key, amount] of Object.entries(deltas)) {
      if (this.stats[key] !== undefined) {
        this.stats[key] += amount;
      }
    }
  }

  setFlags(flags) {
    if (!flags) return;
    for (const [key, value] of Object.entries(flags)) {
      this.flags[key] = value;
    }
  }

  applyEffects(effects) {
    if (!effects) return;
    if (effects.deltas) this.applyDeltas(effects.deltas);
    if (effects.flags) this.setFlags(effects.flags);
  }

  isGameOver() {
    if (this.stats.food <= 0) {
      return { over: true, reason: "You collapsed from hunger. Your story ends here." };
    }
    if (this.stats.security <= 0) {
      return { over: true, reason: "With no security left, you couldn't protect yourself. Game over." };
    }
    return { over: false, reason: null };
  }

  serialize() {
    return {
      day: this.day,
      chapter: this.chapter,
      stage: this.stage,
      stageName: this.stageName,
      playerName: this.playerName,
      stats: { ...this.stats },
      flags: { ...this.flags },
      bankSavings: this.bankSavings,
      history: [...this.history],
    };
  }

  loadFrom(data) {
    this.day = data.day;
    this.chapter = data.chapter;
    this.stage = data.stage;
    this.stageName = data.stageName;
    this.playerName = (data.playerName || "Anonymous").slice(0, 24);
    this.stats = { ...data.stats };
    this.flags = { ...data.flags };
    this.bankSavings = data.bankSavings || 0;
    this.history = data.history ? [...data.history] : [];
  }
}
