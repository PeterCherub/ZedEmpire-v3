// js/content/chapter4.js
// Chapter 4: Eastern Province

export const cards = {
  c4_begin: {
    id: "c4_begin",
    text: "You arrive in Eastern province. The landscape is beautiful, but life is hard.",
    left: {
      label: "Explore the villages",
      result: "You find close-knit farming communities.",
      effects: { deltas: { food: -2, reputation: 3, skill: 1 } },
    },
    right: {
      label: "Head to the border",
      result: "The border offers trade opportunities.",
      effects: { deltas: { money: 10, security: -1, food: -3 } },
    },
  },

  c4_work: {
    id: "c4_work",
    text: "A tobacco farmer offers you work. It's seasonal but pays well.",
    left: {
      label: "Take the farming job",
      result: "You work the fields under the hot sun.",
      effects: { deltas: { money: 45, food: -5, skill: 2, reputation: 1, security: -2 } },
    },
    right: {
      label: "Look for trade work",
      result: "You find work in the local markets.",
      effects: { deltas: { money: 25, food: -3, security: 2 } },
    },
  },

  c4_community: {
    id: "c4_community",
    text: "The Eastern province community is welcoming. A local chief offers you protection.",
    left: {
      label: "Accept the chief's protection",
      result: "You gain allies but must respect their customs.",
      effects: { deltas: { security: 8, reputation: 5, food: -3 } },
    },
    right: {
      label: "Stay independent",
      result: "You remain free but vulnerable.",
      effects: { deltas: { food: -3, security: -1, money: 5 } },
    },
  },

  c4_journey: {
    id: "c4_journey",
    text: "The road to the next province is treacherous. Bandits are known in these parts.",
    left: {
      label: "Join a caravan",
      result: "You travel safely with a group.",
      effects: { deltas: { money: -10, security: 5, food: -3 } },
    },
    right: {
      label: "Travel alone",
      result: "You take the risk but save money.",
      effects: { deltas: { food: -5, security: -1, money: 10 } },
    },
  },

  c4_test: {
    id: "c4_test",
    text: "A drought threatens the Eastern province. The crops are failing.",
    left: {
      label: "Help the community",
      result: "You share your resources and gain lasting respect.",
      effects: { deltas: { food: -10, reputation: 10, skill: 2 } },
    },
    right: {
      label: "Look after yourself",
      result: "You survive but lose the trust of the community.",
      effects: { deltas: { food: 5, reputation: -5, security: -1 } },
    },
  },
};

export const sequence = ["c4_begin", "c4_work", "c4_community", "c4_journey", "c4_test"];
