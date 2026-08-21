// js/game/engine.js
// Exact port of systems/engine.lua

export class Engine {
  constructor(cardTable, sequence) {
    this.cardTable = cardTable;
    this.queue = [...sequence];
    this.pos = 0; // 0-based for JS arrays

    this.delayedRules = [
      { cardId: "c4_police", triggerFlag: "suspicious_goods", delay: 2 },
      { cardId: "c11_transport", triggerFlag: "transport_opportunity", delay: 3 },
    ];

    this.scheduledDelayed = {};
  }

  checkDelayedTriggers(state) {
    for (const rule of this.delayedRules) {
      if (state.flags[rule.triggerFlag] === true && !this.scheduledDelayed[rule.cardId]) {
        let insertAt = Math.min(this.pos + rule.delay, this.queue.length);
        if (insertAt <= this.queue.length) {
          this.queue.splice(insertAt, 0, rule.cardId);
          this.scheduledDelayed[rule.cardId] = true;
          console.log(`Scheduled delayed card: ${rule.cardId} at position ${insertAt}`);
        } else {
          console.warn(`Warning: ${rule.cardId} scheduled past end of chapter. Trigger ignored.`);
        }
      }
    }
  }

  isQueued(cardId) {
    return this.queue.includes(cardId);
  }

  currentCard(state) {
    while (this.pos < this.queue.length) {
      const card = this.cardTable[this.queue[this.pos]];
      if (!card.requires || card.requires(state)) {
        return card;
      }
      this.pos++;
    }
    return null;
  }

  advance(state) {
    this.checkDelayedTriggers(state);
    this.pos++;
  }

  progress() {
    return { pos: this.pos, total: this.queue.length };
  }

  reset() {
    this.pos = 0;
    this.scheduledDelayed = {};
  }
}
