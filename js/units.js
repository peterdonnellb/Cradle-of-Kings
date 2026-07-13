// units.js — Unit roster with stats + inline SVG token art.
//
// Visual language: every token is a warm clay-toned figure (or beast/machine) silhouette
// on a tiered medallion frame. Two independent signals are encoded so a glance answers two
// questions at once ("game theory" readability — don't make the player decode one channel
// for two facts): the OUTER ring (drawn by renderer.js in the owning kingdom's color) says
// *whose* unit this is; the INNER medallion frame (baked in here, escalating from plain wood
// through bronze and steel to a radiant gold sunburst) says *how powerful* it is. Weapon/
// shield materials also escalate with tier (wood -> bronze -> iron -> gold) so silhouette
// alone hints at strength even before you check stats.

const C = {
  body: '#4A3427',       // warm clay/bark figure silhouette — consistent across all units
  bodyLight: '#6B4B33',
  wood: '#8C6239',
  bronze: '#B5502D',
  bronzeLight: '#D97B4F',
  steel: '#9CA0A6',
  steelDark: '#6B6F75',
  gold: '#D8A93A',
  goldLight: '#F1CE73',
  ivory: '#F1E7D0',
  red: '#8C2F2F',
  green: '#2E6B4F',
  indigo: '#223A5E',
  animal: '#5A4632',
  animalLight: '#7A6248',
};

const TIER_FRAME = {
  basic: { bg: '#2E2013', rim: C.wood, rimWidth: 2, accent: C.wood },
  advanced: { bg: '#2A1E16', rim: C.bronze, rimWidth: 2.4, accent: C.bronze },
  elite: { bg: '#221A2E', rim: C.gold, rimWidth: 2.8, accent: C.steel },
  legendary: { bg: '#2A2010', rim: C.goldLight, rimWidth: 3.2, accent: C.goldLight },
};

let _u = 0;
function uid() { return `t${(_u++).toString(36)}`; }

/** Assembles a unit token: tiered medallion frame + the unit's figure/creature/machine art. */
function token(tier, figure) {
  const f = TIER_FRAME[tier] || TIER_FRAME.basic;
  const id = uid();
  const studs = tier === 'elite' || tier === 'legendary'
    ? [0, 90, 180, 270].map(a => {
        const rad = (Math.PI / 180) * a;
        const x = 32 + 26 * Math.cos(rad), y = 32 + 26 * Math.sin(rad);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="${f.rim}"/>`;
      }).join('')
    : '';
  const rays = tier === 'legendary'
    ? `<g stroke="${C.goldLight}" stroke-width="1" opacity="0.35">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const rad = (Math.PI / 180) * a;
        const x1 = 32 + 20 * Math.cos(rad), y1 = 32 + 20 * Math.sin(rad);
        const x2 = 32 + 29 * Math.cos(rad), y2 = 32 + 29 * Math.sin(rad);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join('')}</g>`
    : '';
  const bgFill = tier === 'legendary'
    ? `url(#grad-${id})`
    : f.bg;
  const defs = tier === 'legendary'
    ? `<radialGradient id="grad-${id}" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#3A2E14"/><stop offset="100%" stop-color="${f.bg}"/></radialGradient>`
    : '';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs}</defs>
    ${rays}
    <circle cx="32" cy="32" r="27" fill="${bgFill}" stroke="${f.rim}" stroke-width="${f.rimWidth}"/>
    ${studs}
    <g>${figure}</g>
  </svg>`;
}

// --- reusable figure parts ------------------------------------------------------

function head(cx, cy, r = 6) { return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.body}"/>`; }
function legsStanding() { return `<path d="M27,48 L25,58 L29,58 L30.5,48Z" fill="${C.body}"/><path d="M37,48 L39,58 L35,58 L33.5,48Z" fill="${C.body}"/>`; }
function legsStride() { return `<path d="M26,48 L21,58 L25,58 L30,49Z" fill="${C.body}"/><path d="M36,48 L40,59 L36,59 L33,49Z" fill="${C.body}"/>`; }
function torso(topY = 24) { return `<path d="M23,${topY} Q32,${topY - 5} 41,${topY} L39,48 L25,48 Z" fill="${C.body}"/>`; }

/** Single continuous "toy pictogram" silhouettes for mounts — bold and seamless so they read
 *  clearly at the small size units render at, rather than a realistic-but-illegible collage. */
function horseGlyph() {
  return `<path d="M10,50 L10,40 Q8,30 18,26 Q19,15 30,10 Q40,6 46,14 Q39,16 34,20 Q44,18 48,27 Q50,34 43,38
    L43,50 L36,50 L36,41 L27,41 L27,50 L20,50 L20,44 L14,44 L14,50 Z" fill="${C.animal}"/>
    <path d="M40,16 Q37,12 40,8" stroke="${C.animalLight}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}
function camelGlyph() {
  return `<path d="M8,50 L8,42 Q7,36 12,34 Q10,26 16,24 Q17,17 24,18 Q25,12 31,14 Q30,20 34,20
    Q34,13 40,10 Q46,8 47,15 Q44,16 43,20 Q49,20 50,28 L52,29 Q54,31 52,35 L47,38 L47,50 L40,50 L40,40 L30,40 L30,50 L23,50 L23,42 L16,42 L16,50 Z" fill="${C.animal}"/>`;
}
function elephantGlyph() {
  return `<path d="M8,50 Q6,26 26,24 Q24,12 34,12 Q48,12 48,26 Q56,28 56,40 L56,50 L48,50 L48,42 L40,42 L40,50 L32,50 L32,44 L24,44 L24,50 L16,50 L16,45 Q10,42 12,50 Z" fill="${C.animal}"/>
    <path d="M12,28 Q4,30 6,20 Q11,15 18,20Z" fill="${C.animalLight}"/>
    <path d="M22,28 Q15,36 20,47" fill="none" stroke="${C.animal}" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="47" cy="22" r="1.8" fill="${C.ivory}"/>`;
}

function roundShield(cx, cy, r, color) {
  const id = uid();
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="rgba(20,14,8,0.4)" stroke-width="1.4"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="rgba(20,14,8,0.4)"/>`;
}
function towerShield(cx, cy, w, h, color) {
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="3" fill="${color}"/>
    <rect x="${cx - w / 2 + 2.5}" y="${cy - h / 2 + 3}" width="${w - 5}" height="${h - 7}" fill="none" stroke="rgba(20,14,8,0.4)" stroke-width="1.2"/>`;
}
function spearShaft(x1, y1, x2, y2, color = C.wood) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2"/><polygon points="${x2 - 3},${y2 + 4} ${x2},${y2 - 4} ${x2 + 3},${y2 + 4}" fill="${C.steel}"/>`;
}
function headdressFeather(color) { return `<path d="M32,11 Q37,3 35,-1" stroke="${color}" stroke-width="1.8" fill="none"/><path d="M32,11 Q29,4 31,0" stroke="${color}" stroke-width="1.4" fill="none"/>`; }
function headdressCirclet(color) { return `<rect x="26" y="13.5" width="12" height="2.2" rx="1" fill="${color}"/>`; }

// --- per-unit figures -------------------------------------------------------------

const FIGURES = {
  villager: () => `${legsStanding()}${torso(26)}${head(32, 19)}<path d="M40,32 Q46,30 46,38 Q42,40 39,36Z" fill="${C.wood}"/>`,

  scout: () => `${legsStride()}${torso(25)}${head(32, 18)}
    <path d="M30,13 Q31,6 28,3" stroke="${C.gold}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M33,13 Q35,7 39,5" stroke="${C.gold}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <line x1="44" y1="44" x2="46" y2="20" stroke="${C.wood}" stroke-width="2"/><polygon points="44,22 48,18 46,24" fill="${C.steel}"/>`,

  warrior: () => `${legsStanding()}${torso(24)}${head(32, 17)}
    ${roundShield(20, 34, 8, C.bronze)}
    <line x1="42" y1="46" x2="48" y2="26" stroke="${C.wood}" stroke-width="2.2"/><polygon points="46,28 50,24 48,30" fill="${C.steel}"/>`,

  spearman: () => `${legsStanding()}${torso(24)}${head(32, 17)}
    ${roundShield(21, 36, 7, C.wood)}
    ${spearShaft(48, 52, 44, 6, C.wood)}`,

  archer: () => `${legsStride()}${torso(25)}${head(30, 18)}
    <path d="M44,10 Q54,29 44,48" fill="none" stroke="${C.wood}" stroke-width="2.4"/>
    <path d="M44,10 L28,29 L44,48" fill="none" stroke="${C.ivory}" stroke-width="1.2"/>
    <line x1="24" y1="29" x2="28" y2="29" stroke="${C.ivory}" stroke-width="1.6"/>`,

  shield_bearer: () => `${legsStanding()}${torso(23)}${head(32, 16)}
    ${towerShield(21, 36, 15, 26, C.bronze)}
    <line x1="41" y1="46" x2="45" y2="30" stroke="${C.steel}" stroke-width="2.4"/>`,

  horseman: () => `${horseGlyph()}
    <circle cx="33" cy="21" r="5.4" fill="${C.body}"/>
    <path d="M27,29 Q33,24 39,27 L37,40 L27,38Z" fill="${C.body}"/>
    <line x1="41" y1="32" x2="54" y2="8" stroke="${C.bronze}" stroke-width="2.2"/>
    <polygon points="52,12 56,6 55,13" fill="${C.steel}"/>`,

  camel_rider: () => `${camelGlyph()}
    <circle cx="43" cy="12" r="4.6" fill="${C.body}"/>
    <path d="M38,18 Q43,14 48,17 L46,24 L39,23Z" fill="${C.body}"/>
    <line x1="46" y1="18" x2="52" y2="6" stroke="${C.steel}" stroke-width="2"/>`,

  axeman: () => `${legsStanding()}${torso(24)}${head(32, 17)}
    <line x1="24" y1="46" x2="42" y2="14" stroke="${C.wood}" stroke-width="2.4"/>
    <path d="M40,10 Q52,8 50,22 Q44,20 40,16Z" fill="${C.steel}"/>`,

  slinger: () => `${legsStride()}${torso(25)}${head(30, 18)}
    <path d="M18,20 Q34,44 46,18" fill="none" stroke="${C.wood}" stroke-width="1.8"/>
    <circle cx="46" cy="18" r="2.6" fill="${C.steelDark}"/>`,

  royal_guard: () => `${legsStanding()}${torso(22)}${head(32, 15)}${headdressCirclet(C.gold)}
    ${towerShield(20, 36, 14, 24, C.indigo)}
    <rect x="19" y="30" width="12" height="2" fill="${C.gold}"/>
    ${spearShaft(46, 52, 42, 6, C.steel)}`,

  elephant_rider: () => `${elephantGlyph()}
    <rect x="22" y="4" width="20" height="8" rx="1.5" fill="${C.bronze}"/>
    <rect x="22" y="4" width="20" height="2.2" fill="${C.gold}"/>
    <circle cx="32" cy="8" r="3" fill="${C.body}"/>`,

  war_chariot: () => `<g transform="translate(-4,4) scale(0.82)">${horseGlyph()}</g>
    <rect x="34" y="30" width="18" height="10" rx="1.5" fill="${C.bronze}"/>
    <circle cx="38" cy="46" r="7" fill="none" stroke="${C.wood}" stroke-width="2"/><circle cx="38" cy="46" r="1.6" fill="${C.wood}"/>
    <circle cx="50" cy="46" r="7" fill="none" stroke="${C.wood}" stroke-width="2"/><circle cx="50" cy="46" r="1.6" fill="${C.wood}"/>
    <circle cx="30" cy="20" r="4.4" fill="${C.body}"/>
    <line x1="34" y1="27" x2="47" y2="10" stroke="${C.steel}" stroke-width="2.2"/>`,

  crossbowman: () => `${legsStanding()}${torso(25)}${head(32, 18)}
    <rect x="18" y="27" width="26" height="3" fill="${C.wood}"/>
    <path d="M20,20 Q31,27 20,34" fill="none" stroke="${C.steel}" stroke-width="2"/>
    <line x1="40" y1="28.5" x2="46" y2="28.5" stroke="${C.wood}" stroke-width="2"/>`,

  siege_tower: () => `<rect x="18" y="10" width="22" height="30" fill="${C.wood}"/>
    <rect x="18" y="10" width="22" height="30" fill="none" stroke="${C.bronze}" stroke-width="1.4"/>
    <line x1="18" y1="20" x2="40" y2="20" stroke="${C.bronze}" stroke-width="1.2"/><line x1="18" y1="30" x2="40" y2="30" stroke="${C.bronze}" stroke-width="1.2"/>
    <rect x="14" y="42" width="8" height="8" fill="none" stroke="${C.steel}" stroke-width="2"/><rect x="36" y="42" width="8" height="8" fill="none" stroke="${C.steel}" stroke-width="2"/>
    <rect x="20" y="40" width="18" height="4" fill="${C.steelDark}"/>`,

  catapult: () => `<rect x="14" y="40" width="28" height="5" fill="${C.wood}"/>
    <circle cx="18" cy="48" r="5" fill="none" stroke="${C.steelDark}" stroke-width="2"/><circle cx="38" cy="48" r="5" fill="none" stroke="${C.steelDark}" stroke-width="2"/>
    <path d="M22,40 L36,12 L41,18 L27,40Z" fill="${C.bronze}"/>
    <circle cx="38" cy="14" r="3.4" fill="${C.steelDark}"/>
    <path d="M14,38 L22,32 L22,40Z" fill="${C.wood}"/>`,

  lion_guard: () => `${legsStanding()}${torso(23)}
    <circle cx="32" cy="17" r="9" fill="none" stroke="${C.bronze}" stroke-width="3"/>
    <path d="M22,13 L17,9 M22,21 L16,23 M42,13 L47,9 M42,21 L48,23 M32,7 L32,2" stroke="${C.bronze}" stroke-width="2.4" stroke-linecap="round"/>
    ${head(32, 17, 5.5)}
    ${roundShield(19, 36, 8, C.goldLight)}
    <line x1="43" y1="46" x2="49" y2="24" stroke="${C.steel}" stroke-width="2.4"/>`,

  spirit_shaman: () => `<path d="M24,48 Q22,30 26,22 L38,22 Q42,30 40,48Z" fill="${C.body}"/>
    ${head(32, 17, 5.5)}
    <line x1="46" y1="12" x2="40" y2="48" stroke="${C.wood}" stroke-width="2.2"/>
    <circle cx="46" cy="10" r="3" fill="none" stroke="${C.goldLight}" stroke-width="1.6"/>
    <g stroke="${C.goldLight}" stroke-width="1" fill="none" opacity="0.7"><path d="M18,20 Q22,14 18,8"/><path d="M14,26 Q10,22 12,16"/></g>`,

  royal_elephant: () => `<g transform="scale(1.04) translate(-1,-1)">${elephantGlyph()}</g>
    <rect x="15" y="2" width="26" height="8" rx="1.5" fill="${C.goldLight}"/>
    <rect x="15" y="2" width="26" height="2.4" fill="${C.gold}"/>
    <polygon points="28,-1 31,3 25,3" fill="${C.goldLight}"/>
    <circle cx="50" cy="20" r="1.8" fill="${C.ivory}"/>`,

  great_general: () => `<path d="M20,48 Q18,30 32,44 Q46,30 44,48Z" fill="${C.red}" opacity="0.9"/>
    ${legsStanding()}${torso(22)}
    <polygon points="32,7 39,16 32,19 25,16" fill="${C.gold}"/>
    ${head(32, 16, 5.5)}
    <line x1="44" y1="44" x2="48" y2="10" stroke="${C.goldLight}" stroke-width="2.4"/>
    ${roundShield(20, 34, 7, C.indigo)}`,
};

function svgFor(id, tier) {
  const fig = FIGURES[id];
  return token(tier, fig ? fig() : '');
}

export const UNITS = {
  // --- basic ---
  villager: { id: 'villager', name: 'Villager', tier: 'basic', hp: 5, attack: 0, defense: 1, move: 1, cost: { food: 20 }, role: 'civilian', svg: svgFor('villager', 'basic') },
  scout: { id: 'scout', name: 'Scout', tier: 'basic', hp: 8, attack: 1, defense: 1, move: 3, cost: { food: 15 }, role: 'recon', svg: svgFor('scout', 'basic') },
  warrior: { id: 'warrior', name: 'Warrior', tier: 'basic', hp: 12, attack: 3, defense: 3, move: 1, cost: { food: 10, wood: 5 }, role: 'melee', svg: svgFor('warrior', 'basic') },
  spearman: { id: 'spearman', name: 'Spearman', tier: 'basic', hp: 12, attack: 3, defense: 4, move: 1, cost: { food: 10, wood: 8 }, techReq: 'spears', role: 'anti-cavalry', svg: svgFor('spearman', 'basic') },
  archer: { id: 'archer', name: 'Archer', tier: 'basic', hp: 10, attack: 4, defense: 1, move: 1, range: 2, cost: { food: 12, wood: 8 }, role: 'ranged', svg: svgFor('archer', 'basic') },
  // --- advanced ---
  shield_bearer: { id: 'shield_bearer', name: 'Shield Bearer', tier: 'advanced', hp: 16, attack: 3, defense: 6, move: 1, cost: { food: 15, copper: 5 }, techReq: 'shields', role: 'tank', svg: svgFor('shield_bearer', 'advanced') },
  horseman: { id: 'horseman', name: 'Horseman', tier: 'advanced', hp: 14, attack: 5, defense: 2, move: 3, cost: { food: 20, horses: 10 }, techReq: 'mounted_warfare', role: 'cavalry', svg: svgFor('horseman', 'advanced') },
  camel_rider: { id: 'camel_rider', name: 'Camel Rider', tier: 'advanced', hp: 14, attack: 4, defense: 2, move: 3, cost: { food: 20, horses: 8 }, techReq: 'mounted_warfare', role: 'desert-cavalry', svg: svgFor('camel_rider', 'advanced') },
  axeman: { id: 'axeman', name: 'Axeman', tier: 'advanced', hp: 14, attack: 6, defense: 2, move: 1, cost: { food: 12, iron: 8 }, techReq: 'iron_working', role: 'melee', svg: svgFor('axeman', 'advanced') },
  slinger: { id: 'slinger', name: 'Slinger', tier: 'advanced', hp: 9, attack: 3, defense: 1, move: 2, range: 2, cost: { food: 10, stone: 5 }, role: 'ranged', svg: svgFor('slinger', 'advanced') },
  // --- elite ---
  royal_guard: { id: 'royal_guard', name: 'Royal Guard', tier: 'elite', hp: 22, attack: 7, defense: 7, move: 1, cost: { food: 25, iron: 15, gold: 10 }, techReq: 'architecture', role: 'melee', svg: svgFor('royal_guard', 'elite') },
  elephant_rider: { id: 'elephant_rider', name: 'Elephant Rider', tier: 'elite', hp: 26, attack: 8, defense: 5, move: 2, cost: { food: 30, ivory: 15 }, techReq: 'animal_husbandry', resourceReq: 'ivory', role: 'shock', svg: svgFor('elephant_rider', 'elite') },
  war_chariot: { id: 'war_chariot', name: 'War Chariot', tier: 'elite', hp: 18, attack: 7, defense: 3, move: 4, cost: { food: 25, horses: 15, wood: 10 }, techReq: 'siege_weapons', role: 'cavalry', svg: svgFor('war_chariot', 'elite') },
  crossbowman: { id: 'crossbowman', name: 'Crossbowman', tier: 'elite', hp: 15, attack: 8, defense: 2, move: 1, range: 2, cost: { food: 20, iron: 12 }, techReq: 'siege_weapons', role: 'ranged', svg: svgFor('crossbowman', 'elite') },
  siege_tower: { id: 'siege_tower', name: 'Siege Tower', tier: 'elite', hp: 20, attack: 4, defense: 4, move: 1, cost: { food: 20, wood: 25 }, techReq: 'siege_weapons', role: 'siege', svg: svgFor('siege_tower', 'elite') },
  catapult: { id: 'catapult', name: 'Catapult', tier: 'elite', hp: 14, attack: 10, defense: 1, move: 1, range: 3, cost: { food: 20, wood: 20, iron: 10 }, techReq: 'siege_weapons', role: 'siege', svg: svgFor('catapult', 'elite') },
  // --- legendary ---
  lion_guard: { id: 'lion_guard', name: 'Lion Guard', tier: 'legendary', hp: 30, attack: 10, defense: 8, move: 2, cost: { food: 40, gold: 25 }, techReq: 'architecture', unique: true, role: 'melee', svg: svgFor('lion_guard', 'legendary') },
  spirit_shaman: { id: 'spirit_shaman', name: 'Spirit Shaman', tier: 'legendary', hp: 16, attack: 5, defense: 3, move: 2, range: 2, cost: { food: 30, gold: 20 }, techReq: 'currency', unique: true, role: 'support', svg: svgFor('spirit_shaman', 'legendary') },
  royal_elephant: { id: 'royal_elephant', name: 'Royal Elephant', tier: 'legendary', hp: 36, attack: 11, defense: 7, move: 2, cost: { food: 45, ivory: 25, gold: 15 }, techReq: 'siege_weapons', resourceReq: 'ivory', unique: true, role: 'shock', svg: svgFor('royal_elephant', 'legendary') },
  great_general: { id: 'great_general', name: 'Great General', tier: 'legendary', hp: 24, attack: 9, defense: 6, move: 2, cost: { food: 35, gold: 30 }, techReq: 'siege_weapons', unique: true, role: 'command', svg: svgFor('great_general', 'legendary') },
};

const _imgCache = new Map();
export function getUnitImage(unitId) {
  if (_imgCache.has(unitId)) return _imgCache.get(unitId);
  const def = UNITS[unitId];
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(def ? def.svg : token('basic', ''));
  _imgCache.set(unitId, img);
  return img;
}
