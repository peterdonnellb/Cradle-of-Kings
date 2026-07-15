// units.js — Unit roster with stats + inline SVG token art.
//
// Visual language (sprite pass): earlier versions were flat single-color silhouettes,
// which made similarly-shaped things (a horse vs a camel, a torso vs its own shield) hard
// to tell apart at a glance since everything was one color with no internal shading. Every
// token now uses a small consistent "sprite" toolkit instead: a dark outline stroke on every
// major shape (the single highest-impact change — crisp edges read as separate objects even
// when colors are close), skin tone kept distinct from cloth/armor color, a light/shadow
// two-tone pass on rounded forms for volume, and a tiny eye dot on faces/animal heads so
// they read as a character rather than a paper cutout. Animals in particular were rebuilt
// with genuinely different body colors, distinguishing features (mane vs hump vs ear+tusk),
// and proportions, since "horse vs camel vs elephant" was the specific complaint.
//
// The tier system from the previous pass is unchanged: the OUTER ring (drawn by renderer.js
// in the owning kingdom's color) says *whose* unit this is; the INNER medallion frame (wood
// -> bronze -> gold-studded -> radiant sunburst) says *how powerful* it is; weapon material
// escalates the same way.

const C = {
  skin: '#B07C54',
  skinShadow: '#8F6242',
  cloth: '#DCC48C',
  clothShadow: '#B99D66',
  clothDark: '#8C6239',
  hair: '#2A1D14',
  outline: '#1C1208',
  wood: '#8C6239',
  bronze: '#B5502D',
  bronzeLight: '#D97B4F',
  steel: '#AEB4BA',
  steelDark: '#6B6F75',
  gold: '#D8A93A',
  goldLight: '#F1CE73',
  ivory: '#F1E7D0',
  red: '#8C2F2F',
  green: '#2E6B4F',
  indigo: '#223A5E',
  // animals — each species gets its own distinct hue, not a shared "animal brown"
  horse: '#8A5A34', horseLight: '#B5824F', mane: '#2E2013',
  camel: '#D3B37F', camelLight: '#EAD9AE', camelShadow: '#AE8F5C',
  elephant: '#8B8983', elephantLight: '#ACAAA3', elephantShadow: '#6B6963',
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
  const bgFill = tier === 'legendary' ? `url(#grad-${id})` : f.bg;
  const defs = tier === 'legendary'
    ? `<radialGradient id="grad-${id}" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#3A2E14"/><stop offset="100%" stop-color="${f.bg}"/></radialGradient>`
    : '';
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs}</defs>
    ${rays}
    <circle cx="32" cy="32" r="27" fill="${bgFill}" stroke="${f.rim}" stroke-width="${f.rimWidth}"/>
    ${studs}
    <ellipse cx="32" cy="53" rx="11" ry="2.6" fill="#000" opacity="0.28"/>
    <g>${figure}</g>
  </svg>`;
}

// --- reusable "sprite" body parts: outlined, shaded, with a small eye for character -----

function head(cx, cy, r = 6.2, hairStyle = 'cap') {
  const hair = hairStyle === 'cap'
    ? `<path d="M${cx - r},${cy - 0.5} Q${cx - r},${cy - r - 1.5} ${cx},${cy - r - 1.5} Q${cx + r},${cy - r - 1.5} ${cx + r},${cy - 0.5} Q${cx + r * 0.55},${cy - r * 0.75} ${cx},${cy - r * 0.85} Q${cx - r * 0.55},${cy - r * 0.75} ${cx - r},${cy - 0.5}Z" fill="${C.hair}"/>`
    : hairStyle === 'circlet'
    ? `<path d="M${cx - r + 0.5},${cy - 1} Q${cx},${cy - r - 1} ${cx + r - 0.5},${cy - 1} Q${cx + r * 0.5},${cy - r * 0.7} ${cx},${cy - r * 0.8} Q${cx - r * 0.5},${cy - r * 0.7} ${cx - r + 0.5},${cy - 1}Z" fill="${C.hair}"/><rect x="${cx - r + 1}" y="${cy - r * 0.55}" width="${2 * r - 2}" height="1.6" fill="${C.gold}"/>`
    : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.skin}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M${cx - r * 0.5},${cy + r * 0.35} Q${cx},${cy + r * 0.55} ${cx + r * 0.5},${cy + r * 0.35}" fill="none" stroke="${C.skinShadow}" stroke-width="0.7" opacity="0.7"/>
    ${hair}
    <circle cx="${cx + r * 0.4}" cy="${cy - r * 0.05}" r="0.9" fill="${C.outline}"/>`;
}

function legsStanding() {
  return `<path d="M27,48 L25,58 L29,58 L30.5,48Z" fill="${C.clothDark}" stroke="${C.outline}" stroke-width="0.9"/>
    <path d="M37,48 L39,58 L35,58 L33.5,48Z" fill="${C.clothDark}" stroke="${C.outline}" stroke-width="0.9"/>
    <rect x="24.5" y="57" width="5" height="1.6" fill="${C.hair}"/><rect x="34.5" y="57" width="5" height="1.6" fill="${C.hair}"/>`;
}
function legsStride() {
  return `<path d="M26,48 L21,58 L25,58 L30,49Z" fill="${C.clothDark}" stroke="${C.outline}" stroke-width="0.9"/>
    <path d="M36,48 L40,59 L36,59 L33,49Z" fill="${C.clothDark}" stroke="${C.outline}" stroke-width="0.9"/>
    <rect x="20.5" y="57" width="5" height="1.6" fill="${C.hair}"/><rect x="35.5" y="58" width="5" height="1.6" fill="${C.hair}"/>`;
}
function torso(topY = 24, sash = null) {
  return `<path d="M23,${topY} Q32,${topY - 5} 41,${topY} L39,48 L25,48 Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M32,${topY - 4} L30,48 L25,48 L23,${topY} Q27,${topY - 3} 32,${topY - 4}Z" fill="${C.clothShadow}" opacity="0.6"/>
    ${sash ? `<rect x="24" y="34" width="16" height="3" fill="${sash}"/>` : ''}`;
}

function roundShield(cx, cy, r, color, patternColor) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${C.outline}" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="${patternColor || 'rgba(20,14,8,0.4)'}" stroke-width="1.4"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="${patternColor || 'rgba(20,14,8,0.4)'}"/>
    <ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.35}" rx="${r * 0.28}" ry="${r * 0.16}" fill="#fff" opacity="0.18"/>`;
}
function towerShield(cx, cy, w, h, color) {
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="3" fill="${color}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="${cx - w / 2 + 2.5}" y="${cy - h / 2 + 3}" width="${w - 5}" height="${h - 7}" fill="none" stroke="rgba(20,14,8,0.4)" stroke-width="1.2"/>
    <rect x="${cx - w / 2 + 1.5}" y="${cy - h / 2 + 1.5}" width="${w * 0.3}" height="${h - 3}" fill="#fff" opacity="0.12"/>`;
}
function spearShaft(x1, y1, x2, y2, color = C.wood) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.2"/>
    <polygon points="${x2 - 3},${y2 + 4} ${x2},${y2 - 4} ${x2 + 3},${y2 + 4}" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.6"/>`;
}

/** Single continuous "toy pictogram" silhouettes for mounts — now with per-species shading,
 *  manes/humps/ears as distinguishing features, and a small eye so each reads as a specific
 *  animal rather than an interchangeable four-legged blob. */
function horseGlyph() {
  return `<path d="M10,50 L10,40 Q8,30 18,26 Q19,15 30,10 Q40,6 46,14 Q39,16 34,20 Q44,18 48,27 Q50,34 43,38
    L43,50 L36,50 L36,41 L27,41 L27,50 L20,50 L20,44 L14,44 L14,50 Z" fill="${C.horse}" stroke="${C.outline}" stroke-width="1.1"/>
    <path d="M18,26 Q19,15 30,10 Q40,6 46,14 Q39,16 34,20 Q26,20 20,27Z" fill="${C.horseLight}" opacity="0.55"/>
    <path d="M40,16 Q37,11 40,7" stroke="${C.mane}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M36,19 Q32,15 34,10" stroke="${C.mane}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M11,36 Q7,32 9,27" stroke="${C.mane}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.8"/>
    <circle cx="44" cy="16" r="1.1" fill="${C.outline}"/>`;
}
function camelGlyph() {
  return `<path d="M8,50 L8,42 Q7,36 12,34 Q10,26 16,24 Q17,17 24,18 Q25,12 31,14 Q30,20 34,20
    Q34,13 40,10 Q46,8 47,15 Q44,16 43,20 Q49,20 50,28 L52,29 Q54,31 52,35 L47,38 L47,50 L40,50 L40,40 L30,40 L30,50 L23,50 L23,42 L16,42 L16,50 Z" fill="${C.camel}" stroke="${C.outline}" stroke-width="1.1"/>
    <path d="M17,24 Q18,18 24,18 Q25,12 31,14 Q30,19 26,20 Q20,19 17,24Z" fill="${C.camelLight}" opacity="0.6"/>
    <path d="M40,10 Q46,8 47,15 Q45,15 43,17Q42,12 40,10Z" fill="${C.camelLight}" opacity="0.6"/>
    <path d="M8,42 Q8,46 10,50 L16,50 L16,44 Q11,44 8,42Z" fill="${C.camelShadow}" opacity="0.5"/>
    <circle cx="45" cy="14" r="1" fill="${C.outline}"/>`;
}
function elephantGlyph() {
  return `<path d="M8,50 Q6,26 26,24 Q24,12 34,12 Q48,12 48,26 Q56,28 56,40 L56,50 L48,50 L48,42 L40,42 L40,50 L32,50 L32,44 L24,44 L24,50 L16,50 L16,45 Q10,42 12,50 Z" fill="${C.elephant}" stroke="${C.outline}" stroke-width="1.1"/>
    <path d="M26,24 Q24,12 34,12 Q44,12 47,20 Q36,16 30,24Z" fill="${C.elephantLight}" opacity="0.55"/>
    <path d="M8,50 Q6,34 14,28 Q9,38 12,50Z" fill="${C.elephantShadow}" opacity="0.45"/>
    <path d="M12,28 Q3,30 5,20 Q10,14 18,19 Q13,20 13,26Z" fill="${C.elephantShadow}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M22,28 Q15,36 20,47 Q22,49 24,47 Q20,38 25,29Z" fill="${C.elephant}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M24,20 Q28,22 27,27" stroke="${C.ivory}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="47" cy="21" r="1.1" fill="${C.outline}"/>`;
}

// --- per-unit figures -------------------------------------------------------------

const FIGURES = {
  villager: () => `${legsStanding()}${torso(26)}${head(32, 19)}
    <path d="M40,32 Q46,30 46,38 Q42,40 39,36Z" fill="${C.wood}" stroke="${C.outline}" stroke-width="0.9"/>`,

  scout: () => `${legsStride()}${torso(25, C.green)}${head(32, 18)}
    <path d="M30,13 Q31,6 28,3" stroke="${C.gold}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M33,13 Q35,7 39,5" stroke="${C.gold}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <line x1="44" y1="44" x2="46" y2="20" stroke="${C.wood}" stroke-width="2"/><polygon points="44,22 48,18 46,24" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.6"/>`,

  warrior: () => `${legsStanding()}${torso(24, C.red)}${head(32, 17)}
    ${roundShield(20, 34, 8, C.bronze, C.bronzeLight)}
    <line x1="42" y1="46" x2="48" y2="26" stroke="${C.wood}" stroke-width="2.2"/><polygon points="46,28 50,24 48,30" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.6"/>`,

  spearman: () => `${legsStanding()}${torso(24, C.indigo)}${head(32, 17)}
    ${roundShield(21, 36, 7, C.wood, C.clothDark)}
    ${spearShaft(48, 52, 44, 6, C.wood)}`,

  archer: () => `${legsStride()}${torso(25, C.green)}${head(30, 18)}
    <path d="M44,10 Q54,29 44,48" fill="none" stroke="${C.wood}" stroke-width="2.4"/>
    <path d="M44,10 L28,29 L44,48" fill="none" stroke="${C.ivory}" stroke-width="1.2"/>
    <line x1="24" y1="29" x2="28" y2="29" stroke="${C.ivory}" stroke-width="1.6"/>`,

  shield_bearer: () => `${legsStanding()}${torso(23, C.steelDark)}${head(32, 16)}
    ${towerShield(21, 36, 15, 26, C.bronze)}
    <line x1="41" y1="46" x2="45" y2="30" stroke="${C.steel}" stroke-width="2.4"/>`,

  horseman: () => `${horseGlyph()}
    ${head(33, 21, 5.2)}
    <path d="M27,29 Q33,24 39,27 L37,40 L27,38Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="1"/>
    <line x1="41" y1="32" x2="54" y2="8" stroke="${C.bronze}" stroke-width="2.2"/>
    <polygon points="52,12 56,6 55,13" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.6"/>`,

  camel_rider: () => `${camelGlyph()}
    ${head(30, 15, 4.6)}
    <path d="M38,18 Q43,14 48,17 L46,24 L39,23Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="1"/>
    <line x1="46" y1="18" x2="52" y2="6" stroke="${C.steel}" stroke-width="2"/>`,

  axeman: () => `${legsStanding()}${torso(24, C.bronze)}${head(32, 17)}
    <line x1="24" y1="46" x2="42" y2="14" stroke="${C.wood}" stroke-width="2.4"/>
    <path d="M40,10 Q52,8 50,22 Q44,20 40,16Z" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.8"/>`,

  slinger: () => `${legsStride()}${torso(25, C.clothDark)}${head(30, 18)}
    <path d="M18,20 Q34,44 46,18" fill="none" stroke="${C.wood}" stroke-width="1.8"/>
    <circle cx="46" cy="18" r="2.6" fill="${C.steelDark}" stroke="${C.outline}" stroke-width="0.6"/>`,

  royal_guard: () => `${legsStanding()}${torso(22, C.indigo)}${head(32, 15, 'circlet')}
    ${towerShield(20, 36, 14, 24, C.indigo)}
    <rect x="19" y="30" width="12" height="2" fill="${C.gold}"/>
    ${spearShaft(46, 52, 42, 6, C.steel)}`,

  elephant_rider: () => `${elephantGlyph()}
    <rect x="22" y="4" width="20" height="8" rx="1.5" fill="${C.bronze}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="22" y="4" width="20" height="2.2" fill="${C.gold}"/>
    ${head(32, 8, 3.6)}`,

  war_chariot: () => `<g transform="translate(-4,4) scale(0.82)">${horseGlyph()}</g>
    <rect x="34" y="30" width="18" height="10" rx="1.5" fill="${C.bronze}" stroke="${C.outline}" stroke-width="1"/>
    <circle cx="38" cy="46" r="7" fill="none" stroke="${C.wood}" stroke-width="2.2"/><circle cx="38" cy="46" r="1.6" fill="${C.wood}"/>
    <circle cx="50" cy="46" r="7" fill="none" stroke="${C.wood}" stroke-width="2.2"/><circle cx="50" cy="46" r="1.6" fill="${C.wood}"/>
    ${head(30, 18, 4)}
    <line x1="34" y1="27" x2="47" y2="10" stroke="${C.steel}" stroke-width="2.2"/>`,

  crossbowman: () => `${legsStanding()}${torso(25, C.steelDark)}${head(32, 18)}
    <rect x="18" y="27" width="26" height="3" fill="${C.wood}" stroke="${C.outline}" stroke-width="0.6"/>
    <path d="M20,20 Q31,27 20,34" fill="none" stroke="${C.steel}" stroke-width="2"/>
    <line x1="40" y1="28.5" x2="46" y2="28.5" stroke="${C.wood}" stroke-width="2"/>`,

  siege_tower: () => `<rect x="18" y="10" width="22" height="30" fill="${C.wood}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="18" y="10" width="22" height="30" fill="none" stroke="${C.bronze}" stroke-width="1.4"/>
    <line x1="18" y1="20" x2="40" y2="20" stroke="${C.bronze}" stroke-width="1.2"/><line x1="18" y1="30" x2="40" y2="30" stroke="${C.bronze}" stroke-width="1.2"/>
    <rect x="14" y="42" width="8" height="8" fill="none" stroke="${C.steel}" stroke-width="2"/><rect x="36" y="42" width="8" height="8" fill="none" stroke="${C.steel}" stroke-width="2"/>
    <rect x="20" y="40" width="18" height="4" fill="${C.steelDark}"/>`,

  catapult: () => `<rect x="14" y="40" width="28" height="5" fill="${C.wood}" stroke="${C.outline}" stroke-width="0.8"/>
    <circle cx="18" cy="48" r="5" fill="none" stroke="${C.steelDark}" stroke-width="2"/><circle cx="38" cy="48" r="5" fill="none" stroke="${C.steelDark}" stroke-width="2"/>
    <path d="M22,40 L36,12 L41,18 L27,40Z" fill="${C.bronze}" stroke="${C.outline}" stroke-width="0.8"/>
    <circle cx="38" cy="14" r="3.4" fill="${C.steelDark}" stroke="${C.outline}" stroke-width="0.6"/>
    <path d="M14,38 L22,32 L22,40Z" fill="${C.wood}"/>`,

  lion_guard: () => `${legsStanding()}${torso(23, C.gold)}
    <circle cx="32" cy="17" r="9" fill="none" stroke="${C.bronze}" stroke-width="3"/>
    <path d="M22,13 L17,9 M22,21 L16,23 M42,13 L47,9 M42,21 L48,23 M32,7 L32,2" stroke="${C.bronze}" stroke-width="2.4" stroke-linecap="round"/>
    ${head(32, 17, 5.5)}
    ${roundShield(19, 36, 8, C.goldLight, C.gold)}
    <line x1="43" y1="46" x2="49" y2="24" stroke="${C.steel}" stroke-width="2.4"/>`,

  spirit_shaman: () => `<path d="M24,48 Q22,30 26,22 L38,22 Q42,30 40,48Z" fill="${C.indigo}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M26,22 L24,48 L30,48 L31,22Z" fill="#fff" opacity="0.1"/>
    ${head(32, 17, 5.5)}
    <line x1="46" y1="12" x2="40" y2="48" stroke="${C.wood}" stroke-width="2.2"/>
    <circle cx="46" cy="10" r="3" fill="none" stroke="${C.goldLight}" stroke-width="1.6"/>
    <g stroke="${C.goldLight}" stroke-width="1" fill="none" opacity="0.7"><path d="M18,20 Q22,14 18,8"/><path d="M14,26 Q10,22 12,16"/></g>`,

  royal_elephant: () => `<g transform="scale(1.04) translate(-1,-1)">${elephantGlyph()}</g>
    <rect x="15" y="2" width="26" height="8" rx="1.5" fill="${C.goldLight}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="15" y="2" width="26" height="2.4" fill="${C.gold}"/>
    <polygon points="28,-1 31,3 25,3" fill="${C.goldLight}"/>`,

  great_general: () => `<path d="M20,48 Q18,30 32,44 Q46,30 44,48Z" fill="${C.red}" opacity="0.92" stroke="${C.outline}" stroke-width="1"/>
    ${legsStanding()}${torso(22, C.indigo)}
    <polygon points="32,7 39,16 32,19 25,16" fill="${C.gold}" stroke="${C.outline}" stroke-width="0.8"/>
    ${head(32, 16, 5.5, 'circlet')}
    <line x1="44" y1="44" x2="48" y2="10" stroke="${C.goldLight}" stroke-width="2.4"/>
    ${roundShield(20, 34, 7, C.indigo, C.steel)}`,
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
