// resources.js — Strategic & luxury resource definitions + inline SVG icon badges.
// These appear as small overlay tokens on qualifying hex tiles, and in city/production UI.
// The badge ring encodes category at a glance: plain gold ring = basic, steel double-ring =
// strategic (unlocks specific units), gold ring + sparkle corners = luxury (unlocks wonders/
// bonuses) — the same "encode info in the frame, not just the icon" idea used for units.

import { facetedGem, facetedRock, contactShadow } from './facetedArt.js';

const RC = {
  ivory: '#F1E7D0', bark: '#4A3427', barkLight: '#6B4B33', gold: '#D8A93A', goldLight: '#F1CE73',
  goldDeep: '#8C3A1F', steel: '#9CA0A6', steelDark: '#5B5B5F', copper: '#C6491F', copperDark: '#7A2C10',
  red: '#8C2F2F', green: '#2E6B4F', water: '#2C7E8C', waterLight: '#5FBEC4', stone: '#8D8474',
  stoneDark: '#5B5348', salt: '#EAF3F2',
};

function badge(inner, bg, category = 'basic') {
  const ringId = 'r' + Math.random().toString(36).slice(2, 8);
  const ring = category === 'luxury'
    ? `<circle cx="16" cy="16" r="14" fill="${bg}" stroke="${RC.gold}" stroke-width="2"/>
       <circle cx="16" cy="16" r="14" fill="none" stroke="#2A1B10" stroke-width="1"/>
       <g fill="${RC.goldLight}"><circle cx="16" cy="2.4" r="1"/><circle cx="16" cy="29.6" r="1"/><circle cx="2.4" cy="16" r="1"/><circle cx="29.6" cy="16" r="1"/></g>`
    : category === 'strategic'
    ? `<circle cx="16" cy="16" r="14" fill="${bg}" stroke="${RC.steelDark}" stroke-width="1.6"/>
       <circle cx="16" cy="16" r="11.5" fill="none" stroke="${RC.steel}" stroke-width="1" opacity="0.7"/>`
    : `<circle cx="16" cy="16" r="14" fill="${bg}" stroke="#2A1B10" stroke-width="1.4"/>`;
  return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${ring}${inner}</svg>`;
}

const OUT = '#241708';

const icons = {
  food: () => badge(`
    <path d="M16,24 L16,14" stroke="${RC.green}" stroke-width="1.6"/>
    <polygon points="16,14 12,10 12,6 16,9" fill="${RC.gold}" stroke="${OUT}" stroke-width="0.5"/>
    <polygon points="16,14 20,10 20,6 16,9" fill="${RC.goldLight}" stroke="${OUT}" stroke-width="0.5"/>
    <polygon points="16,18 12,14 12,10 16,13" fill="${RC.goldLight}" stroke="${OUT}" stroke-width="0.5"/>
    <polygon points="16,18 20,14 20,10 16,13" fill="${RC.gold}" stroke="${OUT}" stroke-width="0.5"/>
    <polygon points="13,24 16,26 16,20 13,20" fill="${RC.red}" stroke="${OUT}" stroke-width="0.5"/>
    <polygon points="19,24 16,26 16,20 19,20" fill="#6B2020" stroke="${OUT}" stroke-width="0.5"/>`, RC.ivory, 'basic'),

  wood: () => badge(`
    ${contactShadow(15, 24, 7, 1.8, 0.22)}
    <polygon points="9,24 9,10 12,9 12,23" fill="${RC.barkLight}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="12,23 12,9 14.5,10 14.5,24" fill="${RC.bark}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="9,10 12,9 14.5,10 12,11.4" fill="#8C6239"/>
    <polygon points="16.5,24 16.5,9 19.5,8 19.5,23" fill="${RC.bark}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="19.5,23 19.5,8 22,9 22,24" fill="${RC.barkLight}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="16.5,9 19.5,8 22,9 19.5,10.4" fill="#6B4B2A"/>`, '#E8DCC0', 'basic'),

  stone: () => badge(facetedRock(16, 18, 9, '#D4C9AC', RC.stone, RC.stoneDark), '#EDE0C0', 'basic'),

  gold: () => badge(facetedGem(16, 18, 8, '#FFE27A', '#E8B93A', RC.gold, RC.goldDeep), '#F1CE73', 'basic'),

  iron: () => badge(`
    <polygon points="16,9 22,13 22,21 16,25 10,21 10,13" fill="${RC.steel}" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="16,9 22,13 16,17 10,13" fill="#D4D8DC"/>
    <polygon points="16,17 22,13 22,21 16,25" fill="${RC.steelDark}"/>
    <polygon points="16,17 10,13 10,21 16,25" fill="${RC.steel}" opacity="0.8"/>`, '#C7C2B8', 'strategic'),

  copper: () => badge(`
    <polygon points="16,9 22,13 22,21 16,25 10,21 10,13" fill="${RC.copper}" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="16,9 22,13 16,17 10,13" fill="#E88450"/>
    <polygon points="16,17 22,13 22,21 16,25" fill="${RC.copperDark}"/>
    <polygon points="16,17 10,13 10,21 16,25" fill="${RC.copper}" opacity="0.75"/>`, '#EED9A6', 'strategic'),

  salt: () => badge(facetedGem(16, 17, 7.5, '#FFFFFF', '#F0F0EC', RC.salt, '#B8AC8C'), '#DCE7E8', 'luxury'),

  ivory: () => badge(`
    <polygon points="11,23 10,15 13,10 17,8 16,12 12,16 12,23" fill="${RC.ivory}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="13,10 17,8 16,12 12,16" fill="#FFFFFF" opacity="0.6"/>
    <polygon points="12,16 12,23 15,22 14,15" fill="#D8CBA8" opacity="0.7"/>`, '#E8DCC0', 'luxury'),

  gems: () => badge(facetedGem(16, 17, 8, '#A8C8F0', '#6F97D0', '#3E5D8C', '#233A5C'), '#26405F', 'luxury'),

  horses: () => badge(`
    <path d="M16,8 Q22,8 22,15 Q22,19 18,20 L18,24 Q18,26 16,26 Q14,26 14,24 L14,20 Q10,19 10,15 Q10,8 16,8Z" fill="none" stroke="${RC.steelDark}" stroke-width="2.6"/>
    <path d="M16,8 Q22,8 22,15 Q22,19 18,20 L18,24 Q18,26 16,26 Q14,26 14,24 L14,20 Q10,19 10,15 Q10,8 16,8Z" fill="none" stroke="${OUT}" stroke-width="0.5"/>
    <circle cx="12.5" cy="12" r="1" fill="${RC.steelDark}"/><circle cx="19.5" cy="12" r="1" fill="${RC.steelDark}"/><circle cx="11" cy="16.5" r="1" fill="${RC.steelDark}"/><circle cx="21" cy="16.5" r="1" fill="${RC.steelDark}"/>`, '#D8C594', 'strategic'),

  fish: () => badge(`
    <polygon points="8,16 13,11 20,13 20,19 13,21" fill="${RC.water}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="13,11 20,13 15,16 13,14" fill="${RC.waterLight}" opacity="0.8"/>
    <polygon points="8,16 3,11 3,21" fill="${RC.waterLight}" stroke="${OUT}" stroke-width="0.5"/>
    <circle cx="14" cy="14.5" r="1.1" fill="#0F1B22"/>`, '#DCEEF0', 'basic'),

  spices: () => badge(`
    <polygon points="9,24 9,17 16,15 16,24" fill="${RC.copper}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="16,24 16,15 23,17 23,24" fill="${RC.copperDark}" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="9,17 16,15 23,17 16,19" fill="#D9662E" stroke="${OUT}" stroke-width="0.5"/>
    <circle cx="12" cy="20" r="1.3" fill="${RC.goldLight}"/><circle cx="16" cy="21.5" r="1.3" fill="${RC.gold}"/><circle cx="20" cy="20" r="1.3" fill="${RC.goldLight}"/>`, '#F1CE73', 'luxury'),
};

export const RESOURCES = {
  food: { id: 'food', name: 'Food', category: 'basic' },
  wood: { id: 'wood', name: 'Wood', category: 'basic' },
  stone: { id: 'stone', name: 'Stone', category: 'basic' },
  gold: { id: 'gold', name: 'Gold', category: 'basic' },
  iron: { id: 'iron', name: 'Iron', category: 'strategic', unlocks: ['Axeman', 'Crossbowman'] },
  copper: { id: 'copper', name: 'Copper', category: 'strategic', unlocks: ['Shield Bearer'] },
  salt: { id: 'salt', name: 'Salt', category: 'luxury', unlocks: ['Caravan Trade Bonus'] },
  ivory: { id: 'ivory', name: 'Ivory', category: 'luxury', unlocks: ['Elephant Rider'] },
  gems: { id: 'gems', name: 'Gems', category: 'luxury', unlocks: ['Royal Mint Wonder'] },
  horses: { id: 'horses', name: 'Horses', category: 'strategic', unlocks: ['Horseman', 'War Chariot'] },
  fish: { id: 'fish', name: 'Fish', category: 'basic' },
  spices: { id: 'spices', name: 'Spices', category: 'luxury', unlocks: ['Merchant Fleet Bonus'] },
};

const _cache = new Map();
export function getResourceSVG(id) {
  if (_cache.has(id)) return _cache.get(id);
  const fn = icons[id];
  const svg = fn ? fn() : badge('', RC.ivory, 'basic');
  _cache.set(id, svg);
  return svg;
}

const _imgCache = new Map();
export function getResourceImage(id) {
  if (_imgCache.has(id)) return _imgCache.get(id);
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(getResourceSVG(id));
  _imgCache.set(id, img);
  return img;
}
