// js/content/chapters.js
// Aggregator: province metadata (for the map/title) + per-chapter
// cards and sequences, each pulled from its own chapterN.js file.

import { cards as c1, sequence as seq1 } from "./chapter1.js";
import { cards as c2, sequence as seq2 } from "./chapter2.js";
import { cards as c3, sequence as seq3 } from "./chapter3.js";
import { cards as c4, sequence as seq4 } from "./chapter4.js";
import { cards as c5, sequence as seq5 } from "./chapter5.js";
import { cards as c6, sequence as seq6 } from "./chapter6.js";
import { cards as c7, sequence as seq7 } from "./chapter7.js";
import { cards as c8, sequence as seq8 } from "./chapter8.js";
import { cards as c9, sequence as seq9 } from "./chapter9.js";
import { cards as c10, sequence as seq10 } from "./chapter10.js";

export const chapters = [
  { number: 1, province: "Lusaka", title: "The Awakening", summary: "The streets where the journey begins." },
  { number: 2, province: "Central", title: "The Crossroads", summary: "A new province and new choices await." },
  { number: 3, province: "Copperbelt", title: "The Price of Progress", summary: "Work, ambition, and pressure collide." },
  { number: 4, province: "Eastern", title: "The Turning Point", summary: "The past begins to shape the future." },
  { number: 5, province: "Luapula", title: "Across the Water", summary: "Opportunity comes with uncertainty." },
  { number: 6, province: "Northern", title: "The Long Road", summary: "Distance tests patience and preparation." },
  { number: 7, province: "North-Western", title: "Hidden Wealth", summary: "Resources are valuable, but so are people." },
  { number: 8, province: "Southern", title: "Dry Season", summary: "Survival depends on planning and relationships." },
  { number: 9, province: "Western", title: "The Open Frontier", summary: "Isolation forces difficult decisions." },
  { number: 10, province: "Muchinga", title: "The Empire", summary: "The final chapter decides what ZedEmpire becomes." },
];

export function getChapter(n) {
  return chapters.find((c) => c.number === n) || chapters[0];
}

const allCards = { 1: c1, 2: c2, 3: c3, 4: c4, 5: c5, 6: c6, 7: c7, 8: c8, 9: c9, 10: c10 };
const allSequences = { 1: seq1, 2: seq2, 3: seq3, 4: seq4, 5: seq5, 6: seq6, 7: seq7, 8: seq8, 9: seq9, 10: seq10 };

export function getChapterCards(n) {
  return allCards[n] || allCards[1];
}

export function getChapterSequence(n) {
  return allSequences[n] || allSequences[1];
}
