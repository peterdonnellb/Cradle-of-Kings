// units.js — Unit roster with stats + inline SVG token art (silhouette glyphs on a crest disc)

function token(glyph, ring = '#F1CE73') {
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="27" fill="rgba(20,14,8,0.55)" stroke="${ring}" stroke-width="2.5"/>
    <g fill="${ring}" stroke="none">${glyph}</g>
  </svg>`;
}

const glyphs = {
  villager: `<circle cx="32" cy="22" r="6"/><path d="M20 46 Q32 28 44 46 Z"/>`,
  scout: `<circle cx="26" cy="20" r="5"/><path d="M18 44 Q26 26 34 40 L40 30 L44 44Z"/>`,
  warrior: `<rect x="29" y="16" width="6" height="26"/><polygon points="32,10 38,20 26,20"/><rect x="20" y="40" width="24" height="5"/>`,
  spearman: `<rect x="31" y="10" width="3" height="36"/><polygon points="32,8 37,18 27,18"/>`,
  archer: `<path d="M20 16 Q32 12 20 48" fill="none" stroke="#F1CE73" stroke-width="3"/><line x1="20" y1="32" x2="44" y2="32" stroke="#F1CE73" stroke-width="2"/>`,
  shield_bearer: `<polygon points="32,12 44,20 42,38 32,48 22,38 20,20" fill="#F1CE73"/><polygon points="32,18 38,22 37,34 32,40 27,34 26,22" fill="rgba(20,14,8,0.55)"/>`,
  horseman: `<ellipse cx="30" cy="34" rx="14" ry="7"/><rect x="40" y="18" width="4" height="18"/><circle cx="42" cy="16" r="4"/>`,
  camel_rider: `<path d="M14 40 Q20 24 26 34 Q30 22 36 34 Q42 26 48 40Z"/>`,
  axeman: `<rect x="30" y="14" width="4" height="30"/><path d="M34 14 Q46 14 44 24 Q38 22 34 22Z"/>`,
  slinger: `<circle cx="32" cy="30" r="4"/><path d="M18 24 Q32 40 46 24" fill="none" stroke="#F1CE73" stroke-width="2.5"/>`,
  royal_guard: `<rect x="24" y="16" width="16" height="24" rx="3"/><polygon points="32,10 38,18 26,18"/>`,
  elephant_rider: `<path d="M14 42 Q16 24 30 24 Q26 16 34 16 Q44 16 44 26 Q50 28 50 36 L50 42Z"/>`,
  war_chariot: `<rect x="18" y="34" width="20" height="8" rx="1"/><circle cx="22" cy="44" r="5" fill="none" stroke="#F1CE73" stroke-width="2"/><circle cx="34" cy="44" r="5" fill="none" stroke="#F1CE73" stroke-width="2"/><rect x="36" y="18" width="3" height="20"/>`,
  crossbowman: `<rect x="16" y="28" width="24" height="4"/><rect x="30" y="14" width="4" height="32"/>`,
  siege_tower: `<rect x="20" y="12" width="20" height="32"/><rect x="16" y="44" width="6" height="6"/><rect x="38" y="44" width="6" height="6"/>`,
  catapult: `<rect x="16" y="38" width="24" height="6"/><path d="M20 38 L34 14 L38 20 L26 38Z"/><circle cx="34" cy="16" r="3"/>`,
  lion_guard: `<circle cx="32" cy="24" r="10"/><path d="M18 24 L14 16 M18 24 L12 24 M46 24 L50 16 M46 24 L52 24" stroke="#F1CE73" stroke-width="2"/>`,
  spirit_shaman: `<circle cx="32" cy="18" r="5"/><path d="M32 24 L32 44 M22 44 Q32 34 42 44" fill="none" stroke="#F1CE73" stroke-width="2.5"/>`,
  royal_elephant: `<path d="M12 42 Q14 20 32 20 Q28 12 38 12 Q50 12 50 24 Q56 26 56 36 L56 42Z"/><rect x="20" y="6" width="24" height="6" fill="#F1CE73"/>`,
  great_general: `<polygon points="32,8 40,18 32,20 24,18"/><rect x="29" y="20" width="6" height="24"/><polygon points="20,42 44,42 32,50"/>`,
};

export const UNITS = {
  // --- basic ---
  villager: { id: 'villager', name: 'Villager', tier: 'basic', hp: 5, attack: 0, defense: 1, move: 1, cost: { food: 20 }, role: 'civilian', svg: token(glyphs.villager) },
  scout: { id: 'scout', name: 'Scout', tier: 'basic', hp: 8, attack: 1, defense: 1, move: 3, cost: { food: 15 }, role: 'recon', svg: token(glyphs.scout) },
  warrior: { id: 'warrior', name: 'Warrior', tier: 'basic', hp: 12, attack: 3, defense: 3, move: 1, cost: { food: 10, wood: 5 }, role: 'melee', svg: token(glyphs.warrior) },
  spearman: { id: 'spearman', name: 'Spearman', tier: 'basic', hp: 12, attack: 3, defense: 4, move: 1, cost: { food: 10, wood: 8 }, techReq: 'spears', role: 'anti-cavalry', svg: token(glyphs.spearman) },
  archer: { id: 'archer', name: 'Archer', tier: 'basic', hp: 10, attack: 4, defense: 1, move: 1, range: 2, cost: { food: 12, wood: 8 }, role: 'ranged', svg: token(glyphs.archer) },
  // --- advanced ---
  shield_bearer: { id: 'shield_bearer', name: 'Shield Bearer', tier: 'advanced', hp: 16, attack: 3, defense: 6, move: 1, cost: { food: 15, copper: 5 }, techReq: 'shields', role: 'tank', svg: token(glyphs.shield_bearer) },
  horseman: { id: 'horseman', name: 'Horseman', tier: 'advanced', hp: 14, attack: 5, defense: 2, move: 3, cost: { food: 20, horses: 10 }, techReq: 'mounted_warfare', role: 'cavalry', svg: token(glyphs.horseman) },
  camel_rider: { id: 'camel_rider', name: 'Camel Rider', tier: 'advanced', hp: 14, attack: 4, defense: 2, move: 3, cost: { food: 20, horses: 8 }, techReq: 'mounted_warfare', role: 'desert-cavalry', svg: token(glyphs.camel_rider) },
  axeman: { id: 'axeman', name: 'Axeman', tier: 'advanced', hp: 14, attack: 6, defense: 2, move: 1, cost: { food: 12, iron: 8 }, techReq: 'iron_working', role: 'melee', svg: token(glyphs.axeman) },
  slinger: { id: 'slinger', name: 'Slinger', tier: 'advanced', hp: 9, attack: 3, defense: 1, move: 2, range: 2, cost: { food: 10, stone: 5 }, role: 'ranged', svg: token(glyphs.slinger) },
  // --- elite ---
  royal_guard: { id: 'royal_guard', name: 'Royal Guard', tier: 'elite', hp: 22, attack: 7, defense: 7, move: 1, cost: { food: 25, iron: 15, gold: 10 }, techReq: 'architecture', role: 'melee', svg: token(glyphs.royal_guard) },
  elephant_rider: { id: 'elephant_rider', name: 'Elephant Rider', tier: 'elite', hp: 26, attack: 8, defense: 5, move: 2, cost: { food: 30, ivory: 15 }, techReq: 'animal_husbandry', resourceReq: 'ivory', role: 'shock', svg: token(glyphs.elephant_rider) },
  war_chariot: { id: 'war_chariot', name: 'War Chariot', tier: 'elite', hp: 18, attack: 7, defense: 3, move: 4, cost: { food: 25, horses: 15, wood: 10 }, techReq: 'siege_weapons', role: 'cavalry', svg: token(glyphs.war_chariot) },
  crossbowman: { id: 'crossbowman', name: 'Crossbowman', tier: 'elite', hp: 15, attack: 8, defense: 2, move: 1, range: 2, cost: { food: 20, iron: 12 }, techReq: 'siege_weapons', role: 'ranged', svg: token(glyphs.crossbowman) },
  siege_tower: { id: 'siege_tower', name: 'Siege Tower', tier: 'elite', hp: 20, attack: 4, defense: 4, move: 1, cost: { food: 20, wood: 25 }, techReq: 'siege_weapons', role: 'siege', svg: token(glyphs.siege_tower) },
  catapult: { id: 'catapult', name: 'Catapult', tier: 'elite', hp: 14, attack: 10, defense: 1, move: 1, range: 3, cost: { food: 20, wood: 20, iron: 10 }, techReq: 'siege_weapons', role: 'siege', svg: token(glyphs.catapult) },
  // --- legendary ---
  lion_guard: { id: 'lion_guard', name: 'Lion Guard', tier: 'legendary', hp: 30, attack: 10, defense: 8, move: 2, cost: { food: 40, gold: 25 }, techReq: 'architecture', unique: true, role: 'melee', svg: token(glyphs.lion_guard, '#D8A93A') },
  spirit_shaman: { id: 'spirit_shaman', name: 'Spirit Shaman', tier: 'legendary', hp: 16, attack: 5, defense: 3, move: 2, range: 2, cost: { food: 30, gold: 20 }, techReq: 'currency', unique: true, role: 'support', svg: token(glyphs.spirit_shaman, '#2E6B4F') },
  royal_elephant: { id: 'royal_elephant', name: 'Royal Elephant', tier: 'legendary', hp: 36, attack: 11, defense: 7, move: 2, cost: { food: 45, ivory: 25, gold: 15 }, techReq: 'siege_weapons', resourceReq: 'ivory', unique: true, role: 'shock', svg: token(glyphs.royal_elephant, '#D8A93A') },
  great_general: { id: 'great_general', name: 'Great General', tier: 'legendary', hp: 24, attack: 9, defense: 6, move: 2, cost: { food: 35, gold: 30 }, techReq: 'siege_weapons', unique: true, role: 'command', svg: token(glyphs.great_general, '#8C2F2F') },
};

const _imgCache = new Map();
export function getUnitImage(unitId) {
  if (_imgCache.has(unitId)) return _imgCache.get(unitId);
  const def = UNITS[unitId];
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(def ? def.svg : token(''));
  _imgCache.set(unitId, img);
  return img;
}
