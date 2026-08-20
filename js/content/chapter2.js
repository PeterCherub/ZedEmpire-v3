// js/content/chapter2.js
// Chapter 2: Central Province

export const cards = {
  c2_begin: {
    id: "c2_begin",
    text: "You arrive in Central province. The landscape is different. The challenges are new.",
    left: {
      label: "Explore",
      result: "You walk through the streets of Central, learning the ways of the people.",
      effects: { deltas: { food: -3, security: -1, reputation: 2, skill: 1 } },
    },
    right: {
      label: "Find shelter",
      result: "You find a place to rest and plan your next move.",
      effects: { deltas: { food: -2, security: 3 } },
    },
  },

  c2_work: {
    id: "c2_work",
    text: "A local farmer in Central offers you work harvesting crops. It's hard labor but honest pay.",
    left: {
      label: "Take the work",
      result: "Your back aches, but you earned your keep.",
      effects: { deltas: { money: 40, food: -5, skill: 2, reputation: 1, security: -2 } },
    },
    right: {
      label: "Keep moving",
      result: "You decide there must be something better ahead.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  c2_community: {
    id: "c2_community",
    text: "The community in Central is tight-knit. A local elder offers you advice and a meal.",
    left: {
      label: "Accept their kindness",
      result: "You gain wisdom and a full stomach.",
      effects: { deltas: { food: 10, reputation: 5, skill: 2 } },
    },
    right: {
      label: "Stay independent",
      result: "You thank them but move on. Independence has its cost.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  c2_journey: {
    id: "c2_journey",
    text: "The road to the next province is long. You need supplies for the journey.",
    left: {
      label: "Stock up",
      result: "You spend K20 on food and water. You're ready.",
      effects: { deltas: { money: -20, food: 15, security: 2 } },
    },
    right: {
      label: "Travel light",
      result: "You save money but risk the journey.",
      effects: { deltas: { food: -5, security: -1, money: 5 } },
    },
  },

  c2_test: {
    id: "c2_test",
    text: "A challenge presents itself in Central. Will you rise to meet it?",
    left: {
      label: "Face the challenge",
      result: "You prove your strength and determination.",
      effects: { deltas: { reputation: 5, skill: 3, security: 2, food: -5 } },
    },
    right: {
      label: "Avoid it",
      result: "Sometimes discretion is the better part of valor.",
      effects: { deltas: { food: -3, security: -1, reputation: -2 } },
    },
  },
};

export const sequence = ["c2_begin", "c2_work", "c2_community", "c2_journey", "c2_test"];
