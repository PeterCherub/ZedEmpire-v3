// js/content/chapter7.js
// Chapter 7: North-Western Province

export const cards = {
  c7_begin: {
    id: "c7_begin",
    text: "You arrive in North-Western province. The land is rich with minerals and forests.",
    left: {
      label: "Explore the forests",
      result: "You find communities living off the land.",
      effects: { deltas: { food: -2, skill: 2, reputation: 1 } },
    },
    right: {
      label: "Seek the mines",
      result: "Small-scale mining operations offer opportunity.",
      effects: { deltas: { food: -3, money: 10, security: -1 } },
    },
  },

  c7_work: {
    id: "c7_work",
    text: "A small mining operation needs workers. The pay is decent but conditions are rough.",
    left: {
      label: "Take the mining work",
      result: "You work hard and earn good money.",
      effects: { deltas: { money: 50, food: -8, security: -2, skill: 3 } },
    },
    right: {
      label: "Work in the forests",
      result: "You find work with the forest communities.",
      effects: { deltas: { money: 25, food: 5, security: 2 } },
    },
  },

  c7_community: {
    id: "c7_community",
    text: "The North-Western community is diverse. Miners, farmers, and forest dwellers live side by side.",
    left: {
      label: "Unite the communities",
      result: "You become a bridge between different groups.",
      effects: { deltas: { reputation: 10, skill: 5, security: 3, food: -5 } },
    },
    right: {
      label: "Choose one group",
      result: "You gain strong allies but make enemies of others.",
      effects: { deltas: { reputation: 5, security: 5, food: -3 } },
    },
  },

  c7_journey: {
    id: "c7_journey",
    text: "The journey through North-Western is treacherous. The roads are rough.",
    left: {
      label: "Take the main road",
      result: "It's safer but slower.",
      effects: { deltas: { security: 3, food: -3, money: -5 } },
    },
    right: {
      label: "Take the back roads",
      result: "It's faster but riskier.",
      effects: { deltas: { food: -5, security: -1, money: 5 } },
    },
  },

  c7_test: {
    id: "c7_test",
    text: "A conflict arises between miners and forest dwellers over land rights.",
    left: {
      label: "Mediate the conflict",
      result: "You help find a compromise that respects both sides.",
      effects: { deltas: { reputation: 15, skill: 5, security: 5, food: -5 } },
    },
    right: {
      label: "Take sides",
      result: "You gain allies on one side but make enemies on the other.",
      effects: { deltas: { reputation: -5, security: 5, food: -3 } },
    },
  },
};

export const sequence = ["c7_begin", "c7_work", "c7_community", "c7_journey", "c7_test"];
