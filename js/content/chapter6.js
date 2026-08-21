// js/content/chapter6.js
// Chapter 6: Northern Province

export const cards = {
  c6_begin: {
    id: "c6_begin",
    text: "You arrive in Northern province. The air is cool. The people are resilient.",
    left: {
      label: "Explore the highlands",
      result: "The highlands offer fertile land and opportunity.",
      effects: { deltas: { food: -2, skill: 2, reputation: 1 } },
    },
    right: {
      label: "Visit the towns",
      result: "The towns are small but close-knit.",
      effects: { deltas: { food: -3, security: 2 } },
    },
  },

  c6_work: {
    id: "c6_work",
    text: "A coffee farmer in the highlands offers you work picking beans.",
    left: {
      label: "Take the coffee work",
      result: "The work is steady and the pay is fair.",
      effects: { deltas: { money: 40, food: -5, skill: 2, reputation: 1, security: -2 } },
    },
    right: {
      label: "Look for other work",
      result: "You find occasional work in the towns.",
      effects: { deltas: { money: 20, food: -3, security: 1 } },
    },
  },

  c6_community: {
    id: "c6_community",
    text: "The Northern province community values education and tradition.",
    left: {
      label: "Embrace their traditions",
      result: "You gain their trust and respect.",
      effects: { deltas: { reputation: 8, skill: 3, food: 5, security: 3 } },
    },
    right: {
      label: "Keep your own way",
      result: "You maintain your independence but miss out on community support.",
      effects: { deltas: { food: -3, security: -1, money: 5 } },
    },
  },

  c6_journey: {
    id: "c6_journey",
    text: "The road to the next province is long and winding through the hills.",
    left: {
      label: "Hire a guide",
      result: "You navigate safely with local knowledge.",
      effects: { deltas: { money: -20, security: 5, food: -2 } },
    },
    right: {
      label: "Go alone",
      result: "You save money but risk getting lost.",
      effects: { deltas: { food: -5, security: -1, money: 10 } },
    },
  },

  c6_test: {
    id: "c6_test",
    text: "The coffee harvest fails. The farmers need help to survive.",
    left: {
      label: "Help the farmers",
      result: "You work together to find alternative crops.",
      effects: { deltas: { reputation: 10, skill: 5, food: -8 } },
    },
    right: {
      label: "Move on",
      result: "You leave the farmers to their fate.",
      effects: { deltas: { food: -3, reputation: -5, security: -1 } },
    },
  },
};

export const sequence = ["c6_begin", "c6_work", "c6_community", "c6_journey", "c6_test"];
