// js/content/chapter8.js
// Chapter 8: Southern Province

export const cards = {
  so_arrival: {
    id: "so_arrival",
    text: "You step off the bus in Choma. The maize fields on either side of the road are stunted and brown -- the rains failed again this year.",
    left: {
      label: "Head into town",
      result: "Choma's main road is quiet. A few traders sell tomatoes wilting in the heat.",
      effects: { deltas: { food: -3, security: -1, reputation: 1 } },
    },
    right: {
      label: "Walk out toward the cattle posts",
      result: "Dust rises off the cracked earth. Herders drive thin cattle toward a borehole in the distance.",
      effects: { deltas: { food: -5, security: -1, skill: 1 } },
    },
  },

  so_herding_job: {
    id: "so_herding_job",
    text: "A cattle owner near Pemba needs someone to herd his animals to the last working borehole, three hours' walk away.",
    left: {
      label: "Take the job",
      result: "You walk the herd through the heat all day. He pays you K45 and a bag of mealie meal.",
      effects: { deltas: { money: 45, food: 5, security: -2, skill: 2 } },
    },
    right: {
      label: "Decline",
      result: "Three hours in this sun for K45 doesn't sit right with you.",
      effects: { deltas: { food: -4, security: -1 } },
    },
  },

  so_drought_relief: {
    id: "so_drought_relief",
    text: "A government relief truck is handing out maize meal in Monze. The line stretches around the block.",
    left: {
      label: "Wait in line",
      result: "After three hours you get a 10kg bag. Worth the wait.",
      effects: { deltas: { food: 15, security: -1 } },
    },
    right: {
      label: "Skip it and keep moving",
      result: "You can't afford to lose half a day standing in a queue.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  so_cattle_deal: {
    id: "so_cattle_deal",
    text: "A man in Kalomo offers you a young ox for K120 -- half what it should cost. He won't say where it came from.",
    left: {
      label: "Buy it",
      result: "You lead the ox away at dusk. Cattle theft is a serious business out here, and this animal has no papers.",
      effects: { deltas: { money: -120, territory: 10, security: -1 }, flags: { rustled_cattle: true } },
    },
    right: {
      label: "Refuse",
      result: "A stolen ox in cattle country gets men killed. You keep walking.",
      effects: { deltas: { food: -3, security: -1, reputation: 2 } },
    },
  },

  so_livestock_officer: {
    id: "so_livestock_officer",
    requires: (state) => state.flags.rustled_cattle === true,
    text: "A livestock officer at a roadblock near Zimba is checking brand marks for foot-and-mouth control. He looks hard at your ox.",
    left: {
      label: "Let him inspect it",
      result: "The brand doesn't match anything you can explain. He impounds the ox on the spot.",
      effects: { deltas: { territory: -10, reputation: -6, security: -1 }, flags: { criminal_record: true } },
    },
    right: {
      label: "Cut through the bush around the roadblock",
      result: "You drive the ox off the road and around, losing half a day and skinning your legs on thorns.",
      effects: { deltas: { food: -8, security: -1, skill: 1 } },
    },
  },

  so_border_run: {
    id: "so_border_run",
    text: "A trader at Kazungula offers you K80 to carry a sack of secondhand clothes across the border post without declaring it.",
    left: {
      label: "Take the sack across",
      result: "You slip through the informal crossing near the river, past the main post. Easy money, so far.",
      effects: { deltas: { money: 80, food: -3, security: -2 }, flags: { border_runner: true } },
    },
    right: {
      label: "Refuse",
      result: "Getting caught smuggling at Kazungula means far more trouble than K80 is worth.",
      effects: { deltas: { food: -3, security: -1, reputation: 1 } },
    },
  },

  so_customs_stop: {
    id: "so_customs_stop",
    requires: (state) => state.flags.border_runner === true,
    text: "A customs officer near the Kazungula bridge recognizes you from last week and asks what's in your bag this time.",
    left: {
      label: "Show him the bag, empty-handed",
      result: "He finds nothing this time, but writes your name down. You're on a list now.",
      effects: { deltas: { reputation: -4, security: -1 } },
    },
    right: {
      label: "Offer him something to look away",
      result: "K30 changes hands quietly. He waves you through.",
      effects: { deltas: { money: -30, security: 2 } },
    },
  },

  so_well_digging: {
    id: "so_well_digging",
    text: "A village near Gwembe is digging a community well by hand, chasing groundwater that keeps sinking lower every dry season.",
    left: {
      label: "Join the digging",
      result: "Hours of hard labor in a narrow pit. When water finally seeps in, the whole village cheers.",
      effects: { deltas: { skill: 2, food: -10, reputation: 4 } },
    },
    right: {
      label: "Offer money instead of labor",
      result: "You give K20 toward tools. They accept it, but it's not the same as showing up with a shovel.",
      effects: { deltas: { money: -20, food: -3, reputation: 4 } },
    },
  },

  so_falls_guide: {
    id: "so_falls_guide",
    text: "Near Victoria Falls a tourist asks if you'll guide her off the marked path to a quieter viewpoint, cash in hand.",
    left: {
      label: "Guide her there",
      result: "She's thrilled with the spray and the rainbow over the gorge, and tips you K60 -- more than you expected.",
      effects: { deltas: { money: 60, reputation: 3, security: -2 } },
    },
    right: {
      label: "Tell her to stick to the official path",
      result: "Unlicensed guiding near the Falls can get you arrested. You point her back the safe way.",
      effects: { deltas: { food: -3, security: -1, reputation: 1 } },
    },
  },

  so_maize_failure: {
    id: "so_maize_failure",
    text: "You check on a small maize plot you'd planted near Kalomo. The stalks are stunted, leaves curling from lack of rain.",
    left: {
      label: "Buy drought-resistant seed for next season",
      result: "K35 for sorghum seed instead of maize. The agro-dealer says it'll survive what the maize couldn't.",
      effects: { deltas: { money: -35, skill: 2, food: -3 } },
    },
    right: {
      label: "Salvage what you can and move on",
      result: "You strip what few cobs survived. It isn't much, but it's something.",
      effects: { deltas: { food: 6, security: -1 } },
    },
  },

  so_uncle_vaccine: {
    id: "so_uncle_vaccine",
    text: "Your uncle near Namwala sends word -- his last two cattle need a K40 vaccine or the whole herd could catch foot-and-mouth.",
    left: {
      label: "Send the money",
      result: "The vet reaches him in time. He says he won't forget it.",
      effects: { deltas: { money: -40, food: -3, reputation: 4 } },
    },
    right: {
      label: "Tell him you have nothing to spare",
      result: "He doesn't blame you, but you know what losing those cattle would mean for his family.",
      effects: { deltas: { food: -3, reputation: 4 } },
    },
  },

  so_headman_dispute: {
    id: "so_headman_dispute",
    text: "A village headman near Choma asks you to help settle a dispute between two families over a dried-up borehole.",
    left: {
      label: "Help mediate",
      result: "You sit through hours of arguing in the shade of a mopane tree. The families agree to share access on alternating days.",
      effects: { deltas: { reputation: 7, skill: 2, food: -5 } },
    },
    right: {
      label: "Stay out of village politics",
      result: "Not your village, not your fight. You keep walking.",
      effects: { deltas: { food: -3, security: -1 } },
    },
  },

  so_charcoal: {
    id: "so_charcoal",
    text: "A charcoal burner outside Livingstone offers you a cut if you help fell trees and load bags for the roadside trade.",
    left: {
      label: "Help him burn and bag it",
      result: "Illegal in this forest reserve, but the money is real and the buyers never ask questions.",
      effects: { deltas: { money: 55, food: -6, security: -2 }, flags: { illegal_charcoal: true } },
    },
    right: {
      label: "Decline",
      result: "The land's dry enough without more trees coming down. You pass.",
      effects: { deltas: { food: -3, security: -1, reputation: 1 } },
    },
  },

  so_zambezi_crossing: {
    id: "so_zambezi_crossing",
    text: "You reach the Zambezi. The public ferry costs K12, or a fisherman offers to paddle you across for K5 in his mokoro.",
    left: {
      label: "Take the ferry",
      result: "Slower, but the ferry is built for the current. You cross without incident.",
      effects: { deltas: { money: -12, security: 3, food: -2 } },
    },
    right: {
      label: "Go with the fisherman's mokoro",
      result: "The dugout canoe rides low in the water. You make it across, soaked to the waist and cheaper for it.",
      effects: { deltas: { money: -5, security: -1, food: -2 } },
    },
  },

  so_departure: {
    id: "so_departure",
    text: "The dry season has worn Southern province down to bone and dust. You've seen what drought does to people who won't give up their land.",
    left: {
      label: "Leave by the main road",
      result: "You catch a lift on a produce truck heading north, watching the parched fields shrink behind you.",
      effects: { deltas: { money: -10, security: 4, food: -3 } },
    },
    right: {
      label: "Cut through the bush on foot",
      result: "You save what little money you have left, walking until the red soil gives way to greener ground.",
      effects: { deltas: { food: -8, security: -1, skill: 1 } },
    },
  },
};

export const sequence = [
  "so_arrival",
  "so_herding_job",
  "so_drought_relief",
  "so_cattle_deal",
  "so_livestock_officer",
  "so_border_run",
  "so_customs_stop",
  "so_well_digging",
  "so_falls_guide",
  "so_maize_failure",
  "so_uncle_vaccine",
  "so_headman_dispute",
  "so_charcoal",
  "so_zambezi_crossing",
  "so_departure",
];
