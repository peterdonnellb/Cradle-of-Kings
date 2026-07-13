// units.js — Unit roster with stats + inline SVG token art (silhouette glyphs on a crest disc)

function token(glyph, ring = '#F1CE73') {
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="27" fill="rgba(20,14,8,0.55)" stroke="${ring}" stroke-width="2.5"/>
    <g fill="${ring}" stroke="none">${glyph}</g>
  </svg>`;
}

const glyphs = {
  villager: `<circle cx="32" cy="18" r="6"/><rect x="27" y="24" width="10" height="14" rx="2"/><path d="M24 8 L40 8 L37 16 L27 16 Z"/><rect x="26" y="38" width="6" height="10" rx="2"/><rect x="32" y="38" width="6" height="10" rx="2"/><path d="M27 28 L20 34 L24 36 M37 28 L44 34 L40 36" fill="none" stroke="none" />`,

  scout: `<circle cx="34" cy="18" r="6"/><ellipse cx="30" cy="34" rx="7" ry="11" transform="rotate(-15 30 34)"/><path d="M28 42 L22 56 M32 42 L40 56" stroke="none"/><line x1="16" y1="18" x2="44" y2="34" stroke="none"/><path d="M44 34 L50 30 L48 38 Z"/><ellipse cx="22" cy="36" rx="8" ry="12"/>`,

  warrior: `<circle cx="32" cy="16" r="8"/><rect x="26" y="22" width="12" height="14" rx="4"/><path d="M20 34 L44 34 L46 46 L18 46 Z"/><line x1="22" y1="38" x2="42" y2="38"/><line x1="24" y1="42" x2="40" y2="42"/><rect x="26" y="44" width="6" height="12" rx="2"/><rect x="32" y="44" width="6" height="12" rx="2"/><path d="M16 22 L24 22 L24 44 L16 44 C10 44 10 22 16 22 Z"/><line x1="40" y1="16" x2="48" y2="44"/><circle cx="48" cy="44" r="5"/>`,

  spearman: `<circle cx="34" cy="18" r="7"/><rect x="30" y="24" width="10" height="14" rx="4"/><rect x="26" y="44" width="6" height="12" rx="3"/><rect x="34" y="44" width="6" height="12" rx="3"/><ellipse cx="26" cy="34" rx="14" ry="22"/><circle cx="22" cy="26" r="4"/><circle cx="30" cy="30" r="5"/><circle cx="24" cy="40" r="4"/><line x1="46" y1="10" x2="38" y2="50"/><path d="M46 10 L52 8 L48 16 Z"/>`,

  archer: `<circle cx="32" cy="20" r="6"/><ellipse cx="32" cy="34" rx="7" ry="11"/><path d="M28 44 L24 56 M36 44 L40 56"/><rect x="40" y="22" width="6" height="16" rx="2"/><path d="M16 28 Q28 10 44 26 Q32 40 16 28"/><line x1="20" y1="26" x2="48" y2="14"/><path d="M48 14 L54 12 L50 20 Z"/>`,

  shield_bearer: `<circle cx="32" cy="14" r="6"/><rect x="26" y="22" width="12" height="22" rx="4"/><rect x="24" y="44" width="8" height="12" rx="3"/><rect x="32" y="44" width="8" height="12" rx="3"/><rect x="14" y="18" width="24" height="38" rx="4"/><line x1="14" y1="30" x2="38" y2="30"/><circle cx="26" cy="38" r="4"/><line x1="48" y1="18" x2="42" y2="46"/><ellipse cx="48" cy="16" rx="6" ry="4"/>`,

  horseman: `<ellipse cx="32" cy="36" rx="18" ry="8"/><line x1="18" y1="44" x2="16" y2="56"/><line x1="26" y1="44" x2="24" y2="56"/><line x1="38" y1="44" x2="40" y2="56"/><line x1="46" y1="44" x2="48" y2="56"/><rect x="46" y="28" width="12" height="8" rx="4"/><circle cx="56" cy="32" r="3"/><rect x="26" y="22" width="10" height="16" rx="3"/><circle cx="31" cy="18" r="6"/><line x1="50" y1="18" x2="44" y2="40"/>`,

  camel_rider: `<ellipse cx="32" cy="38" rx="16" ry="8"/><line x1="20" y1="46" x2="18" y2="56"/><line x1="28" y1="46" x2="26" y2="56"/><line x1="36" y1="46" x2="38" y2="56"/><line x1="44" y1="46" x2="46" y2="56"/><path d="M44 34 Q54 24 50 14" fill="none" stroke="none"/><ellipse cx="50" cy="14" rx="6" ry="4"/><rect x="28" y="22" width="8" height="16" rx="3"/><circle cx="32" cy="18" r="6"/><line x1="18" y1="16" x2="28" y2="30"/>`,

  axeman: `<circle cx="32" cy="18" r="8"/><rect x="24" y="24" width="16" height="20" rx="4"/><rect x="26" y="44" width="8" height="12" rx="3"/><rect x="34" y="44" width="8" height="12" rx="3"/><path d="M24 12 L20 4 L28 10 M28 10 L32 2 L34 10 M34 10 L40 4 L40 12"/><line x1="44" y1="14" x2="52" y2="46"/><path d="M48 22 L58 18 L56 28 Z"/>`,

  slinger: `<circle cx="34" cy="20" r="7"/><ellipse cx="30" cy="34" rx="7" ry="11" transform="rotate(10 30 34)"/><path d="M26 44 L22 56 M34 44 L40 56"/><path d="M14 30 Q22 38 28 28"/><circle cx="14" cy="30" r="4"/><circle cx="12" cy="30" r="2.5"/>`,

  royal_guard: `<circle cx="32" cy="16" r="8"/><rect x="24" y="22" width="16" height="22" rx="4"/><path d="M18 26 L46 26 L48 48 L16 48 Z"/><rect x="24" y="44" width="8" height="12" rx="3"/><rect x="34" y="44" width="8" height="12" rx="3"/><path d="M22 10 L42 10 L44 16 L20 16 Z"/><circle cx="32" cy="8" r="4"/><ellipse cx="22" cy="34" rx="8" ry="14"/><line x1="46" y1="12" x2="40" y2="50"/><path d="M46 12 L52 10 L48 18 Z"/>`,

  elephant_rider: `<ellipse cx="32" cy="36" rx="22" ry="14"/><rect x="14" y="48" width="8" height="10" rx="3"/><rect x="24" y="48" width="8" height="10" rx="3"/><rect x="40" y="48" width="8" height="10" rx="3"/><rect x="50" y="48" width="8" height="10" rx="3"/><path d="M52 30 Q64 30 62 44 Q60 50 56 48 Q58 42 56 38"/><path d="M52 36 L62 34 L60 38 Z"/><path d="M54 38 L64 38 L60 42 Z"/><rect x="22" y="22" width="20" height="6" rx="2"/><rect x="26" y="14" width="6" height="10"/><circle cx="29" cy="12" r="4"/><rect x="34" y="14" width="6" height="10"/><circle cx="37" cy="12" r="4"/><path d="M20 14 L44 14 L40 18 L24 18 Z"/>`,

  war_chariot: `<rect x="40" y="32" width="18" height="8" rx="4"/><line x1="42" y1="40" x2="40" y2="52"/><line x1="52" y1="40" x2="54" y2="52"/><ellipse cx="58" cy="32" rx="4" ry="6"/><rect x="14" y="34" width="22" height="10" rx="3"/><circle cx="18" cy="48" r="8" fill="none" stroke="none"/><circle cx="32" cy="48" r="8" fill="none" stroke="none"/><line x1="18" y1="48" x2="18" y2="40"/><line x1="32" y1="48" x2="32" y2="40"/><rect x="18" y="24" width="6" height="12"/><circle cx="21" cy="20" r="5"/><rect x="28" y="24" width="6" height="12"/><circle cx="31" cy="20" r="5"/><line x1="14" y1="18" x2="34" y2="26"/><path d="M14 18 L10 16 L12 22 Z"/>`,

  crossbowman: `<circle cx="32" cy="18" r="8"/><rect x="24" y="24" width="16" height="20" rx="4"/><rect x="26" y="44" width="8" height="12" rx="3"/><rect x="34" y="44" width="8" height="12" rx="3"/><path d="M22 14 L42 14 L40 18 L24 18 Z"/><rect x="18" y="30" width="18" height="4" rx="2"/><line x1="18" y1="26" x2="18" y2="34"/><line x1="16" y1="26" x2="16" y2="34"/><line x1="36" y1="32" x2="48" y2="28"/><path d="M48 28 L52 26 L50 30 Z"/>`,

  siege_tower: `<rect x="16" y="14" width="32" height="38" rx="4"/><line x1="16" y1="24" x2="48" y2="24"/><line x1="16" y1="34" x2="48" y2="34"/><line x1="16" y1="44" x2="48" y2="44"/><rect x="22" y="18" width="6" height="6"/><rect x="38" y="18" width="6" height="6"/><rect x="22" y="28" width="6" height="6"/><rect x="38" y="28" width="6" height="6"/><line x1="25" y1="14" x2="25" y2="10"/><line x1="41" y1="14" x2="41" y2="10"/><circle cx="22" cy="52" r="6"/><circle cx="42" cy="52" r="6"/>`,

  catapult: `<rect x="12" y="40" width="40" height="8" rx="3"/><circle cx="18" cy="50" r="8"/><circle cx="46" cy="50" r="8"/><rect x="16" y="38" width="32" height="6" rx="2"/><line x1="24" y1="38" x2="44" y2="18"/><path d="M20 38 L28 38 L28 46 L20 46 Z"/><path d="M44 18 L52 16 L50 24 Z"/><circle cx="50" cy="28" r="6"/>`,

  lion_guard: `<rect x="24" y="44" width="8" height="12" rx="3"/><rect x="32" y="44" width="8" height="12" rx="3"/><rect x="24" y="24" width="16" height="20" rx="4"/><path d="M18 18 C10 10 10 30 18 22 C26 34 38 34 46 22 C54 30 54 10 46 18 C38 6 26 6 18 18 Z"/><circle cx="32" cy="18" r="8"/><line x1="46" y1="16" x2="50" y2="44"/><path d="M50 44 L54 46 L50 48 Z"/><ellipse cx="20" cy="34" rx="6" ry="12"/>`,

  spirit_shaman: `<path d="M20 44 L44 44 L48 56 L16 56 Z"/><rect x="24" y="22" width="16" height="24" rx="4"/><path d="M22 12 L42 12 L44 28 L32 34 L20 28 Z"/><ellipse cx="28" cy="20" rx="3" ry="5"/><ellipse cx="36" cy="20" rx="3" ry="5"/><line x1="48" y1="10" x2="44" y2="50"/><circle cx="48" cy="10" r="6"/><circle cx="14" cy="16" r="3"/><circle cx="52" cy="32" r="4"/><circle cx="10" cy="34" r="2"/>`,

  royal_elephant: `<ellipse cx="32" cy="36" rx="24" ry="16"/><rect x="12" y="50" width="10" height="8" rx="3"/><rect x="24" y="50" width="10" height="8" rx="3"/><rect x="40" y="50" width="10" height="8" rx="3"/><rect x="52" y="50" width="10" height="8" rx="3"/><path d="M54 30 Q66 30 64 46 Q62 54 56 50 Q60 42 58 38"/><path d="M54 36 L66 32 L64 38 Z"/><path d="M56 40 L68 38 L64 44 Z"/><rect x="20" y="20" width="24" height="8" rx="3"/><path d="M16 12 L48 12 L44 18 L20 18 Z"/><path d="M22 12 L30 4 L38 12 Z"/><path d="M20 4 L22 12 L18 12 Z"/><rect x="28" y="14" width="8" height="8"/><circle cx="32" cy="10" r="5"/><circle cx="32" cy="28" r="4"/><circle cx="44" cy="36" r="4"/>`,

  great_general: `<ellipse cx="32" cy="52" rx="22" ry="6"/><rect x="24" y="42" width="10" height="12" rx="3"/><rect x="34" y="42" width="10" height="12" rx="3"/><path d="M18 24 L46 24 L48 48 L16 48 Z"/><rect x="22" y="22" width="20" height="22" rx="4"/><circle cx="32" cy="16" r="10"/><path d="M20 10 L44 10 L46 16 L18 16 Z"/><circle cx="32" cy="6" r="8"/><path d="M24 6 L40 6 L32 14 Z"/><line x1="48" y1="8" x2="44" y2="48"/><ellipse cx="48" cy="8" rx="8" ry="4"/><ellipse cx="18" cy="34" rx="8" ry="16"/>`,
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
