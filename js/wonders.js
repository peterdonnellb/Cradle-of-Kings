// wonders.js — Empire wonders: one-per-world, tech-gated, permanent empire-wide bonuses

function icon(inner, bg = '#D8A93A') {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="${bg}" stroke="#1C1208" stroke-width="2"/>
    <circle cx="24" cy="24" r="22" fill="none" stroke="#F1CE73" stroke-width="1" opacity="0.5"/>
    ${inner}
  </svg>`;
}

const glyphs = {
  great_pyramid: `<polygon points="24,10 38,36 10,36" fill="#F1CE73"/><polygon points="24,10 31,36 24,36" fill="#D8A93A"/>`,
  great_mosque: `<circle cx="24" cy="20" r="8" fill="#F6EFDD"/><rect x="20" y="26" width="8" height="12" fill="#F6EFDD"/><rect x="16" y="14" width="3" height="20" fill="#F6EFDD"/><rect x="29" y="14" width="3" height="20" fill="#F6EFDD"/>`,
  royal_palace: `<rect x="12" y="22" width="24" height="14" fill="#8C3A1F"/><polygon points="10,22 24,10 38,22" fill="#B5502D"/><rect x="20" y="28" width="8" height="8" fill="#223A5E"/>`,
  stone_circles: `<circle cx="16" cy="24" r="4" fill="#8D8474"/><circle cx="24" cy="16" r="4" fill="#8D8474"/><circle cx="32" cy="24" r="4" fill="#8D8474"/><circle cx="24" cy="32" r="4" fill="#8D8474"/>`,
  great_library: `<rect x="12" y="16" width="6" height="20" fill="#4A3427"/><rect x="20" y="16" width="6" height="20" fill="#6B4B33"/><rect x="28" y="16" width="6" height="20" fill="#4A3427"/>`,
  obelisk: `<polygon points="22,10 26,10 28,34 20,34" fill="#8D8474"/><polygon points="22,10 26,10 24,4" fill="#F1CE73"/>`,
  great_dam: `<rect x="10" y="24" width="28" height="8" fill="#8D8474"/><path d="M12,32 Q24,40 36,32" fill="none" stroke="#4FA6AE" stroke-width="3"/>`,
  royal_mint: `<circle cx="24" cy="24" r="10" fill="#D8A93A" stroke="#8C3A1F" stroke-width="1.5"/><text x="24" y="29" font-size="12" text-anchor="middle" fill="#5A3B12" font-family="Georgia,serif">Au</text>`,
};

export const WONDERS = {
  great_pyramid: {
    id: 'great_pyramid', name: 'Great Pyramid', reqTech: 'architecture', productionCost: 180,
    effect: { cityProductionFlat: 2 },
    describe: 'A monument to eternity. +2 production in every city, forever.',
    icon: icon(glyphs.great_pyramid, '#D8A93A'),
  },
  great_mosque: {
    id: 'great_mosque', name: 'Great Mosque', reqTech: 'markets', productionCost: 160,
    effect: { happinessFlat: 5, cultureFlat: 2 },
    describe: 'Draws pilgrims and scholars alike. +5 empire happiness, +2 culture/turn.',
    icon: icon(glyphs.great_mosque, '#F6EFDD'),
  },
  royal_palace: {
    id: 'royal_palace', name: 'Royal Palace', reqTech: 'architecture', productionCost: 170,
    effect: { goldFlat: 5, cultureFlat: 2 },
    describe: 'A second seat of power. +5 gold/turn, +2 culture/turn empire-wide.',
    icon: icon(glyphs.royal_palace, '#B5502D'),
  },
  stone_circles: {
    id: 'stone_circles', name: 'Stone Circles', reqTech: 'architecture', productionCost: 140,
    effect: { cultureFlat: 4 },
    describe: 'Ancient megalithic rings sacred to your ancestors. +4 culture/turn empire-wide.',
    icon: icon(glyphs.stone_circles, '#8D8474'),
  },
  great_library: {
    id: 'great_library', name: 'Great Library', reqTech: 'caravans', productionCost: 190,
    effect: { scienceFlat: 5 },
    describe: 'Scrolls from every corner of the world. +5 science/turn empire-wide.',
    icon: icon(glyphs.great_library, '#4A3427'),
  },
  obelisk: {
    id: 'obelisk', name: 'Obelisk', reqTech: 'ocean_navigation', productionCost: 130,
    effect: { cultureFlat: 3, goldFlat: 3 },
    describe: 'A gleaming marker of your reach. +3 culture/turn, +3 gold/turn.',
    icon: icon(glyphs.obelisk, '#8D8474'),
  },
  great_dam: {
    id: 'great_dam', name: 'Great Dam', reqTech: 'engineering', productionCost: 150,
    effect: { foodFlat: 3 },
    describe: 'Tames the flood for year-round harvests. +3 food in every city.',
    icon: icon(glyphs.great_dam, '#4FA6AE'),
  },
  royal_mint: {
    id: 'royal_mint', name: 'Royal Mint', reqTech: 'currency', productionCost: 150,
    effect: { goldFlat: 6 },
    describe: 'Empire-standard coinage accelerates every trade. +6 gold/turn empire-wide.',
    icon: icon(glyphs.royal_mint, '#D8A93A'),
  },
};

export function isWonderAvailable(state, player, wonderId) {
  const wonder = WONDERS[wonderId];
  if (!wonder) return false;
  if (state.builtWonders.has(wonderId)) return false;
  if (!player.technologies.has(wonder.reqTech)) return false;
  return true;
}
