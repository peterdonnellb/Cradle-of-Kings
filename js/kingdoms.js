// kingdoms.js — Playable kingdoms, their bonuses, and inline SVG emblem crests (geometric, non-flag heraldry)

function crest(id, primary, secondary, glyphPath) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cg-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/>
      </linearGradient>
    </defs>
    <polygon points="50,4 92,26 92,64 50,96 8,64 8,26" fill="url(#cg-${id})" stroke="#1C1208" stroke-width="2.5"/>
    <polygon points="50,12 85,30 85,62 50,88 15,62 15,30" fill="none" stroke="#F1CE73" stroke-width="1.5" opacity="0.6"/>
    ${glyphPath}
  </svg>`;
}

export const KINGDOMS = {
  kemet: {
    id: 'kemet', name: 'Kemet', subtitle: 'Kingdom of the Nile',
    color: '#D8A93A', accent: '#223A5E',
    bonus: 'Engineering & Rivers: +25% production adjacent to rivers; Wonders cost -15%.',
    effects: { riverProductionMult: 0.25, wonderCostMult: -0.15 },
    startingBiomePref: ['nile_valley', 'sahara_desert'],
    emblem: crest('kemet', '#D8A93A', '#8C3A1F', `<path d="M50,26 L58,50 L50,78 L42,50 Z" fill="#223A5E"/><circle cx="50" cy="40" r="6" fill="#F6EFDD"/>`),
  },
  kush: {
    id: 'kush', name: 'Kush', subtitle: 'Archers of Nubia',
    color: '#8C2F2F', accent: '#D8A93A',
    bonus: 'Master Archers: ranged units +20% attack and +1 range.',
    effects: { rangedAttackMult: 0.2, rangedRangeBonus: 1 },
    startingBiomePref: ['savanna', 'nile_valley'],
    emblem: crest('kush', '#8C2F2F', '#4A1414', `<path d="M35,60 Q50,20 65,60" stroke="#F6EFDD" stroke-width="3" fill="none"/><line x1="50" y1="30" x2="50" y2="66" stroke="#F6EFDD" stroke-width="2.5"/>`),
  },
  aksum: {
    id: 'aksum', name: 'Aksum', subtitle: 'Traders of the Red Sea',
    color: '#2E6B4F', accent: '#D8A93A',
    bonus: 'Maritime Trade: +2 gold per naval trade route; ships built 30% faster.',
    effects: { coastalGoldFlat: 2 },
    startingBiomePref: ['coast', 'rift_highlands'],
    emblem: crest('aksum', '#2E6B4F', '#1F4B37', `<rect x="46" y="20" width="8" height="46" fill="#D8A93A"/><polygon points="30,30 70,30 65,40 35,40" fill="#F1CE73"/>`),
  },
  mali: {
    id: 'mali', name: 'Mali', subtitle: 'Empire of Gold',
    color: '#D8A93A', accent: '#1F4B37',
    bonus: 'Gold Economy: +30% gold from mines and markets; wonders grant bonus gold.',
    effects: { cityGoldMult: 0.3 },
    startingBiomePref: ['savanna', 'sahara_desert'],
    emblem: crest('mali', '#F1CE73', '#B5502D', `<circle cx="50" cy="48" r="16" fill="#8C3A1F"/><circle cx="50" cy="48" r="9" fill="#F1CE73"/>`),
  },
  songhai: {
    id: 'songhai', name: 'Songhai', subtitle: 'Riders of the Sahel',
    color: '#B5502D', accent: '#223A5E',
    bonus: 'Cavalry Supremacy: mounted units +1 movement, +15% attack.',
    effects: { cavalryMoveBonus: 1, cavalryAttackMult: 0.15 },
    startingBiomePref: ['sahel_grassland', 'nile_valley'],
    emblem: crest('songhai', '#B5502D', '#6B2E12', `<path d="M30,60 Q50,20 70,60" fill="none" stroke="#F6EFDD" stroke-width="4"/><circle cx="30" cy="60" r="4" fill="#F6EFDD"/><circle cx="70" cy="60" r="4" fill="#F6EFDD"/>`),
  },
  benin: {
    id: 'benin', name: 'Benin', subtitle: 'Bronze Walls',
    color: '#8C2F2F', accent: '#4A3427',
    bonus: 'Fortified Cities: city walls +40% defense; free walls at pop 3.',
    effects: { wallsDefenseMult: 0.4, freeWallsAtPop: 3 },
    startingBiomePref: ['congo_rainforest', 'baobab_forest'],
    emblem: crest('benin', '#4A3427', '#2A1B10', `<rect x="34" y="30" width="32" height="34" fill="#8C2F2F"/><rect x="40" y="30" width="6" height="34" fill="#D8A93A"/><rect x="54" y="30" width="6" height="34" fill="#D8A93A"/>`),
  },
  zimbabwe: {
    id: 'zimbabwe', name: 'Zimbabwe', subtitle: 'Masters of Stone',
    color: '#8D8474', accent: '#4A3427',
    bonus: 'Stone Construction: buildings cost -20% stone; +1 defense per city tier.',
    effects: { buildingStoneCostMult: -0.2, defensePerPopTier: 1 },
    startingBiomePref: ['rift_highlands', 'savanna'],
    emblem: crest('zimbabwe', '#8D8474', '#5A5347', `<polygon points="50,22 66,34 66,58 50,70 34,58 34,34" fill="none" stroke="#F6EFDD" stroke-width="3"/>`),
  },
  zulu: {
    id: 'zulu', name: 'Zulu', subtitle: 'Impi Warriors',
    color: '#2A1B10', accent: '#8C2F2F',
    bonus: 'Elite Warriors: melee units +20% attack when attacking (Impi doctrine).',
    effects: { meleeAttackMultOnAttack: 0.2 },
    startingBiomePref: ['savanna', 'rift_highlands'],
    emblem: crest('zulu', '#2A1B10', '#000000', `<polygon points="50,20 58,50 50,80 42,50" fill="#F1CE73"/><polygon points="50,20 58,50 50,50" fill="#8C2F2F"/>`),
  },
  yoruba: {
    id: 'yoruba', name: 'Yoruba', subtitle: 'Keepers of Culture',
    color: '#8C2F2F', accent: '#D8A93A',
    bonus: 'Cultural Flourishing: +25% culture output; happiness threshold reduced.',
    effects: { cultureMult: 0.25, happinessFlat: 5 },
    startingBiomePref: ['congo_rainforest', 'savanna'],
    emblem: crest('yoruba', '#D8A93A', '#8C2F2F', `<circle cx="50" cy="48" r="6" fill="#F6EFDD"/><circle cx="38" cy="48" r="6" fill="#F6EFDD"/><circle cx="62" cy="48" r="6" fill="#F6EFDD"/><circle cx="50" cy="36" r="6" fill="#F6EFDD"/><circle cx="50" cy="60" r="6" fill="#F6EFDD"/>`),
  },
  swahili: {
    id: 'swahili', name: 'Swahili Coast', subtitle: 'Merchants of the Ocean',
    color: '#2C7E8C', accent: '#D8A93A',
    bonus: 'Commerce Fleet: +2 trade route capacity; ocean tiles usable earlier.',
    effects: { tradeRouteCapacityBonus: 2 },
    startingBiomePref: ['coast', 'mangrove_coast'],
    emblem: crest('swahili', '#2C7E8C', '#1B5661', `<path d="M28,58 Q50,70 72,58 L66,66 Q50,74 34,66 Z" fill="#F1CE73"/><path d="M50,20 L50,58" stroke="#F1CE73" stroke-width="3"/><polygon points="50,22 70,34 50,40" fill="#F6EFDD"/>`),
  },
  ethiopia: {
    id: 'ethiopia', name: 'Ethiopia', subtitle: 'Highland Fortress',
    color: '#2E6B4F', accent: '#8C2F2F',
    bonus: 'Mountain Warfare: units +25% defense on highlands; no highland move penalty.',
    effects: { highlandDefenseBonus: 0.25, highlandMoveFree: true },
    startingBiomePref: ['rift_highlands', 'volcanic_highlands'],
    emblem: crest('ethiopia', '#2E6B4F', '#1F4B37', `<polygon points="30,64 50,24 70,64" fill="#8C2F2F"/><polygon points="40,64 50,40 60,64" fill="#D8A93A"/>`),
  },
  carthage: {
    id: 'carthage', name: 'Carthage', subtitle: 'Lords of the Sea',
    color: '#223A5E', accent: '#D8A93A',
    bonus: 'Naval Expansion: ships +2 movement; coastal cities found for free harbor.',
    effects: { freeHarborOnCoastalFound: true },
    startingBiomePref: ['coast', 'sahara_desert'],
    emblem: crest('carthage', '#223A5E', '#152941', `<path d="M32,54 Q50,30 68,54 Q50,44 32,54Z" fill="#D8A93A"/><rect x="48" y="30" width="4" height="26" fill="#D8A93A"/>`),
  },
};

export function getKingdomList() {
  return Object.values(KINGDOMS);
}
