// wonders.js — Empire wonders: one-per-world, tech-gated, permanent empire-wide bonuses

import { facetedGem, contactShadow } from './facetedArt.js';

const OUT = '#1C1208';

function icon(inner, bg = '#D8A93A') {
  const light = '#fff';
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="${bg}" stroke="${OUT}" stroke-width="2"/>
    <path d="M24,2 A22,22 0 0,1 44,18 L24,24Z" fill="${light}" opacity="0.08"/>
    <circle cx="24" cy="24" r="22" fill="none" stroke="#F1CE73" stroke-width="1" opacity="0.5"/>
    ${contactShadow(24, 38, 13, 3, 0.22)}
    ${inner}
  </svg>`;
}

const glyphs = {
  // faceted 3-face pyramid: light left face, dark right face, thin cap highlight
  great_pyramid: `<polygon points="24,8 10,36 24,36" fill="#F1CE73" stroke="${OUT}" stroke-width="1"/>
    <polygon points="24,8 38,36 24,36" fill="#B5822A" stroke="${OUT}" stroke-width="1"/>
    <line x1="24" y1="8" x2="17" y2="22" stroke="#fff" stroke-width="0.8" opacity="0.3"/>
    <rect x="20" y="30" width="8" height="6" fill="#8C3A1F" opacity="0.5"/>`,

  // faceted dome (3 vertical facets) over a rectangular base, twin faceted minarets
  great_mosque: `<rect x="19" y="24" width="10" height="14" fill="#E8DFC8" stroke="${OUT}" stroke-width="1"/>
    <rect x="19" y="24" width="5" height="14" fill="#F6EFDD" stroke="${OUT}" stroke-width="1"/>
    <polygon points="24,10 18,20 24,22 30,20" fill="#F6EFDD" stroke="${OUT}" stroke-width="1"/>
    <polygon points="24,10 24,22 30,20" fill="#D4C7A0" opacity="0.7"/>
    <rect x="13" y="14" width="3" height="22" fill="#E8DFC8" stroke="${OUT}" stroke-width="0.8"/>
    <rect x="32" y="14" width="3" height="22" fill="#D4C7A0" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="14.5,10 13,14 16,14" fill="#F1CE73"/><polygon points="33.5,10 32,14 35,14" fill="#D8A93A"/>`,

  // faceted palace: 3-facet roof, light/dark wall split
  royal_palace: `<rect x="10" y="24" width="14" height="12" fill="#B5502D" stroke="${OUT}" stroke-width="1"/>
    <rect x="24" y="24" width="14" height="12" fill="#8C3A1F" stroke="${OUT}" stroke-width="1"/>
    <polygon points="8,24 24,10 24,24" fill="#D97B4F" stroke="${OUT}" stroke-width="1"/>
    <polygon points="24,10 40,24 24,24" fill="#B5502D" stroke="${OUT}" stroke-width="1"/>
    <rect x="20" y="28" width="8" height="8" fill="#223A5E" stroke="${OUT}" stroke-width="0.8"/>`,

  // faceted standing stones: each a 2-facet monolith, not a flat circle
  stone_circles: `${[[13, 26], [22, 20], [31, 26], [22, 32]].map(([x, y], i) => `
    <polygon points="${x - 3},${y + 6} ${x - 3},${y - 4} ${x},${y - 6} ${x},${y + 6}" fill="#ADA48E"/>
    <polygon points="${x},${y + 6} ${x},${y - 6} ${x + 3},${y - 4} ${x + 3},${y + 6}" fill="#7A7261"/>`).join('')}`,

  // faceted book spines with a highlight edge instead of flat rectangles
  great_library: `<polygon points="11,16 11,36 17,36 17,14" fill="#6B4B33" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="19,14 19,36 25,36 25,12" fill="#8C6239" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="27,16 27,36 33,36 33,14" fill="#4A3427" stroke="${OUT}" stroke-width="0.8"/>
    <line x1="13" y1="18" x2="13" y2="34" stroke="#A87A4A" stroke-width="0.6" opacity="0.6"/>
    <line x1="21" y1="16" x2="21" y2="34" stroke="#C99A5E" stroke-width="0.6" opacity="0.6"/>`,

  // faceted obelisk: light-left / dark-right taper, gold capstone gem
  obelisk: `<polygon points="20,34 21,12 24,8 24,34" fill="#ADA48E" stroke="${OUT}" stroke-width="1"/>
    <polygon points="24,34 24,8 27,12 28,34" fill="#7A7261" stroke="${OUT}" stroke-width="1"/>
    ${facetedGem(24, 9, 3.6, '#FFE27A', '#E8B93A', '#D8A030', '#A8721F')}`,

  // faceted dam wall with a faceted water gleam instead of a stroked curve
  great_dam: `<polygon points="8,26 8,34 40,34 40,22" fill="#8D8474" stroke="${OUT}" stroke-width="1"/>
    <polygon points="8,26 24,22 40,22 40,29 8,34" fill="#655E51" opacity="0.5"/>
    <polygon points="14,38 20,32 26,38 20,44" fill="#5FBEC4" opacity="0.8"/>
    <polygon points="26,40 30,36 34,40 30,44" fill="#4FA6AE" opacity="0.7"/>`,

  // faceted coin stack instead of a flat circle-with-text
  royal_mint: `<ellipse cx="24" cy="32" rx="10" ry="3.4" fill="#B5822A" stroke="${OUT}" stroke-width="1"/>
    <ellipse cx="24" cy="28" rx="10" ry="3.4" fill="#D8A93A" stroke="${OUT}" stroke-width="1"/>
    ${facetedGem(24, 20, 7, '#FFE27A', '#F1CE73', '#D8A93A', '#B5822A')}`,
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
