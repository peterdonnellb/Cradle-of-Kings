// resources.js — Strategic & luxury resource definitions + tiny inline SVG icon badges
// These appear as small overlay tokens on qualifying hex tiles.

function badge(inner, bg = '#F1CE73') {
  return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="${bg}" stroke="#2A1B10" stroke-width="1.5"/>
    ${inner}
  </svg>`;
}

const icons = {
  food: () => badge(`<path d="M16 8c-4 0-6 4-6 8 0 4 2.5 7 6 7s6-3 6-7c0-4-2-8-6-8z" fill="#8C2F2F"/><path d="M16 8c1 0 1.5-2 3-2" stroke="#2E6B4F" stroke-width="2" fill="none"/>`, '#F6EFDD'),
  wood: () => badge(`<rect x="10" y="9" width="4" height="16" rx="1.5" fill="#6B4B33"/><rect x="16" y="9" width="4" height="16" rx="1.5" fill="#4A3427"/>`, '#E8DCC0'),
  stone: () => badge(`<polygon points="16,7 24,14 21,25 11,25 8,14" fill="#8D8474"/>`, '#EDE0C0'),
  gold: () => badge(`<circle cx="16" cy="16" r="7" fill="#D8A93A" stroke="#8C3A1F" stroke-width="1"/><text x="16" y="20" font-size="9" text-anchor="middle" fill="#5A3B12" font-family="Georgia,serif">Au</text>`, '#F1CE73'),
  iron: () => badge(`<rect x="11" y="12" width="10" height="8" fill="#5B5B5F"/><rect x="9" y="14" width="14" height="4" fill="#3E3E42"/>`, '#C7C2B8'),
  copper: () => badge(`<circle cx="16" cy="16" r="6.5" fill="#C6491F"/><circle cx="16" cy="16" r="6.5" fill="none" stroke="#7A2C10" stroke-width="1"/>`, '#EED9A6'),
  salt: () => badge(`<polygon points="16,9 22,16 16,23 10,16" fill="#F6EFDD" stroke="#B8AC8C" stroke-width="1"/>`, '#DCE7E8'),
  ivory: () => badge(`<path d="M11 22 Q10 12 18 9 Q16 15 13 22Z" fill="#F6EFDD" stroke="#C9BFA0" stroke-width="1"/>`, '#E8DCC0'),
  gems: () => badge(`<polygon points="16,8 22,14 19,24 13,24 10,14" fill="#5C7FB5"/><polygon points="16,8 22,14 16,17 10,14" fill="#7FA0D6"/>`, '#26405F'),
  horses: () => badge(`<path d="M10 22c0-6 3-10 7-10s6 3 6 7c0 1-1 2-2 2l-1-3-2 3h-3l-1-3-2 3c-1 0-2-1-2-1z" fill="#4A3427"/>`, '#D8C594'),
  fish: () => badge(`<path d="M9 16c4-5 10-5 14 0-4 5-10 5-14 0z" fill="#4FA6AE"/><polygon points="9,16 5,12 5,20" fill="#2C7E8C"/>`, '#DCEEF0'),
  spices: () => badge(`<circle cx="13" cy="14" r="3" fill="#B5502D"/><circle cx="19" cy="17" r="3" fill="#8C2F2F"/><circle cx="15" cy="20" r="2.4" fill="#D8A93A"/>`, '#F1CE73'),
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
  const svg = fn ? fn() : badge('');
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
