// js/content/chapter3.js
// Chapter 3: Copperbelt Province

export const cards = {
  cb_arrival: {
    id: "cb_arrival",
    text: "The bus drops you in Kitwe. The air tastes like dust and diesel -- the mines are close.",
    left: {
      label: "Head to the mine gate",
      result: "Trucks rumble past you toward the Nkana shafts. Men are already lining up for the morning shift call.",
      effects: { deltas: { food: -5, security: -1 } },
    },
    right: {
      label: "Look around the compound first",
      result: "Wusakile compound is packed tight -- shebeens, tuck shops, kids playing near open drains.",
      effects: { deltas: { food: -3, security: -1, reputation: 1 } },
    },
  },

  cb_gate_labor: {
    id: "cb_gate_labor",
    text: "A shift boss at the mine gate is short two men to haul ore sacks. It's brutal work, cash in hand.",
    left: {
      label: "Take the shift",
      result: "Your shoulders burn for hours, but the boss pays you K70 before you even ask.",
      effects: { deltas: { money: 70, food: -8, security: -2, skill: 2 } },
    },
    right: {
      label: "Wait for something safer",
      result: "You watch other men get picked. Nothing comes your way today.",
      effects: { deltas: { food: -4, security: -1 } },
    },
  },

  cb_jerabo: {
    id: "cb_jerabo",
    text: "A group of jerabos -- men who slip into old shafts to scavenge copper ore by hand -- offer to cut you in.",
    left: {
      label: "Go down with them",
      result: "You crawl through a half-collapsed tunnel filling sacks with ore by torchlight. It's illegal, and it pays.",
      effects: { deltas: { money: 90, food: -6, security: -2 }, flags: { jerabo_ties: true } },
    },
    right: {
      label: "Refuse",
      result: "You've heard what happens when a shaft gives way. Not worth it.",
      effects: { deltas: { food: -3, security: -1, reputation: 2 } },
    },
  },

  cb_union: {
    id: "cb_union",
    text: "A mineworkers' union organizer hands you a leaflet outside the compound hall. He's recruiting for a pay protest.",
    left: {
      label: "Sign up",
      result: "You add your name. The organizer says solidarity is the only leverage men like you have.",
      effects: { deltas: { reputation: 6, security: -1, skill: 1 }, flags: { union_ally: true } },
    },
    right: {
      label: "Stay out of it",
      result: "You've got enough trouble without mine management knowing your name.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  cb_cable_offer: {
    id: "cb_cable_offer",
    text: "A boy near the rail siding offers you a coil of copper cable, stripped and ready to sell, for K30.",
    left: {
      label: "Buy it",
      result: "You take the coil. It's obviously cut from somewhere it shouldn't have been.",
      effects: { deltas: { money: -30, security: -1 }, flags: { stolen_copper: true } },
    },
    right: {
      label: "Walk away",
      result: "Buying hot cable in Kitwe is how men disappear into police cells.",
      effects: { deltas: { food: -3, security: -1, reputation: 1 } },
    },
  },

  cb_security_search: {
    id: "cb_security_search",
    requires: (state) => state.flags.stolen_copper === true,
    text: "Mine security stops you near the scrap yard on Kabundi Road. They've had three cable thefts this week.",
    left: {
      label: "Let them search your bag",
      result: "They find the coil. You spend the night in the mine's holding room before they let you go, minus the cable and a fine.",
      effects: { deltas: { money: -60, food: -5, reputation: -5 }, flags: { criminal_record: true } },
    },
    right: {
      label: "Bolt down an alley",
      result: "You outrun them, heart pounding, but they radioed ahead. People are already talking about you.",
      effects: { deltas: { food: -5, security: -1, reputation: -6 } },
    },
  },

  cb_smelter_job: {
    id: "cb_smelter_job",
    text: "A Chinese-run smelter outside Chingola is hiring casuals. The heat off the furnace is punishing, but it's steady.",
    left: {
      label: "Take the job",
      result: "You spend the day feeding the furnace line. Your lungs feel it, but the pay clears on time.",
      effects: { deltas: { money: 85, food: -8, security: -2, skill: 3 } },
    },
    right: {
      label: "Pass on it",
      result: "You've heard too many stories about men who took that job and left with a permanent cough.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  cb_shaft_collapse: {
    id: "cb_shaft_collapse",
    text: "Word spreads fast: a section of an old shaft near Nkana has caved in. Men are trapped inside.",
    left: {
      label: "Join the dig",
      result: "You help haul rubble for six hours straight. Two miners come out alive because of it.",
      effects: { deltas: { skill: 3, food: -10, reputation: 4 } },
    },
    right: {
      label: "Stay clear",
      result: "You watch from a distance. It isn't your shaft, and it isn't your risk to take.",
      effects: { deltas: { food: -3, reputation: 4 } },
    },
  },

  cb_cough: {
    id: "cb_cough",
    text: "A dry cough has settled into your chest -- dust from the mine roads, or worse. A clinic in Kamitondo charges K20.",
    left: {
      label: "Pay for the clinic",
      result: "The nurse gives you cough mixture and tells you to keep clear of the crushing plant. It helps.",
      effects: { deltas: { money: -20, food: -3, security: 6 } },
    },
    right: {
      label: "Push through it",
      result: "You tell yourself it's nothing. It doesn't feel like nothing.",
      effects: { deltas: { food: -5, security: -1 } },
    },
  },

  cb_rent_hike: {
    id: "cb_rent_hike",
    text: "Your compound landlord in Chamboli says rent is going up K25 this month -- 'take it or find another room.'",
    left: {
      label: "Pay it",
      result: "You hand over the money. A roof matters more than pride tonight.",
      effects: { deltas: { money: -25, security: 5, food: -3 } },
    },
    right: {
      label: "Argue him down",
      result: "You talk him back to the old price, but he'll remember you as difficult.",
      effects: { deltas: { security: 2, reputation: -2, food: -3 } },
    },
  },

  cb_cousin_butchery: {
    id: "cb_cousin_butchery",
    text: "Your cousin in Luanshya wants to start a small butchery stall. She's short K60 and asks if you can help.",
    left: {
      label: "Send the money",
      result: "She promises to pay you back once the stall is running. Family is family.",
      effects: { deltas: { money: -60, food: -3, reputation: 4 } },
    },
    right: {
      label: "Tell her you can't spare it",
      result: "She says she understands. You're not sure she does.",
      effects: { deltas: { food: -3, reputation: 4 } },
    },
  },

  cb_pension_scam: {
    id: "cb_pension_scam",
    text: "A man outside the NAPSA office says he can get your late father's mine pension released early -- for a K100 'processing fee.'",
    left: {
      label: "Pay him",
      result: "He pockets the money and vanishes into the crowd outside the office. There was never a pension to release.",
      effects: { deltas: { money: -100, reputation: -3 }, flags: { conned_pension: true } },
    },
    right: {
      label: "Report him to the guard at the gate",
      result: "The guard shrugs -- 'that one again' -- but at least you kept your money.",
      effects: { deltas: { food: -3, security: -1, skill: 2, reputation: 2 } },
    },
  },

  cb_night_market: {
    id: "cb_night_market",
    text: "The Chisokone night market is loud with vendors selling fritters, secondhand clothes, and phone credit.",
    left: {
      label: "Sell what you can spare",
      result: "You lay out a few things on a cloth and make a small profit before the market thins out.",
      effects: { deltas: { money: 25, food: -3, security: -1 } },
    },
    right: {
      label: "Just buy food and move on",
      result: "You grab roasted maize and keep walking. No sense lingering after dark.",
      effects: { deltas: { money: -10, food: 8, security: -1 } },
    },
  },

  cb_jerabo_raid: {
    id: "cb_jerabo_raid",
    requires: (state) => state.flags.jerabo_ties === true,
    text: "Mine security and police raid the old shaft you worked. Word is they're rounding up anyone connected to it.",
    left: {
      label: "Lay low in a relative's house",
      result: "You stay out of sight for two days. The raid passes, but your ore money is gone -- you never got to sell it.",
      effects: { deltas: { money: -40, food: -8, security: -1 } },
    },
    right: {
      label: "Try to sell your ore fast, raid or no raid",
      result: "You find a buyer just in time, but a police vehicle nearly catches you making the trade.",
      effects: { deltas: { money: 50, food: -5, security: -1, reputation: -3 } },
    },
  },

  cb_departure: {
    id: "cb_departure",
    text: "The Copperbelt has taken more out of you than it gave. Time to decide how you leave it behind.",
    left: {
      label: "Buy a proper bus ticket",
      result: "You pay for a seat and leave Kitwe in daylight, lungs still raw from the dust.",
      effects: { deltas: { money: -30, security: 5, food: -3 } },
    },
    right: {
      label: "Hitch a ride on a copper truck",
      result: "You ride out on top of an ore truck, saving your last kwacha for whatever comes next.",
      effects: { deltas: { food: -5, security: -1, money: 10 } },
    },
  },
};

export const sequence = [
  "cb_arrival",
  "cb_gate_labor",
  "cb_jerabo",
  "cb_union",
  "cb_cable_offer",
  "cb_security_search",
  "cb_smelter_job",
  "cb_shaft_collapse",
  "cb_cough",
  "cb_rent_hike",
  "cb_cousin_butchery",
  "cb_pension_scam",
  "cb_night_market",
  "cb_jerabo_raid",
  "cb_departure",
];
