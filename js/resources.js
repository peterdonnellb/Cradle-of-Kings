// resources.js — Strategic & luxury resource definitions + inline SVG icon badges.
// These appear as small overlay tokens on qualifying hex tiles, and in city/production UI.
// The badge ring encodes category at a glance: plain gold ring = basic, steel double-ring =
// strategic (unlocks specific units), gold ring + sparkle corners = luxury (unlocks wonders/
// bonuses) — the same "encode info in the frame, not just the icon" idea used for units.

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
    <path d="M16,24 L16,13" stroke="${RC.green}" stroke-width="1.6"/>
    <path d="M16,13 Q12,10 12,6 Q16,8 16,13Z" fill="${RC.gold}" stroke="${OUT}" stroke-width="0.6"/>
    <path d="M16,13 Q20,10 20,6 Q16,8 16,13Z" fill="${RC.goldLight}" stroke="${OUT}" stroke-width="0.6"/>
    <path d="M16,17 Q12,14 12,10 Q16,12 16,17Z" fill="${RC.gold}" stroke="${OUT}" stroke-width="0.6"/>
    <path d="M16,17 Q20,14 20,10 Q16,12 16,17Z" fill="${RC.goldLight}" stroke="${OUT}" stroke-width="0.6"/>
    <path d="M13,24 Q16,26 19,24 L18,20 L14,20Z" fill="${RC.red}" stroke="${OUT}" stroke-width="0.6"/>`, RC.ivory, 'basic'),

  wood: () => badge(`
    <rect x="9" y="10" width="5" height="14" rx="1.6" fill="${RC.barkLight}" stroke="${OUT}" stroke-width="0.7"/>
    <ellipse cx="11.5" cy="10" rx="2.5" ry="1.4" fill="${RC.bark}" stroke="${OUT}" stroke-width="0.6"/>
    <rect x="16" y="9" width="5" height="15" rx="1.6" fill="${RC.bark}" stroke="${OUT}" stroke-width="0.7"/>
    <ellipse cx="18.5" cy="9" rx="2.5" ry="1.4" fill="${RC.barkLight}" stroke="${OUT}" stroke-width="0.6"/>
    <path d="M11.5,13 Q11,17 11.5,21" stroke="${RC.bark}" stroke-width="0.6" fill="none" opacity="0.6"/>`, '#E8DCC0', 'basic'),

  stone: () => badge(`<polygon points="16,6 24,13 21,26 11,26 8,13" fill="${RC.stone}" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="16,6 24,13 16,16" fill="${RC.stoneDark}" opacity="0.5"/>
    <polygon points="16,16 21,26 11,26" fill="${RC.stoneDark}" opacity="0.3"/>
    <line x1="16" y1="6" x2="16" y2="16" stroke="${OUT}" stroke-width="0.6" opacity="0.4"/>`, '#EDE0C0', 'basic'),

  gold: () => badge(`
    <ellipse cx="16" cy="21" rx="8" ry="3" fill="${RC.goldDeep}" stroke="${OUT}" stroke-width="0.6"/>
    <ellipse cx="16" cy="18" rx="8" ry="3" fill="${RC.gold}" stroke="${OUT}" stroke-width="0.6"/>
    <ellipse cx="16" cy="15" rx="8" ry="3" fill="${RC.goldLight}" stroke="${OUT}" stroke-width="0.7"/>
    <ellipse cx="16" cy="15" rx="4" ry="1.4" fill="none" stroke="${RC.goldDeep}" stroke-width="0.6" opacity="0.6"/>`, '#F1CE73', 'basic'),

  iron: () => badge(`
    <polygon points="9,20 11,12 21,12 23,20 20,24 12,24" fill="${RC.steel}" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="9,20 11,12 15,12 14,24 12,24" fill="${RC.steelDark}" opacity="0.55"/>
    <line x1="12" y1="16" x2="20" y2="16" stroke="${OUT}" stroke-width="0.7" opacity="0.4"/>`, '#C7C2B8', 'strategic'),

  copper: () => badge(`
    <polygon points="9,20 11,12 21,12 23,20 20,24 12,24" fill="${RC.copper}" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="9,20 11,12 15,12 14,24 12,24" fill="${RC.copperDark}" opacity="0.5"/>
    <line x1="12" y1="16" x2="20" y2="16" stroke="${OUT}" stroke-width="0.7" opacity="0.4"/>`, '#EED9A6', 'strategic'),

  salt: () => badge(`
    <polygon points="16,7 22,16 16,25 10,16" fill="${RC.salt}" stroke="${OUT}" stroke-width="0.9"/>
    <polygon points="16,7 22,16 16,16" fill="#ffffff" opacity="0.5"/>
    <polygon points="16,12 19,16 16,20 13,16" fill="none" stroke="#B8AC8C" stroke-width="0.6"/>`, '#DCE7E8', 'luxury'),

  ivory: () => badge(`
    <path d="M11,23 Q9,13 17,8 Q19,8 18,11 Q13,15 13,23Z" fill="${RC.ivory}" stroke="${OUT}" stroke-width="0.8"/>
    <path d="M17,8 Q19,8 18,11" fill="#ffffff" opacity="0.6"/>`, '#E8DCC0', 'luxury'),

  gems: () => badge(`
    <polygon points="16,7 21,12 19,24 13,24 11,12" fill="#5C7FB5" stroke="${OUT}" stroke-width="0.9"/>
    <polygon points="16,7 21,12 16,15 11,12" fill="#8FB0E0"/>
    <polygon points="16,15 19,24 13,24" fill="#3E5D8C"/>
    <line x1="16" y1="7" x2="16" y2="24" stroke="#ffffff" stroke-width="0.5" opacity="0.4"/>`, '#26405F', 'luxury'),

  horses: () => badge(`
    <path d="M16,8 Q22,8 22,15 Q22,19 18,20 L18,24 Q18,26 16,26 Q14,26 14,24 L14,20 Q10,19 10,15 Q10,8 16,8Z" fill="none" stroke="${RC.steelDark}" stroke-width="2.6"/>
    <path d="M16,8 Q22,8 22,15 Q22,19 18,20 L18,24 Q18,26 16,26 Q14,26 14,24 L14,20 Q10,19 10,15 Q10,8 16,8Z" fill="none" stroke="${OUT}" stroke-width="0.5"/>
    <circle cx="12.5" cy="12" r="1" fill="${RC.steelDark}"/><circle cx="19.5" cy="12" r="1" fill="${RC.steelDark}"/><circle cx="11" cy="16.5" r="1" fill="${RC.steelDark}"/><circle cx="21" cy="16.5" r="1" fill="${RC.steelDark}"/>`, '#D8C594', 'strategic'),

  fish: () => badge(`
    <path d="M8,16c4-5.5 11-5.5 15,0-4,5.5-11,5.5-15,0z" fill="${RC.water}" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="8,16 3,11 3,21" fill="${RC.waterLight}" stroke="${OUT}" stroke-width="0.6"/>
    <circle cx="13" cy="14.5" r="1.1" fill="#0F1B22"/>
    <path d="M12,16 Q16,18 20,16" stroke="${RC.waterLight}" stroke-width="0.7" fill="none" opacity="0.7"/>`, '#DCEEF0', 'basic'),

  spices: () => badge(`
    <path d="M9,24 Q9,15 16,15 Q23,15 23,24Z" fill="${RC.copper}" stroke="${OUT}" stroke-width="0.8"/>
    <ellipse cx="16" cy="15" rx="7" ry="2.4" fill="#D9662E" stroke="${OUT}" stroke-width="0.7"/>
    <circle cx="12" cy="20" r="1.3" fill="${RC.goldLight}"/><circle cx="16" cy="22" r="1.3" fill="${RC.goldLight}"/><circle cx="20" cy="20" r="1.3" fill="${RC.goldLight}"/>`, '#F1CE73', 'luxury'),
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
