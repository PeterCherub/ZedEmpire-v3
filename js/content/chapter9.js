// js/content/chapter9.js
// Chapter 9: Western Province

export const cards = {
  c9_begin: {
    id: "c9_begin",
    text: "You arrive in Western province. The land is lush and the river flows strong.",
    left: {
      label: "Explore the river",
      result: "The river offers fishing and transport opportunities.",
      effects: { deltas: { food: -2, skill: 2, reputation: 1 } },
    },
    right: {
      label: "Head to the towns",
      result: "The towns are quiet but welcoming.",
      effects: { deltas: { food: -3, security: 2 } },
    },
  },

  c9_work: {
    id: "c9_work",
    text: "A river trader offers you work transporting goods along the water.",
    left: {
      label: "Take the river work",
      result: "You learn to navigate the river and earn a living.",
      effects: { deltas: { money: 45, food: -5, skill: 3, security: -2 } },
    },
    right: {
      label: "Look for land work",
      result: "You find work in the surrounding fields.",
      effects: { deltas: { money: 25, food: -3, security: 2 } },
    },
  },

  c9_community: {
    id: "c9_community",
    text: "The Western province community lives in harmony with the river.",
    left: {
      label: "Join the river community",
      result: "You become part of their way of life.",
      effects: { deltas: { food: 10, reputation: 8, security: 5, skill: 3 } },
    },
    right: {
      label: "Stay separate",
      result: "You remain on the outskirts of the community.",
      effects: { deltas: { food: -3, security: -1, money: 5 } },
    },
  },

  c9_journey: {
    id: "c9_journey",
    text: "The journey from Western province requires crossing the river or going around.",
    left: {
      label: "Cross the river",
      result: "It's risky but faster.",
      effects: { deltas: { money: -10, security: -1, food: -3 } },
    },
    right: {
      label: "Go around",
      result: "It's longer but safer.",
      effects: { deltas: { food: -5, security: 3, money: -5 } },
    },
  },

  c9_test: {
    id: "c9_test",
    text: "The river is rising. The community faces flooding.",
    left: {
      label: "Help build defenses",
      result: "You work with the community to protect their homes.",
      effects: { deltas: { reputation: 10, skill: 5, food: -8 } },
    },
    right: {
      label: "Move to higher ground",
      result: "You save yourself but the community suffers.",
      effects: { deltas: { food: -3, reputation: -5, security: -1 } },
    },
  },
};

export const sequence = ["c9_begin", "c9_work", "c9_community", "c9_journey", "c9_test"];
