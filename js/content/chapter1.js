// js/content/chapter1.js
// Exact port of cards/chapter1.lua

export const cards = {
  c1_wake: {
    id: "c1_wake",
    text: "You wake up on the street. You're hungry.",
    left: {
      label: "Look for work",
      result: "You spent the morning asking around for work.",
      effects: { deltas: { food: -5, security: -1 } },
    },
    right: {
      label: "Beg",
      result: "A few coins land in your hand, but people look away.",
      effects: { deltas: { money: 10, food: -3, security: -1, reputation: -2 } },
    },
  },

  c2_job: {
    id: "c2_job",
    text: "A market trader offers you a day's work carrying crates. It's tiring, but it pays.",
    left: {
      label: "Take the job",
      result: "You found a trader who needed help carrying goods.",
      effects: { deltas: { money: 60, food: -5, security: -2, skill: 2, reputation: 1 } },
    },
    right: {
      label: "Look for better",
      result: "Nothing better turns up today.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  c3_suspicious: {
    id: "c3_suspicious",
    text: "A stranger near the bus stop offers you K150 to carry a sealed package across town.",
    left: {
      label: "Take it",
      result: "The money is in your pocket. Something feels off.",
      effects: { deltas: { money: 150, food: -5, security: -1 }, flags: { suspicious_goods: true } },
    },
    right: {
      label: "Walk away",
      result: "You decide it isn't worth the risk.",
      effects: { deltas: { food: -3, security: -1, reputation: 2 } },
    },
  },

  c4_police: {
    id: "c4_police",
    requires: (state) => state.flags.suspicious_goods === true,
    text: "A police checkpoint stops you near Kamwala. An officer eyes your bag.",
    left: {
      label: "Let them search you",
      result: "They find the package.",
      effects: { deltas: { money: -100, food: -3 }, flags: { criminal_record: true } },
    },
    right: {
      label: "Run",
      result: "You get away, but word travels fast.",
      effects: { deltas: { food: -5, security: -1, money: -100, reputation: -5 } },
    },
  },

  c5_family: {
    id: "c5_family",
    text: "Your younger sister sends word -- she needs K50 for school fees by Friday.",
    left: {
      label: "Send it",
      result: "She thanks you.",
      effects: { deltas: { money: -50, food: -5, reputation: 4 } },
    },
    right: {
      label: "Say you have nothing",
      result: "She doesn't argue, but the silence says enough.",
      effects: { deltas: { food: -3, reputation: 4 } },
    },
  },

  c6_market: {
    id: "c6_market",
    text: "You spot a group of traders haggling over a shipment of maize.",
    left: {
      label: "Step in and help",
      result: "You earned their respect.",
      effects: { deltas: { food: -5, security: -1, reputation: 5, skill: 2 } },
    },
    right: {
      label: "Walk past",
      result: "Not your problem.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  c7_offer: {
    id: "c7_offer",
    text: "An older man at the bus station offers you a business opportunity.",
    left: {
      label: "Hear him out",
      result: "He tells you about a small transport route.",
      effects: { deltas: { food: -5, security: -1, skill: 3, territory: 5 }, flags: { transport_opportunity: true } },
    },
    right: {
      label: "Decline",
      result: "You don't trust easy money.",
      effects: { deltas: { food: -3, security: -1, reputation: 2 } },
    },
  },

  c8_market_raid: {
    id: "c8_market_raid",
    text: "The market is suddenly in chaos. City officers are checking permits.",
    left: {
      label: "Run",
      result: "You get away, but a neighbor saw your face.",
      effects: { deltas: { food: -5, security: -1, reputation: -2 } },
    },
    right: {
      label: "Hide in a stall",
      result: "You crouch behind sacks of flour until they leave.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  c9_charity: {
    id: "c9_charity",
    text: "A woman at the church is giving out free porridge.",
    left: {
      label: "Line up",
      result: "It's not much, but it fills your stomach.",
      effects: { deltas: { food: 15, security: -1, reputation: -2 } },
    },
    right: {
      label: "Save your dignity",
      result: "You leave. Pride keeps you going.",
      effects: { deltas: { food: -3, security: -1, reputation: 3 } },
    },
  },

  c10_stranger: {
    id: "c10_stranger",
    text: "A well-dressed man pulls you aside. He says he can get you an ID card for K200.",
    left: {
      label: "Pay him",
      result: "He takes your money and disappears.",
      effects: { deltas: { food: -3, security: -1, money: -200, reputation: -5 }, flags: { conned: true } },
    },
    right: {
      label: "Refuse",
      result: "You spot his fake watch. He's a scammer.",
      effects: { deltas: { food: -3, security: -1, skill: 2, reputation: 2 } },
    },
  },

  c11_transport: {
    id: "c11_transport",
    requires: (state) => state.flags.transport_opportunity === true,
    text: "The old man from the bus station shows up again. He needs K200 for fuel.",
    left: {
      label: "Invest K200",
      result: "You put up the money. If this works, things will change.",
      effects: { deltas: { food: -5, security: -1, money: -200, territory: 15, reputation: 5 }, flags: { transport_active: true } },
    },
    right: {
      label: "Back out",
      result: "You thank him for the offer, but you walk away.",
      effects: { deltas: { food: -3, security: -1, reputation: -2 } },
    },
  },

  c12_street_food: {
    id: "c12_street_food",
    text: "You spot a woman frying kapenta by the roadside.",
    left: {
      label: "Buy some",
      result: "It costs you K8, but you get a hot meal.",
      effects: { deltas: { money: -8, food: 8, security: -1 } },
    },
    right: {
      label: "Keep walking",
      result: "Your stomach growls, but you save your money.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  c13_night_shelter: {
    id: "c13_night_shelter",
    text: "Night is falling. A makeshift shelter is accepting payment for a bed.",
    left: {
      label: "Pay K15 for a bed",
      result: "You sleep indoors. You wake up feeling safer.",
      effects: { deltas: { money: -15, food: -3, security: 5, reputation: 2 } },
    },
    right: {
      label: "Sleep on the street",
      result: "You save money, but the night is cold and dangerous.",
      effects: { deltas: { food: -5, security: -1, reputation: -2 } },
    },
  },

  c14_stolen_goods: {
    id: "c14_stolen_goods",
    text: "A man offers you a cheap phone for K50. It's clearly stolen.",
    left: {
      label: "Buy it",
      result: "You got a phone. But someone might report it missing.",
      effects: { deltas: { money: -50, security: -1, skill: 2 }, flags: { stolen_goods: true } },
    },
    right: {
      label: "Refuse",
      result: "You walk away. You don't want the trouble.",
      effects: { deltas: { reputation: 3, security: -1 } },
    },
  },

  c15_friend: {
    id: "c15_friend",
    text: "An old friend from the neighborhood spots you. He offers you a place to stay.",
    left: {
      label: "Accept",
      result: "You have a roof over your head and a chance to regroup.",
      effects: { deltas: { food: 5, security: 8, reputation: 5, skill: 2 } },
    },
    right: {
      label: "Decline",
      result: "You don't want to owe anyone. You are on your own.",
      effects: { deltas: { food: -3, security: -1, reputation: -2 } },
    },
  },
};

export const sequence = [
  "c1_wake",
  "c2_job",
  "c3_suspicious",
  "c5_family",
  "c6_market",
  "c7_offer",
  "c8_market_raid",
  "c9_charity",
  "c10_stranger",
  "c12_street_food",
  "c13_night_shelter",
  "c14_stolen_goods",
  "c15_friend",
];
