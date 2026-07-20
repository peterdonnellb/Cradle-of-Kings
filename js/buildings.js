// buildings.js — City improvements: cost, effects, and inline SVG icon badges
// Chosen one-per-population-increase (Polytopia-style level-up reward), or queued in production.

import { isBuildingUnlocked } from './tech.js';
import { facetedGem } from './facetedArt.js';

function icon(inner, bg = '#D8A93A') {
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="${bg}" stroke="#241708" stroke-width="1.5"/>
    <ellipse cx="20" cy="32" rx="10" ry="2.2" fill="rgba(20,14,8,0.25)"/>
    ${inner}
  </svg>`;
}

const OUT = '#241708';

const glyphs = {
  granary: `<polygon points="20,8 32,16 32,32 20,32 20,16" fill="#3A2A1D" stroke="${OUT}" stroke-width="1"/>
    <polygon points="20,8 8,16 8,32 20,32 20,16" fill="#4A3427" stroke="${OUT}" stroke-width="1"/>
    <line x1="12" y1="14" x2="20" y2="9" stroke="#fff" stroke-width="0.7" opacity="0.2"/>
    <rect x="14" y="20" width="12" height="12" fill="#F1CE73" stroke="${OUT}" stroke-width="1"/>
    <rect x="14" y="20" width="6" height="12" fill="#D8A93A" opacity="0.6"/>`,
  market: `<rect x="8" y="18" width="12" height="12" fill="#6B2018" stroke="${OUT}" stroke-width="1"/>
    <rect x="20" y="18" width="12" height="12" fill="#8C3A1F" stroke="${OUT}" stroke-width="1"/>
    <polygon points="6,18 20,8 20,18" fill="#8C3A1F" stroke="${OUT}" stroke-width="1"/><polygon points="20,8 34,18 20,18" fill="#B5502D" stroke="${OUT}" stroke-width="1"/>
    <line x1="11" y1="15.5" x2="20" y2="9" stroke="#fff" stroke-width="0.7" opacity="0.2"/>
    <rect x="17" y="22" width="6" height="8" fill="#F1CE73" stroke="${OUT}" stroke-width="0.8"/>`,
  temple: `<rect x="9" y="16" width="4" height="14" fill="#D8CBA8" stroke="${OUT}" stroke-width="0.9"/><rect x="18" y="16" width="4" height="14" fill="#F6EFDD" stroke="${OUT}" stroke-width="0.9"/><rect x="27" y="16" width="4" height="14" fill="#D8CBA8" stroke="${OUT}" stroke-width="0.9"/>
    <polygon points="20,6 32,16 20,16" fill="#2C4A70" stroke="${OUT}" stroke-width="1"/><polygon points="8,16 20,6 20,16" fill="#223A5E" stroke="${OUT}" stroke-width="1"/>
    <line x1="12" y1="13.5" x2="20" y2="7" stroke="#fff" stroke-width="0.7" opacity="0.2"/>
    <rect x="8" y="29" width="24" height="3" fill="#8C3A1F" stroke="${OUT}" stroke-width="0.8"/>`,
  walls: `<rect x="6" y="20" width="7" height="10" fill="#8D8474" stroke="${OUT}" stroke-width="1"/><rect x="13" y="20" width="7" height="10" fill="#655E51" stroke="${OUT}" stroke-width="1"/>
    <rect x="20" y="20" width="7" height="10" fill="#8D8474" stroke="${OUT}" stroke-width="1"/><rect x="27" y="20" width="7" height="10" fill="#655E51" stroke="${OUT}" stroke-width="1"/>
    <rect x="6" y="15" width="14" height="5" fill="#8D8474" stroke="${OUT}" stroke-width="1"/><rect x="20" y="15" width="14" height="5" fill="#655E51" stroke="${OUT}" stroke-width="1"/>
    <rect x="7" y="11" width="3.4" height="4" fill="#8D8474" stroke="${OUT}" stroke-width="0.7"/><rect x="13" y="11" width="3.4" height="4" fill="#655E51" stroke="${OUT}" stroke-width="0.7"/>
    <rect x="19" y="11" width="3.4" height="4" fill="#8D8474" stroke="${OUT}" stroke-width="0.7"/><rect x="25" y="11" width="3.4" height="4" fill="#655E51" stroke="${OUT}" stroke-width="0.7"/><rect x="31" y="11" width="3" height="4" fill="#8D8474" stroke="${OUT}" stroke-width="0.7"/>
    <line x1="8" y1="18" x2="18" y2="18" stroke="#fff" stroke-width="0.6" opacity="0.15"/>`,
  forge: `<rect x="12" y="18" width="16" height="12" fill="#2E2E32" stroke="${OUT}" stroke-width="1"/><rect x="12" y="18" width="8" height="12" fill="#3E3E42" stroke="${OUT}" stroke-width="1"/>
    <circle cx="20" cy="14" r="6.5" fill="#5A1C0C" stroke="${OUT}" stroke-width="1"/>
    ${facetedGem(20, 14, 4.6, '#FFC96B', '#F1863E', '#C6491F', '#7A2510')}`,
  harbor: `<path d="M8,26 Q20,34 32,26 L28,32 Q20,38 12,32Z" fill="#F1CE73" stroke="${OUT}" stroke-width="1"/>
    <rect x="18.4" y="6" width="2.6" height="22" fill="#4A3427" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="21,8 32,14 21,18" fill="#F6EFDD" stroke="${OUT}" stroke-width="0.9"/><polygon points="18.4,9 10,15 18.4,17" fill="#D8CBA8" stroke="${OUT}" stroke-width="0.9"/>`,
  university: `<rect x="10" y="18" width="10" height="12" fill="#1F4B37" stroke="${OUT}" stroke-width="1"/><rect x="20" y="18" width="10" height="12" fill="#2E6B4F" stroke="${OUT}" stroke-width="1"/>
    <polygon points="20,8 7,16 20,16" fill="#1F4B37" stroke="${OUT}" stroke-width="1"/><polygon points="20,8 33,16 20,16" fill="#2E6B4F" stroke="${OUT}" stroke-width="1"/>
    <line x1="11" y1="14.5" x2="20" y2="9" stroke="#fff" stroke-width="0.7" opacity="0.2"/>
    <circle cx="20" cy="24" r="3.2" fill="#F1CE73" stroke="${OUT}" stroke-width="0.8"/>`,
  capital_seat: `<rect x="9" y="17" width="11" height="14" fill="#B5822A" stroke="${OUT}" stroke-width="1"/><rect x="20" y="17" width="11" height="14" fill="#D8A93A" stroke="${OUT}" stroke-width="1"/>
    <polygon points="20,6 8,17 20,17" fill="#6B2A18" stroke="${OUT}" stroke-width="1"/><polygon points="20,6 32,17 20,17" fill="#8C3A1F" stroke="${OUT}" stroke-width="1"/>
    <line x1="11" y1="15" x2="20" y2="8" stroke="#fff" stroke-width="0.7" opacity="0.2"/>
    <rect x="17" y="22" width="6" height="9" fill="#223A5E" stroke="${OUT}" stroke-width="0.8"/>`,
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
