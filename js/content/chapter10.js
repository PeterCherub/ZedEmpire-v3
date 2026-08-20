// js/content/chapter10.js
// Chapter 10: Muchinga Province -- the final leg of the journey

export const cards = {
  c10_begin: {
    id: "c10_begin",
    text: "You arrive in Muchinga province. The mountains rise high and the people are resilient.",
    left: {
      label: "Explore the mountains",
      result: "You find communities living in the highlands.",
      effects: { deltas: { food: -2, skill: 2, reputation: 1 } },
    },
    right: {
      label: "Head to the valleys",
      result: "The valleys are fertile and populated.",
      effects: { deltas: { food: -3, security: 2 } },
    },
  },

  c10_work: {
    id: "c10_work",
    text: "A mountain guide offers you work leading travelers through the passes.",
    left: {
      label: "Take the guiding work",
      result: "You learn the mountains and earn good money.",
      effects: { deltas: { money: 40, food: -5, skill: 4, security: -2 } },
    },
    right: {
      label: "Look for valley work",
      result: "You find work in the agricultural valleys.",
      effects: { deltas: { money: 25, food: 5, security: 2 } },
    },
  },

  c10_community: {
    id: "c10_community",
    text: "The Muchinga community values strength and independence.",
    left: {
      label: "Prove your strength",
      result: "You earn their respect through your actions.",
      effects: { deltas: { reputation: 8, security: 5, skill: 3, food: -5 } },
    },
    right: {
      label: "Show your kindness",
      result: "You earn their trust through compassion.",
      effects: { deltas: { reputation: 8, food: 5, security: 3, skill: 2 } },
    },
  },

  c10_journey: {
    id: "c10_journey",
    text: "The journey through Muchinga is difficult. The mountains are steep.",
    left: {
      label: "Hire a guide",
      result: "You navigate safely with local knowledge.",
      effects: { deltas: { money: -20, security: 5, food: -3 } },
    },
    right: {
      label: "Go alone",
      result: "You save money but risk getting lost in the mountains.",
      effects: { deltas: { food: -5, security: -1, money: 10 } },
    },
  },

  c10_test: {
    id: "c10_test",
    text: "Your journey through Zambia is nearly complete. You have traversed nine provinces to get here.",
    left: {
      label: "Celebrate your journey",
      result: "You reflect on all you have overcome. The empire is built.",
      effects: { deltas: { reputation: 20, skill: 10, security: 10, food: 10 } },
    },
    right: {
      label: "Plan your future",
      result: "You look ahead to what comes next. The empire is just beginning.",
      effects: { deltas: { reputation: 10, skill: 10, money: 100 } },
    },
  },
};

export const sequence = ["c10_begin", "c10_work", "c10_community", "c10_journey", "c10_test"];
