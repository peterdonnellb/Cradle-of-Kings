// kingdoms.js — Playable kingdoms: bonuses, and inline SVG emblem crests.
//
// Palette note: every kingdom's `color` is used in three places at once — the start-screen
// card's name text and accent bar, the kingdom badge, and (critically) the in-game
// territory-border/unit-ring color drawn on top of busy terrain art. That triple duty means
// each of the 12 needs to be simultaneously: distinct from all 11 others, bright/saturated
// enough to read as text on a near-black card background, and bright enough to read as a
// thin border against a dozen different biome colors. The palette below was chosen (and
// once fixed — Zulu previously used the exact same near-black as the card background,
// making its own name invisible) to keep 12 clearly separate hue families rather than
// letting several kingdoms share "gold" or "red" and rely on the eye to sort them out.

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
/** Lightens a hex color toward white by `amount` (0-100). */
function liftColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const t = amount / 100;
  return rgbToHex([r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]);
}
/** Mixes two hex colors by ratio (0 = all colorA, 1 = all colorB). */
function mixColor(hexA, hexB, ratio) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex([a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio, a[2] + (b[2] - a[2]) * ratio]);
}

function crest(id, primary, secondary, glyphPath) {
  // Faceted shield backing: 3 flat panels (upper-left light, center base, lower-right dark)
  // instead of a smooth gradient, matching the medium-poly language used elsewhere.
  const light = liftColor(primary, 22);
  const dark = mixColor(secondary, '#000000', 0.32);
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,3 93,26 93,65 50,97 7,65 7,26" fill="${secondary}" stroke="#1C1208" stroke-width="2.5"/>
    <polygon points="50,3 93,26 50,50 7,26" fill="${light}"/>
    <polygon points="50,50 93,26 93,65 50,97" fill="${dark}"/>
    <polygon points="50,50 7,26 7,65 50,97" fill="${primary}"/>
    <polygon points="50,11 86,29 86,63 50,89 14,63 14,29" fill="none" stroke="#F1CE73" stroke-width="1.4" opacity="0.65"/>
    <circle cx="50" cy="10" r="1.8" fill="#F1CE73" opacity="0.8"/><circle cx="50" cy="90" r="1.8" fill="#F1CE73" opacity="0.8"/>
    <circle cx="10" cy="27.5" r="1.8" fill="#F1CE73" opacity="0.8"/><circle cx="90" cy="27.5" r="1.8" fill="#F1CE73" opacity="0.8"/>
    <circle cx="10" cy="64.5" r="1.8" fill="#F1CE73" opacity="0.8"/><circle cx="90" cy="64.5" r="1.8" fill="#F1CE73" opacity="0.8"/>
    ${glyphPath}
  </svg>`;
}

export const KINGDOMS = {
  kemet: {
    id: 'kemet', name: 'Kemet', subtitle: 'Kingdom of the Nile',
    color: '#D9A62E', accent: '#223A5E',
    bonus: 'Engineering & Rivers: +25% production adjacent to rivers; Wonders cost -15%.',
    effects: { riverProductionMult: 0.25, wonderCostMult: -0.15 },
    startingBiomePref: ['nile_valley', 'sahara_desert'],
    emblem: crest('kemet', '#D9A62E', '#8C3A1F',
      `<polygon points="50,24 62,58 50,80 38,58" fill="#223A5E" stroke="#1C1208" stroke-width="1.2"/>
       <circle cx="50" cy="20" r="7" fill="#F6EFDD" stroke="#1C1208" stroke-width="1"/><circle cx="50" cy="20" r="7" fill="none" stroke="#8C3A1F" stroke-width="1.4"/>
       <path d="M30,66 Q50,74 70,66" fill="none" stroke="#5FBEC4" stroke-width="3"/>
       <path d="M30,66 Q50,74 70,66" fill="none" stroke="#1C1208" stroke-width="0.6" opacity="0.4"/>`),
  },
  kush: {
    id: 'kush', name: 'Kush', subtitle: 'Archers of Nubia',
    color: '#C94A3B', accent: '#D8A93A',
    bonus: 'Master Archers: ranged units +20% attack and +1 range.',
    effects: { rangedAttackMult: 0.2, rangedRangeBonus: 1 },
    startingBiomePref: ['savanna', 'nile_valley'],
    emblem: crest('kush', '#C94A3B', '#5A2018',
      `<path d="M34,62 Q50,18 66,62" stroke="#F6EFDD" stroke-width="3.4" fill="none"/>
       <path d="M34,62 Q50,18 66,62" stroke="#1C1208" stroke-width="0.8" fill="none" opacity="0.35"/>
       <line x1="50" y1="26" x2="50" y2="68" stroke="#F6EFDD" stroke-width="2.6"/>
       <polygon points="50,24 46,32 54,32" fill="#F6EFDD" stroke="#1C1208" stroke-width="0.8"/>
       <polygon points="42,62 38,68 46,68" fill="#2A1B10" stroke="#1C1208" stroke-width="0.6"/><polygon points="58,62 54,68 62,68" fill="#2A1B10" stroke="#1C1208" stroke-width="0.6"/>`),
  },
  aksum: {
    id: 'aksum', name: 'Aksum', subtitle: 'Traders of the Red Sea',
    color: '#2F9E68', accent: '#D8A93A',
    bonus: 'Maritime Trade: +2 gold per naval trade route; ships built 30% faster.',
    effects: { coastalGoldFlat: 2 },
    startingBiomePref: ['coast', 'rift_highlands'],
    emblem: crest('aksum', '#2F9E68', '#164A30',
      `<rect x="45" y="18" width="10" height="52" fill="#D8A93A" stroke="#1C1208" stroke-width="1"/>
       <rect x="41" y="66" width="18" height="6" fill="#8C3A1F" stroke="#1C1208" stroke-width="1"/>
       <rect x="45" y="26" width="10" height="4" fill="#164A30"/><rect x="45" y="38" width="10" height="4" fill="#164A30"/><rect x="45" y="50" width="10" height="4" fill="#164A30"/>
       <polygon points="42,18 50,10 58,18" fill="#F1CE73" stroke="#1C1208" stroke-width="1"/>`),
  },
  mali: {
    id: 'mali', name: 'Mali', subtitle: 'Empire of Gold',
    color: '#E8821E', accent: '#1F4B37',
    bonus: 'Gold Economy: +30% gold from mines and markets; wonders grant bonus gold.',
    effects: { cityGoldMult: 0.3 },
    startingBiomePref: ['savanna', 'sahara_desert'],
    emblem: crest('mali', '#F1CE73', '#B5502D',
      `<circle cx="50" cy="50" r="18" fill="#8C3A1F" stroke="#1C1208" stroke-width="1.2"/><circle cx="50" cy="50" r="18" fill="none" stroke="#5A2410" stroke-width="1.4"/>
       <circle cx="50" cy="50" r="10" fill="#F1CE73" stroke="#1C1208" stroke-width="0.8"/>
       <circle cx="34" cy="30" r="5" fill="#F1CE73" opacity="0.9" stroke="#1C1208" stroke-width="0.6"/><circle cx="68" cy="32" r="4" fill="#F1CE73" opacity="0.85" stroke="#1C1208" stroke-width="0.6"/>`),
  },
  songhai: {
    id: 'songhai', name: 'Songhai', subtitle: 'Riders of the Sahel',
    color: '#4A7BA6', accent: '#223A5E',
    bonus: 'Cavalry Supremacy: mounted units +1 movement, +15% attack.',
    effects: { cavalryMoveBonus: 1, cavalryAttackMult: 0.15 },
    startingBiomePref: ['sahel_grassland', 'nile_valley'],
    emblem: crest('songhai', '#4A7BA6', '#1F3A54',
      `<path d="M30,66 Q50,20 70,66" fill="none" stroke="#F6EFDD" stroke-width="4"/>
       <path d="M30,66 Q50,20 70,66" fill="none" stroke="#1C1208" stroke-width="0.8" opacity="0.3"/>
       <path d="M46,30 Q50,22 54,30 L52,36 L48,36Z" fill="#F6EFDD" stroke="#1C1208" stroke-width="0.7"/>
       <circle cx="30" cy="66" r="4.5" fill="#F6EFDD" stroke="#1C1208" stroke-width="0.8"/><circle cx="70" cy="66" r="4.5" fill="#F6EFDD" stroke="#1C1208" stroke-width="0.8"/>
       <path d="M22,70 Q50,80 78,70" fill="none" stroke="#5FBEC4" stroke-width="2.6"/>`),
  },
  benin: {
    id: 'benin', name: 'Benin', subtitle: 'Bronze Walls',
    color: '#A03955', accent: '#D8A93A',
    bonus: 'Fortified Cities: city walls +40% defense; free walls at pop 3.',
    effects: { wallsDefenseMult: 0.4, freeWallsAtPop: 3 },
    startingBiomePref: ['congo_rainforest', 'baobab_forest'],
    emblem: crest('benin', '#4A3427', '#241A10',
      `<rect x="32" y="30" width="36" height="36" fill="#A03955" stroke="#1C1208" stroke-width="1.2"/>
       <rect x="39" y="30" width="6" height="36" fill="#D8A93A"/><rect x="55" y="30" width="6" height="36" fill="#D8A93A"/>
       <rect x="32" y="30" width="36" height="5" fill="#D8A93A" stroke="#1C1208" stroke-width="0.8"/>
       <circle cx="50" cy="48" r="5" fill="#F1CE73" stroke="#1C1208" stroke-width="0.8"/>`),
  },
  zimbabwe: {
    id: 'zimbabwe', name: 'Zimbabwe', subtitle: 'Masters of Stone',
    color: '#8C9AA8', accent: '#4A3427',
    bonus: 'Stone Construction: buildings cost -20% stone; +1 defense per city tier.',
    effects: { buildingStoneCostMult: -0.2, defensePerPopTier: 1 },
    startingBiomePref: ['rift_highlands', 'savanna'],
    emblem: crest('zimbabwe', '#8C9AA8', '#4E5761',
      `<polygon points="50,20 68,33 68,59 50,72 32,59 32,33" fill="none" stroke="#F6EFDD" stroke-width="3.2"/>
       <polygon points="50,20 68,33 68,59 50,72 32,59 32,33" fill="none" stroke="#1C1208" stroke-width="0.7" opacity="0.4"/>
       <polygon points="50,32 60,39 60,55 50,62 40,55 40,39" fill="none" stroke="#F6EFDD" stroke-width="1.6" opacity="0.8"/>
       <circle cx="50" cy="47" r="4" fill="#D8A93A" stroke="#1C1208" stroke-width="0.8"/>`),
  },
  zulu: {
    id: 'zulu', name: 'Zulu', subtitle: 'Impi Warriors',
    color: '#D6402C', accent: '#1C1208',
    bonus: 'Elite Warriors: melee units +20% attack when attacking (Impi doctrine).',
    effects: { meleeAttackMultOnAttack: 0.2 },
    startingBiomePref: ['savanna', 'rift_highlands'],
    emblem: crest('zulu', '#3A281A', '#1C1208',
      `<path d="M50,20 L64,30 L64,66 L50,80 L36,66 L36,30 Z" fill="#F1E7D0" stroke="#1C1208" stroke-width="1.2"/>
       <path d="M50,20 L64,30 L64,66 L50,80 Z" fill="#2A1B10"/>
       <rect x="48.5" y="18" width="3" height="64" fill="#8C6239" stroke="#1C1208" stroke-width="0.5"/>
       <polygon points="46,14 50,4 54,14" fill="#D6402C" stroke="#1C1208" stroke-width="0.8"/>`),
  },
  yoruba: {
    id: 'yoruba', name: 'Yoruba', subtitle: 'Keepers of Culture',
    color: '#C24E8C', accent: '#D8A93A',
    bonus: 'Cultural Flourishing: +25% culture output; happiness threshold reduced.',
    effects: { cultureMult: 0.25, happinessFlat: 5 },
    startingBiomePref: ['congo_rainforest', 'savanna'],
    emblem: crest('yoruba', '#C24E8C', '#7A2E52',
      `<ellipse cx="50" cy="50" rx="7" ry="8" fill="#F6EFDD" stroke="#1C1208" stroke-width="0.9"/>
       <ellipse cx="36" cy="44" rx="6" ry="7" fill="#F6EFDD" opacity="0.92" stroke="#1C1208" stroke-width="0.8"/><ellipse cx="64" cy="44" rx="6" ry="7" fill="#F6EFDD" opacity="0.92" stroke="#1C1208" stroke-width="0.8"/>
       <ellipse cx="38" cy="62" rx="6" ry="7" fill="#F6EFDD" opacity="0.92" stroke="#1C1208" stroke-width="0.8"/><ellipse cx="62" cy="62" rx="6" ry="7" fill="#F6EFDD" opacity="0.92" stroke="#1C1208" stroke-width="0.8"/>
       <circle cx="50" cy="50" r="2.4" fill="#7A2E52"/>`),
  },
  swahili: {
    id: 'swahili', name: 'Swahili Coast', subtitle: 'Merchants of the Ocean',
    color: '#2E93A6', accent: '#D8A93A',
    bonus: 'Commerce Fleet: +2 trade route capacity; ocean tiles usable earlier.',
    effects: { tradeRouteCapacityBonus: 2 },
    startingBiomePref: ['coast', 'mangrove_coast'],
    emblem: crest('swahili', '#2E93A6', '#144F5C',
      `<path d="M26,60 Q50,72 74,60 L68,68 Q50,76 32,68 Z" fill="#F1CE73" stroke="#1C1208" stroke-width="1"/>
       <path d="M50,18 L50,60" stroke="#F1CE73" stroke-width="3"/>
       <path d="M50,20 Q72,30 50,42Z" fill="#F6EFDD" stroke="#1C1208" stroke-width="0.8"/>
       <path d="M50,24 Q34,32 50,40Z" fill="#F6EFDD" opacity="0.85" stroke="#1C1208" stroke-width="0.7"/>`),
  },
  ethiopia: {
    id: 'ethiopia', name: 'Ethiopia', subtitle: 'Highland Fortress',
    color: '#8A9A3C', accent: '#8C2F2F',
    bonus: 'Mountain Warfare: units +25% defense on highlands; no highland move penalty.',
    effects: { highlandDefenseBonus: 0.25, highlandMoveFree: true },
    startingBiomePref: ['rift_highlands', 'volcanic_highlands'],
    emblem: crest('ethiopia', '#8A9A3C', '#4C5620',
      `<polygon points="30,66 50,22 70,66" fill="#4C5620" stroke="#1C1208" stroke-width="1.1"/><polygon points="40,66 50,38 60,66" fill="#D8A93A" stroke="#1C1208" stroke-width="0.8"/>
       <rect x="47" y="12" width="6" height="14" fill="#F1CE73" stroke="#1C1208" stroke-width="0.8"/><rect x="43" y="16" width="14" height="4" fill="#F1CE73" stroke="#1C1208" stroke-width="0.8"/>`),
  },
  carthage: {
    id: 'carthage', name: 'Carthage', subtitle: 'Lords of the Sea',
    color: '#6B3FA0', accent: '#D8A93A',
    bonus: 'Naval Expansion: ships +2 movement; coastal cities found for free harbor.',
    effects: { freeHarborOnCoastalFound: true },
    startingBiomePref: ['coast', 'sahara_desert'],
    emblem: crest('carthage', '#6B3FA0', '#33205C',
      `<circle cx="50" cy="38" r="9" fill="none" stroke="#F1CE73" stroke-width="2.6"/>
       <circle cx="50" cy="38" r="9" fill="none" stroke="#1C1208" stroke-width="0.7" opacity="0.4"/>
       <line x1="50" y1="47" x2="50" y2="68" stroke="#F1CE73" stroke-width="2.6"/>
       <line x1="38" y1="58" x2="62" y2="58" stroke="#F1CE73" stroke-width="2.6"/>
       <path d="M30,72 Q50,80 70,72" fill="none" stroke="#5FBEC4" stroke-width="2.4"/>`),
  },
};

export function getKingdomList() {
  return Object.values(KINGDOMS);
}
