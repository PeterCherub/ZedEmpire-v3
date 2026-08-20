// js/content/chapter5.js
// Chapter 5: Luapula Province

export const cards = {
  c5_begin: {
    id: "c5_begin",
    text: "You arrive in Luapula province. The lakes and rivers define this land.",
    left: {
      label: "Explore the lakes",
      result: "Fishing communities thrive here. There's opportunity in the waters.",
      effects: { deltas: { food: -2, skill: 2, reputation: 1 } },
    },
    right: {
      label: "Head inland",
      result: "The interior is quieter. Farming is the main livelihood.",
      effects: { deltas: { food: -3, security: 2 } },
    },
  },

  c5_work: {
    id: "c5_work",
    text: "A fisherman offers you work on his boat. It's hard but you'll eat well.",
    left: {
      label: "Take the fishing job",
      result: "You learn the ways of the water and earn a living.",
      effects: { deltas: { money: 35, food: 10, skill: 3, security: -2 } },
    },
    right: {
      label: "Look for land work",
      result: "You find work in the fields instead.",
      effects: { deltas: { money: 25, food: -3, security: 2 } },
    },
  },

  c5_community: {
    id: "c5_community",
    text: "The Luapula community is deeply connected to the water. They offer you a place among them.",
    left: {
      label: "Join the fishing community",
      result: "You become part of their family. They share everything.",
      effects: { deltas: { food: 15, reputation: 8, security: 5, skill: 2 } },
    },
    right: {
      label: "Stay on the fringes",
      result: "You maintain your independence but miss out on their support.",
      effects: { deltas: { food: -3, security: -1, money: 5 } },
    },
  },

  c5_journey: {
    id: "c5_journey",
    text: "The journey from Luapula requires crossing the river. There's a ferry but it costs money.",
    left: {
      label: "Pay for the ferry",
      result: "You cross safely and continue your journey.",
      effects: { deltas: { money: -15, security: 3, food: -2 } },
    },
    right: {
      label: "Swim across",
      result: "You save money but risk the crocodiles.",
      effects: { deltas: { food: -5, security: -1, money: 15 } },
    },
  },

  c5_test: {
    id: "c5_test",
    text: "The fish population is declining. The community is struggling.",
    left: {
      label: "Help find solutions",
      result: "You work with the community to find sustainable fishing methods.",
      effects: { deltas: { reputation: 10, skill: 5, food: -5 } },
    },
    right: {
      label: "Move on",
      result: "You leave the community to their struggles.",
      effects: { deltas: { food: -3, reputation: -5, security: -1 } },
    },
  },
};

export const sequence = ["c5_begin", "c5_work", "c5_community", "c5_journey", "c5_test"];
