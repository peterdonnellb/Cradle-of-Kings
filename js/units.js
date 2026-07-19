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

import { contactShadow, facetedGem } from './facetedArt.js';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function liftColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const t = amount / 100;
  return rgbToHex([r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]);
}
function mixColor(hexA, hexB, ratio) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex([a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio, a[2] + (b[2] - a[2]) * ratio]);
}

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
function token(tier, figure, scale = 1) {
  const f = TIER_FRAME[tier] || TIER_FRAME.basic;
  const id = uid();
  const ringR = 27 + (scale - 1) * 8; // slightly larger medallion for oversized "hero" compositions
  const studs = tier === 'elite' || tier === 'legendary'
    ? [0, 90, 180, 270].map(a => {
        const rad = (Math.PI / 180) * a;
        const x = 32 + (ringR - 1) * Math.cos(rad), y = 32 + (ringR - 1) * Math.sin(rad);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.6" fill="${f.rim}"/>`;
      }).join('')
    : '';
  const rays = tier === 'legendary'
    ? `<g stroke="${C.goldLight}" stroke-width="1" opacity="0.35">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const rad = (Math.PI / 180) * a;
        const x1 = 32 + (ringR - 7) * Math.cos(rad), y1 = 32 + (ringR - 7) * Math.sin(rad);
        const x2 = 32 + (ringR + 2) * Math.cos(rad), y2 = 32 + (ringR + 2) * Math.sin(rad);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join('')}</g>`
    : '';
  const bgFill = tier === 'legendary' ? `url(#grad-${id})` : f.bg;
  const defs = tier === 'legendary'
    ? `<radialGradient id="grad-${id}" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#3A2E14"/><stop offset="100%" stop-color="${f.bg}"/></radialGradient>`
    : '';
  const figureGroup = scale !== 1
    ? `<g transform="translate(32,32) scale(${scale}) translate(-32,-32)">${figure}</g>`
    : `<g>${figure}</g>`;
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs}</defs>
    ${rays}
    <circle cx="32" cy="32" r="${ringR}" fill="${bgFill}" stroke="${f.rim}" stroke-width="${f.rimWidth}"/>
    ${studs}
    <ellipse cx="32" cy="53" rx="11" ry="2.6" fill="#000" opacity="0.28"/>
    <g>${figureGroup}</g>
  </svg>`;
}

// --- reusable "sprite" body parts: outlined, shaded, with a small eye for character -----

function head(cx, cy, r = 6.2, hairStyle = 'cap') {
  const hair = hairStyle === 'cap'
    ? `<path d="M${cx - r},${cy - 0.5} Q${cx - r},${cy - r - 1.5} ${cx},${cy - r - 1.5} Q${cx + r},${cy - r - 1.5} ${cx + r},${cy - 0.5} Q${cx + r * 0.55},${cy - r * 0.75} ${cx},${cy - r * 0.85} Q${cx - r * 0.55},${cy - r * 0.75} ${cx - r},${cy - 0.5}Z" fill="${C.hair}"/>`
    : hairStyle === 'circlet'
    ? `<path d="M${cx - r + 0.5},${cy - 1} Q${cx},${cy - r - 1} ${cx + r - 0.5},${cy - 1} Q${cx + r * 0.5},${cy - r * 0.7} ${cx},${cy - r * 0.8} Q${cx - r * 0.5},${cy - r * 0.7} ${cx - r + 0.5},${cy - 1}Z" fill="${C.hair}"/><rect x="${cx - r + 1}" y="${cy - r * 0.55}" width="${2 * r - 2}" height="1.6" fill="${C.gold}"/>`
    : '';
  // faceted head: light facet upper-left, mid facet center, dark facet right/jaw — a true
  // 3-tone polygonal form instead of a flat-filled circle with a soft cheek shadow
  const skinLight = liftColor(C.skin, 30);
  const skinDark = mixColor(C.skin, '#000000', 0.28);
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.skin}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M${cx},${cy - r} A${r},${r} 0 0,0 ${cx - r * 0.75},${cy + r * 0.66} L${cx - r * 0.1},${cy + r * 0.15} Z" fill="${skinLight}"/>
    <path d="M${cx},${cy - r} L${cx - r * 0.1},${cy + r * 0.15} L${cx + r * 0.7},${cy + r * 0.55} A${r},${r} 0 0,0 ${cx},${cy - r}Z" fill="${skinDark}" opacity="0.55"/>
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
  const clothLight = liftColor(C.cloth, 22);
  const clothDark2 = mixColor(C.clothDark, '#000000', 0.2);
  const midX = 32;
  return `<path d="M23,${topY} Q32,${topY - 5} 41,${topY} L39,48 L25,48 Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M23,${topY} Q27,${topY - 3} ${midX},${topY - 4} L${midX - 2},48 L25,48Z" fill="${clothLight}"/>
    <path d="M${midX},${topY - 4} Q37,${topY - 3} 41,${topY} L39,48 L${midX - 2},48Z" fill="${clothDark2}" opacity="0.55"/>
    ${sash ? `<rect x="24" y="34" width="16" height="3" fill="${sash}" stroke="${C.outline}" stroke-width="0.4"/>` : ''}`;
}

function roundShield(cx, cy, r, color, patternColor) {
  const light = liftColor(color, 26);
  const dark = mixColor(color, '#000000', 0.3);
  // 6-facet faceted dome instead of one flat circle + soft highlight ellipse
  let facets = '';
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a1 = (Math.PI / 180) * (i * (360 / n) - 90);
    const a2 = (Math.PI / 180) * ((i + 1) * (360 / n) - 90);
    const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    const p2 = [cx + r * Math.cos(a2), cy + r * Math.sin(a2)];
    const deg = ((i * (360 / n) + (360 / n) / 2) % 360 + 360) % 360;
    const fill = (deg > 135 && deg < 260) ? light : (deg > 315 || deg < 60) ? dark : color;
    facets += `<polygon points="${cx},${cy} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" fill="${fill}"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${C.outline}" stroke-width="1"/>
    ${facets}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="${patternColor || dark}" stroke="${C.outline}" stroke-width="0.6"/>`;
}
function towerShield(cx, cy, w, h, color) {
  const light = liftColor(color, 24);
  const dark = mixColor(color, '#000000', 0.28);
  const midX = cx;
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="3" fill="${color}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M${cx - w / 2},${cy - h / 2 + 2} Q${cx - w / 2},${cy - h / 2} ${cx - w / 2 + 2},${cy - h / 2} L${midX},${cy - h / 2} L${midX},${cy + h / 2} L${cx - w / 2 + 1},${cy + h / 2 - 2} Q${cx - w / 2},${cy + h / 2} ${cx - w / 2},${cy + h / 2 - 2}Z" fill="${light}"/>
    <path d="M${midX},${cy - h / 2} L${cx + w / 2 - 2},${cy - h / 2} Q${cx + w / 2},${cy - h / 2} ${cx + w / 2},${cy - h / 2 + 2} L${cx + w / 2},${cy + h / 2 - 2} Q${cx + w / 2},${cy + h / 2} ${cx + w / 2 - 1},${cy + h / 2} L${midX},${cy + h / 2}Z" fill="${dark}" opacity="0.55"/>
    <rect x="${cx - w / 2 + 2.5}" y="${cy - h / 2 + 3}" width="${w - 5}" height="${h - 7}" fill="none" stroke="rgba(20,14,8,0.4)" stroke-width="1.2"/>`;
}
function spearShaft(x1, y1, x2, y2, color = C.wood) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.2"/>
    <polygon points="${x2 - 3},${y2 + 4} ${x2},${y2 - 4} ${x2 + 3},${y2 + 4}" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.6"/>`;
}

/** Mount silhouettes — redesigned so a rider sits visibly ON TOP of (not floating beside)
 *  each animal: horse gets a straighter, wedge-headed equine profile with a clear back/
 *  withers to sit astride; camel keeps its hump but the rider sits on a saddle blanket
 *  draped over it (no dangling legs, which visually collided with the hump before); the
 *  elephant is rebuilt with an unmistakable fan ear, curled trunk, and tusk, topped with
 *  a small howdah platform the rider stands in. */
function horseGlyph() {
  return `<rect x="12" y="40" width="4" height="14" rx="1.4" fill="${C.horse}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="19" y="40" width="4" height="14" rx="1.4" fill="${C.horseLight}" stroke="${C.outline}" stroke-width="1" opacity="0.9"/>
    <path d="M8,38 Q6,27 16,24 Q27,21 38,25 Q44,27 43,34 Q42,39 36,40 L13,40 Q7,39 8,38Z" fill="${C.horse}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M16,24 Q27,21 38,25 Q41,26.5 42,30 L17,30 Q14,27 16,24Z" fill="${C.horseLight}" opacity="0.55"/>
    <path d="M10,32 Q9,28 13,26 L18,28 Q13,30 10,32Z" fill="${liftColor(C.horse, 28)}" opacity="0.7"/>
    <rect x="32" y="40" width="4" height="14" rx="1.4" fill="${C.horseLight}" stroke="${C.outline}" stroke-width="1" opacity="0.9"/>
    <rect x="39" y="39" width="4" height="14" rx="1.4" fill="${C.horse}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M37,27 Q46,22 50,16 L61,17 L60,23 L52,26 Q46,29 40,31Z" fill="${C.horse}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M50,16 L61,17 L59,19 L51,20Z" fill="${C.horseLight}" opacity="0.55"/>
    <polygon points="50,14 47,10 53,11" fill="${C.horse}" stroke="${C.outline}" stroke-width="0.7"/>
    <path d="M39,25 Q34,23 35,18" stroke="${C.mane}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M27,24 Q23,23 23,19" stroke="${C.mane}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85"/>
    <circle cx="58" cy="19" r="1" fill="${C.outline}"/>
    <path d="M8,30 Q1,33 3,43 Q4,49 8,51" stroke="${C.mane}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
}
/** A rider astride the horse's back, head clearly the highest point of the composition —
 *  legs drape down both flanks, weapon angles up and away from the horse's own head. */
function horseRider() {
  return `<path d="M18,27 Q13,31 15,38" stroke="${C.clothDark}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M16,25 Q21,16 28,18 L27,4 L17,6Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="1.1"/>
    <path d="M22,20 L21,5 L17,6 L16,25Z" fill="${C.clothShadow}" opacity="0.5"/>
    <path d="M23,24 Q28,29 25,37" stroke="${C.clothDark}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M23,24 Q28,29 25,37" fill="none" stroke="${C.outline}" stroke-width="0.6" opacity="0.5"/>
    <circle cx="22" cy="7" r="4.6" fill="${C.skin}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M17.7,6.6 Q17.7,2 22,2 Q26.3,2 26.3,6.6 Q23.8,4.8 22,5.2 Q19.3,4.8 17.7,6.6Z" fill="${C.hair}"/>
    <circle cx="24" cy="6.8" r="0.75" fill="${C.outline}"/>
    <path d="M26,15 Q32,12 35,7" stroke="${C.skin}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
}
function camelGlyph() {
  return `<rect x="10" y="38" width="4" height="16" rx="1.4" fill="${C.camel}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="17" y="38" width="4" height="16" rx="1.4" fill="${C.camelLight}" stroke="${C.outline}" stroke-width="1" opacity="0.9"/>
    <rect x="34" y="38" width="4" height="16" rx="1.4" fill="${C.camelLight}" stroke="${C.outline}" stroke-width="1" opacity="0.9"/>
    <rect x="41" y="38" width="4" height="16" rx="1.4" fill="${C.camel}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M8,36 Q6,28 12,26 Q14,16 22,15 Q26,9 30,14 Q33,16 31,21 Q39,20 43,26 Q46,28 45,34 Q44,38 39,39 L13,39 Q7,38 8,36Z" fill="${C.camel}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M14,26 Q16,17 22,15 Q26,9 30,14 Q32,16 31,20 Q24,18 19,21 Q15,22 14,26Z" fill="${C.camelLight}" opacity="0.6"/>
    <path d="M18,20 Q17,17 20,15 L24,16 Q20,18 18,20Z" fill="${liftColor(C.camel, 30)}" opacity="0.7"/>
    <path d="M38,27 Q46,23 48,17 L58,16 L59,21 L51,25 Q45,28 41,30Z" fill="${C.camel}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M48,17 L58,16 L57,18.5 L49,20Z" fill="${C.camelLight}" opacity="0.55"/>
    <circle cx="56" cy="18" r="1" fill="${C.outline}"/>
    <path d="M8,30 Q3,33 5,42 Q6,47 9,49" stroke="${C.camelShadow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
}
/** Rider sits on a saddle blanket over the hump (no dangling legs, which visually collided
 *  with the hump when tried); the camel's own neck stays lower than the rider's head. */
function camelRiderFigure() {
  return `<path d="M13,23 Q21,17 31,21 Q33,23 31,26 L14,27 Q11,25 13,23Z" fill="${C.clothShadow}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M17,21 Q22,12 29,14 L28,2 L18,4Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="1.1"/>
    <path d="M23,16 L22,3 L18,4 L17,21Z" fill="${C.clothShadow}" opacity="0.5"/>
    <circle cx="23" cy="5" r="4.4" fill="${C.skin}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M18.9,4.6 Q18.9,0.2 23,0.2 Q27.1,0.2 27.1,4.6 Q24.6,2.9 23,3.3 Q21.4,2.9 18.9,4.6Z" fill="${C.hair}"/>
    <circle cx="25" cy="4.8" r="0.7" fill="${C.outline}"/>
    <path d="M27,13 Q33,10 36,4" stroke="${C.skin}" stroke-width="2.3" fill="none" stroke-linecap="round"/>`;
}
function elephantGlyph() {
  return `<rect x="10" y="42" width="7" height="15" rx="2" fill="${C.elephantShadow}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="20" y="43" width="7" height="15" rx="2" fill="${C.elephant}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="38" y="43" width="7" height="15" rx="2" fill="${C.elephantLight}" stroke="${C.outline}" stroke-width="1"/>
    <rect x="48" y="42" width="7" height="15" rx="2" fill="${C.elephant}" stroke="${C.outline}" stroke-width="1"/>
    <path d="M8,40 Q6,22 26,20 Q28,18 32,18 Q52,18 54,32 Q57,34 56,42 L9,42 Q6,41 8,40Z" fill="${C.elephant}" stroke="${C.outline}" stroke-width="1.3"/>
    <path d="M26,20 Q28,18 32,18 Q46,18 52,26 L26,32 Q22,25 26,20Z" fill="${C.elephantLight}" opacity="0.55"/>
    <path d="M30,23 Q34,21 40,22 L38,26 Q33,25 30,23Z" fill="${liftColor(C.elephant, 26)}" opacity="0.6"/>
    <path d="M18,26 Q4,24 4,34 Q4,42 15,40 Q11,33 14,27Z" fill="${C.elephantShadow}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M14,29 Q8,29 8,34 Q8,38 13,37" fill="none" stroke="${C.outline}" stroke-width="0.6" opacity="0.4"/>
    <path d="M15,24 Q9,30 11,38 Q12,43 17,45 Q20,46 21,43 Q17,42 16,38 Q15,33 19,28Z" fill="${C.elephant}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M17,32 Q22,34 23,40 Q23,42 21,42 Q20,37 15,35Z" fill="${C.ivory}" stroke="${C.outline}" stroke-width="0.8"/>
    <circle cx="20" cy="24" r="1.3" fill="${C.outline}"/>`;
}
/** Small canopy platform (howdah) with a rider visible inside, standing above the shoulders. */
function howdahRider(canopyColor = C.bronze, trimColor = C.gold) {
  return `<rect x="24" y="8" width="20" height="11" rx="1.5" fill="${canopyColor}" stroke="${C.outline}" stroke-width="1.2"/>
    <rect x="24" y="8" width="20" height="3" fill="${trimColor}"/>
    <rect x="24" y="8" width="20" height="11" fill="none" stroke="${C.outline}" stroke-width="0.6" opacity="0.3"/>
    <line x1="27" y1="8" x2="27" y2="19" stroke="${C.outline}" stroke-width="0.8" opacity="0.5"/>
    <line x1="41" y1="8" x2="41" y2="19" stroke="${C.outline}" stroke-width="0.8" opacity="0.5"/>
    <polygon points="22,7 34,-2 46,7" fill="${C.goldLight}" stroke="${C.outline}" stroke-width="1"/>
    <circle cx="34" cy="10" r="4" fill="${C.skin}" stroke="${C.outline}" stroke-width="0.9"/>
    <path d="M30.3,9.6 Q30.3,5.8 34,5.8 Q37.7,5.8 37.7,9.6 Q35.5,8.1 34,8.4 Q32.5,8.1 30.3,9.6Z" fill="${C.hair}"/>
    <path d="M31,18 Q31,12 34,12 Q37,12 37,18Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="0.8"/>
    <line x1="37" y1="13" x2="42" y2="4" stroke="${C.steel}" stroke-width="1.8"/>`;
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

  horseman: () => `${horseGlyph()}${horseRider()}
    <line x1="31" y1="15" x2="41" y2="2" stroke="${C.bronze}" stroke-width="2.2"/>
    <polygon points="39,6 43,0 42,7" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.6"/>`,

  camel_rider: () => `${camelGlyph()}${camelRiderFigure()}
    <line x1="37" y1="2" x2="42" y2="-9" stroke="${C.steel}" stroke-width="2.1"/>`,

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

  elephant_rider: () => `${elephantGlyph()}${howdahRider(C.bronze, C.gold)}`,

  war_chariot: () => `<g transform="translate(20,16) scale(0.56)">${horseGlyph()}</g>
    <line x1="26" y1="47" x2="42" y2="45" stroke="${C.wood}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="14" cy="49" r="10.5" fill="none" stroke="${C.wood}" stroke-width="3"/>
    <circle cx="14" cy="49" r="10.5" fill="none" stroke="${C.outline}" stroke-width="1"/>
    <line x1="14" y1="39" x2="14" y2="59" stroke="${C.wood}" stroke-width="1.8"/>
    <line x1="6.4" y1="41.4" x2="21.6" y2="56.6" stroke="${C.wood}" stroke-width="1.8"/>
    <line x1="21.6" y1="41.4" x2="6.4" y2="56.6" stroke="${C.wood}" stroke-width="1.8"/>
    <circle cx="14" cy="49" r="2.3" fill="${C.wood}" stroke="${C.outline}" stroke-width="0.8"/>
    <path d="M2,36 Q2,29 8,29 L23,29 Q28,29 28,35 L27,43 L3,43Z" fill="${C.bronze}" stroke="${C.outline}" stroke-width="1.5"/>
    <path d="M2,36 Q2,29 8,29 L15,29 L14,43 L3,43Z" fill="${C.gold}" opacity="0.45"/>
    <circle cx="15" cy="16" r="5" fill="${C.skin}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M10.2,15.5 Q10.2,10.4 15,10.4 Q19.8,10.4 19.8,15.5 Q16.8,13.5 15,13.9 Q13.2,13.5 10.2,15.5Z" fill="${C.hair}"/>
    <circle cx="17.3" cy="15.3" r="0.8" fill="${C.outline}"/>
    <path d="M8,29 Q8,17 15,17 Q22,17 22,29Z" fill="${C.cloth}" stroke="${C.outline}" stroke-width="1.2"/>
    <path d="M15,17 L14,29 L8,29 Q8,17 15,17Z" fill="${C.clothShadow}" opacity="0.5"/>
    <path d="M8,23 Q3,25 3,32" stroke="${C.skin}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M21,21 Q26,15 27,7" stroke="${C.skin}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <line x1="28" y1="5" x2="33" y2="-9" stroke="${C.bronze}" stroke-width="2.3"/>
    <polygon points="31,-3 35,-10 34,-2" fill="${C.steel}" stroke="${C.outline}" stroke-width="0.8"/>`,

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

  royal_elephant: () => `<g transform="scale(1.04) translate(-1,-1)">${elephantGlyph()}</g>${howdahRider(C.goldLight, C.gold)}
    <polygon points="30,6 34,0 38,6" fill="${C.goldLight}" stroke="${C.outline}" stroke-width="0.8"/>`,

  great_general: () => `<path d="M20,48 Q18,30 32,44 Q46,30 44,48Z" fill="${C.red}" opacity="0.92" stroke="${C.outline}" stroke-width="1"/>
    ${legsStanding()}${torso(22, C.indigo)}
    <polygon points="32,7 39,16 32,19 25,16" fill="${C.gold}" stroke="${C.outline}" stroke-width="0.8"/>
    ${head(32, 16, 5.5, 'circlet')}
    <line x1="44" y1="44" x2="48" y2="10" stroke="${C.goldLight}" stroke-width="2.4"/>
    ${roundShield(20, 34, 7, C.indigo, C.steel)}`,
};

function svgFor(id, tier, scale = 1) {
  const fig = FIGURES[id];
  return token(tier, fig ? fig() : '', scale);
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
  horseman: { id: 'horseman', name: 'Horseman', tier: 'advanced', hp: 14, attack: 5, defense: 2, move: 3, cost: { food: 20, horses: 10 }, techReq: 'mounted_warfare', role: 'cavalry', svg: svgFor('horseman', 'advanced', 1.18) },
  camel_rider: { id: 'camel_rider', name: 'Camel Rider', tier: 'advanced', hp: 14, attack: 4, defense: 2, move: 3, cost: { food: 20, horses: 8 }, techReq: 'mounted_warfare', role: 'desert-cavalry', svg: svgFor('camel_rider', 'advanced', 1.18) },
  axeman: { id: 'axeman', name: 'Axeman', tier: 'advanced', hp: 14, attack: 6, defense: 2, move: 1, cost: { food: 12, iron: 8 }, techReq: 'iron_working', role: 'melee', svg: svgFor('axeman', 'advanced') },
  slinger: { id: 'slinger', name: 'Slinger', tier: 'advanced', hp: 9, attack: 3, defense: 1, move: 2, range: 2, cost: { food: 10, stone: 5 }, role: 'ranged', svg: svgFor('slinger', 'advanced') },
  // --- elite ---
  royal_guard: { id: 'royal_guard', name: 'Royal Guard', tier: 'elite', hp: 22, attack: 7, defense: 7, move: 1, cost: { food: 25, iron: 15, gold: 10 }, techReq: 'architecture', role: 'melee', svg: svgFor('royal_guard', 'elite') },
  elephant_rider: { id: 'elephant_rider', name: 'Elephant Rider', tier: 'elite', hp: 26, attack: 8, defense: 5, move: 2, cost: { food: 30, ivory: 15 }, techReq: 'animal_husbandry', resourceReq: 'ivory', role: 'shock', svg: svgFor('elephant_rider', 'elite', 1.15) },
  war_chariot: { id: 'war_chariot', name: 'War Chariot', tier: 'elite', hp: 18, attack: 7, defense: 3, move: 4, cost: { food: 25, horses: 15, wood: 10 }, techReq: 'siege_weapons', role: 'cavalry', svg: svgFor('war_chariot', 'elite', 1.15) },
  crossbowman: { id: 'crossbowman', name: 'Crossbowman', tier: 'elite', hp: 15, attack: 8, defense: 2, move: 1, range: 2, cost: { food: 20, iron: 12 }, techReq: 'siege_weapons', role: 'ranged', svg: svgFor('crossbowman', 'elite') },
  siege_tower: { id: 'siege_tower', name: 'Siege Tower', tier: 'elite', hp: 20, attack: 4, defense: 4, move: 1, cost: { food: 20, wood: 25 }, techReq: 'siege_weapons', role: 'siege', svg: svgFor('siege_tower', 'elite', 1.12) },
  catapult: { id: 'catapult', name: 'Catapult', tier: 'elite', hp: 14, attack: 10, defense: 1, move: 1, range: 3, cost: { food: 20, wood: 20, iron: 10 }, techReq: 'siege_weapons', role: 'siege', svg: svgFor('catapult', 'elite', 1.12) },
  // --- legendary ---
  lion_guard: { id: 'lion_guard', name: 'Lion Guard', tier: 'legendary', hp: 30, attack: 10, defense: 8, move: 2, cost: { food: 40, gold: 25 }, techReq: 'architecture', unique: true, role: 'melee', svg: svgFor('lion_guard', 'legendary') },
  spirit_shaman: { id: 'spirit_shaman', name: 'Spirit Shaman', tier: 'legendary', hp: 16, attack: 5, defense: 3, move: 2, range: 2, cost: { food: 30, gold: 20 }, techReq: 'currency', unique: true, role: 'support', svg: svgFor('spirit_shaman', 'legendary') },
  royal_elephant: { id: 'royal_elephant', name: 'Royal Elephant', tier: 'legendary', hp: 36, attack: 11, defense: 7, move: 2, cost: { food: 45, ivory: 25, gold: 15 }, techReq: 'siege_weapons', resourceReq: 'ivory', unique: true, role: 'shock', svg: svgFor('royal_elephant', 'legendary', 1.15) },
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
