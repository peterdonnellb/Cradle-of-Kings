// buildings.js — City improvements: cost, effects, and inline SVG icon badges
// Chosen one-per-population-increase (Polytopia-style level-up reward), or queued in production.

import { isBuildingUnlocked } from './tech.js';

function icon(inner, bg = '#D8A93A') {
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="${bg}" stroke="#2A1B10" stroke-width="1.5"/>
    ${inner}
  </svg>`;
}

const glyphs = {
  granary: `<polygon points="20,8 32,16 32,32 8,32 8,16" fill="#4A3427"/><rect x="14" y="20" width="12" height="12" fill="#F1CE73"/>`,
  market: `<rect x="8" y="18" width="24" height="12" fill="#8C3A1F"/><polygon points="6,18 20,8 34,18" fill="#B5502D"/><rect x="17" y="22" width="6" height="8" fill="#F1CE73"/>`,
  temple: `<rect x="10" y="16" width="4" height="14" fill="#F6EFDD"/><rect x="18" y="16" width="4" height="14" fill="#F6EFDD"/><rect x="26" y="16" width="4" height="14" fill="#F6EFDD"/><polygon points="20,6 32,16 8,16" fill="#223A5E"/>`,
  walls: `<rect x="6" y="20" width="8" height="10" fill="#8D8474"/><rect x="16" y="20" width="8" height="10" fill="#655E51"/><rect x="26" y="20" width="8" height="10" fill="#8D8474"/><rect x="6" y="16" width="28" height="5" fill="#655E51"/>`,
  forge: `<rect x="12" y="18" width="16" height="12" fill="#3E3E42"/><circle cx="20" cy="14" r="6" fill="#C6491F"/>`,
  harbor: `<path d="M8,26 Q20,34 32,26 L28,32 Q20,38 12,32Z" fill="#F1CE73"/><rect x="19" y="6" width="2" height="22" fill="#4A3427"/><polygon points="21,8 32,14 21,18" fill="#F6EFDD"/>`,
  university: `<rect x="10" y="18" width="20" height="12" fill="#2E6B4F"/><polygon points="20,8 33,16 7,16" fill="#1F4B37"/><circle cx="20" cy="24" r="3" fill="#F1CE73"/>`,
  capital_seat: `<rect x="9" y="17" width="22" height="14" fill="#D8A93A"/><polygon points="20,6 32,17 8,17" fill="#8C3A1F"/><rect x="17" y="22" width="6" height="9" fill="#223A5E"/>`,
};

export const BUILDINGS = {
  granary: {
    id: 'granary', name: 'Granary', category: 'growth',
    cost: { wood: 20, stone: 10 }, productionCost: 25,
    coastalOnly: false,
    describe: '+50% stored food carries over after growth; +1 food in city center.',
    icon: icon(glyphs.granary, '#EDE0C0'),
  },
  market: {
    id: 'market', name: 'Market', category: 'economy',
    cost: { wood: 15, gold: 10 }, productionCost: 25,
    coastalOnly: false,
    describe: '+3 gold per turn; +25% gold from adjacent trade routes.',
    icon: icon(glyphs.market, '#C9A857'),
  },
  temple: {
    id: 'temple', name: 'Temple', category: 'culture',
    cost: { stone: 15, gold: 10 }, productionCost: 25,
    coastalOnly: false,
    describe: '+2 happiness; +2 culture per turn; unlocks Religious victory progress.',
    icon: icon(glyphs.temple, '#223A5E'),
  },
  walls: {
    id: 'walls', name: 'Walls', category: 'defense',
    cost: { stone: 25 }, productionCost: 30,
    coastalOnly: false,
    describe: '+50% defense for units garrisoned in this city.',
    icon: icon(glyphs.walls, '#8D8474'),
  },
  forge: {
    id: 'forge', name: 'Forge', category: 'production',
    cost: { wood: 15, iron: 10 }, productionCost: 30,
    coastalOnly: false,
    describe: '+2 production per turn; unlocks Iron/Copper unit upgrades.',
    icon: icon(glyphs.forge, '#3E3E42'),
  },
  harbor: {
    id: 'harbor', name: 'Harbor', category: 'naval',
    cost: { wood: 20, gold: 5 }, productionCost: 25,
    coastalOnly: true,
    describe: '+2 food and +2 gold from adjacent water tiles; enables ship production.',
    icon: icon(glyphs.harbor, '#2C7E8C'),
  },
  university: {
    id: 'university', name: 'University', category: 'science',
    cost: { stone: 15, gold: 15 }, productionCost: 35,
    coastalOnly: false,
    describe: '+3 science per turn (technology arrives in a later update).',
    icon: icon(glyphs.university, '#2E6B4F'),
  },
  capital_seat: {
    id: 'capital_seat', name: 'Palace', category: 'capital',
    cost: {}, productionCost: 0, capitalOnly: true,
    describe: 'Seat of the kingdom. +4 gold, +2 culture, cannot be built manually.',
    icon: icon(glyphs.capital_seat, '#D8A93A'),
  },
};

export function eligibleGrowthChoices(city, rand = Math.random, playerTechs = null) {
  const pool = Object.values(BUILDINGS).filter(b =>
    b.id !== 'capital_seat' &&
    !city.improvements.includes(b.id) &&
    (!b.coastalOnly || city.isCoastal) &&
    (!playerTechs || isBuildingUnlocked(b.id, playerTechs))
  );
  const shuffled = [...pool].sort(() => rand() - 0.5);
  return shuffled.slice(0, 3);
}
