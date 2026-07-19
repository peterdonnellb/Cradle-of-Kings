// biomes.js — Biome data + inline SVG tile art generators.
//
// Art direction notes (visual overhaul pass):
//  - Color psychology: each biome's palette is chosen for legibility-at-a-glance ("game
//    theory" readability — a player scanning the map should classify terrain by color alone
//    within a fraction of a second, so hues are kept far apart in hue AND lightness between
//    adjacent-on-map biomes) as well as emotional tone (warm inviting golds for savanna,
//    cool dramatic slate for highlands, high-contrast ember/char for volcanic danger,
//    trustworthy deep blue for ocean).
//  - African art motifs are deliberately varied per biome rather than one pattern reused
//    everywhere: bogolanfini/mudcloth triangles (Mali) for the arid west, Kuba-cloth-style
//    lattice (Kuba Kingdom, Congo Basin) for rainforest floor, Ndebele-inspired chevron
//    bands (South Africa) for highland terraces, and small Adinkra-style stamps (Akan,
//    Ghana) scattered sparingly across grassland as "ancient waymarker" texture.
//  - Three hand-authored variants per biome (+ a deterministic horizontal flip applied by
//    the renderer) break up the repetition that a single stamped tile image creates across
//    a 1000+ tile map, without paying the performance cost of truly regenerating unique
//    art per tile every frame.

import {
  contactShadow, facetedCanopy, facetedTrunk, facetedRock, facetedGem,
  facetedPeak, facetedTuft, facetedWaterGleam, facetedCrop,
} from './facetedArt.js';

const PAL = {
  clay: '#B5502D',
  clayDark: '#8C3A1F',
  clayLight: '#D97B4F',
  gold: '#D8A93A',
  goldLight: '#F1CE73',
  goldDeep: '#B8862A',
  indigo: '#223A5E',
  indigoDeep: '#152941',
  bark: '#4A3427',
  barkLight: '#6B4B33',
  sand: '#EDE0C0',
  sandDark: '#D8C594',
  kente: '#2E6B4F',
  kenteDark: '#1F4B37',
  kenteLight: '#3F8563',
  red: '#8C2F2F',
  ember: '#E0642C',
  water: '#2C7E8C',
  waterDeep: '#123B47',
  waterShallow: '#5FBEC4',
  waterFoam: '#EAF6F2',
  stone: '#8D8474',
  stoneDark: '#5B5348',
  stoneLight: '#ADA48E',
  ivory: '#F6EFDD',
  lava: '#E24A1F',
  lavaCore: '#FFB347',
  fertile: '#4E8F4A',
  fertileLight: '#7CB86B',
};

// Flat-top hex polygon points for a 100x100 viewBox, centered at 50,50, radius r
function hexPoints(r = 46) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}
const HEX_CLIP = hexPoints(50);

let _uidCounter = 0;
function uid() { return `u${(_uidCounter++).toString(36)}`; }

function wrap(defs, body, strokeColor = 'rgba(20,14,8,0.32)') {
  const clipId = uid();
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="clip-${clipId}"><polygon points="${HEX_CLIP}"/></clipPath>
      ${defs}
    </defs>
    <g clip-path="url(#clip-${clipId})">${body}</g>
    <polygon points="${hexPoints(49)}" fill="none" stroke="${strokeColor}" stroke-width="1.4"/>
  </svg>`;
}

// --- African-art-inspired texture motifs ---------------------------------------

/** Bogolanfini / mudcloth-style triangle rows (Mali) — bold, geometric, earth-toned. */
function mudclothTriangles(color, opacity = 0.12, size = 14, rotate = 0) {
  const id = uid();
  return {
    id,
    defs: `<pattern id="pat-${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotate})">
      <polygon points="0,${size} ${size / 2},0 ${size},${size}" fill="${color}" opacity="${opacity}"/>
    </pattern>`,
  };
}

/** Kuba-cloth-style diamond lattice (Kuba Kingdom, Congo Basin) — dense woven-raffia look for rainforest floor. */
function kubaLattice(colorA, colorB, opacity = 0.16) {
  const id = uid();
  return {
    id,
    defs: `<pattern id="pat-${id}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
      <rect width="16" height="16" fill="none"/>
      <path d="M0,8 L8,0 L16,8 L8,16 Z" fill="none" stroke="${colorA}" stroke-width="1.4" opacity="${opacity}"/>
      <circle cx="8" cy="8" r="1.6" fill="${colorB}" opacity="${opacity + 0.06}"/>
    </pattern>`,
  };
}

/** Small Adinkra-style waymarker stamp — simplified concentric spiral, scattered sparingly. */
function adinkraStamp(cx, cy, scale = 1, color = 'rgba(74,52,39,0.28)') {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="none" stroke="${color}" stroke-width="1.3">
    <circle cx="0" cy="0" r="5"/>
    <circle cx="0" cy="0" r="2.4"/>
    <path d="M -5 0 A 5 5 0 0 1 0 -5 M 5 0 A 5 5 0 0 1 0 5" stroke-width="1"/>
  </g>`;
}

/** San-rock-art-style ochre dot cluster — evokes ancient rock paintings on stone/desert. */
function rockArtDots(cx, cy, scale = 1, color = '#8C3A1F') {
  const pts = [[0, 0], [3, -2], [-3, -1], [2, 3], [-2, 3], [5, 1], [-5, -2]];
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${color}" opacity="0.55">
    ${pts.map(([x, y]) => `<circle cx="${x * 2}" cy="${y * 2}" r="1.1"/>`).join('')}
  </g>`;
}

// --- flora & landmark silhouettes -----------------------------------------------

/** Baobab — the defining feature is a massive bulbous trunk topped by sparse, gnarly
 *  root-like branches (the "upside-down tree" silhouette), not a leafy round canopy. */
function baobabSilhouette(cx, cy, scale, color = '#6E5E4C', twin = false) {
  const dark = '#33291F', mid = color, light = '#A08D72';
  const branchColor = '#3A2E22';
  let out = `<g transform="translate(${cx},${cy}) scale(${scale})">`;
  out += contactShadow(0, 9, 10, 2.9, 0.26);
  // sparse branch-tips (faceted small twig triangles instead of stroked lines) — kept
  // compact (reach ~30 units, not 42) so the tree stays inside the hex at typical placements
  const branches = [[-10, -20, -15, -23], [9, -19, 13, -22], [-3, -25, -4.5, -29.5], [4, -25, 6, -29.5], [-1, -23, -1.6, -26.5]];
  for (const [x1, y1, x2, y2] of branches) {
    out += `<polygon points="${x1},${y1 + 1.6} ${x2},${y2} ${x1 + (x2 - x1) * 0.4},${y1}" fill="${branchColor}"/>`;
    out += `<polygon points="${x2},${y2} ${x2 - 1.8},${y2 + 2} ${x2 + 1.5},${y2 + 1.2}" fill="#5C6B3E"/>`;
  }
  // barrel trunk as 3 vertical facets (light-left, mid-center, dark-right) for real roundness
  out += `<polygon points="-6.4,9 -6.4,-8 -4.8,-15 0,-15 0,9" fill="${light}"/>`;
  out += `<polygon points="0,9 0,-15 2.4,-15 4,-8 4,9" fill="${mid}"/>`;
  out += `<polygon points="4,9 4,-8 2.4,-15 6.4,-13 6.4,9" fill="${dark}"/>`;
  out += `<polygon points="-6.4,-8 -4.8,-15 0,-15 2.4,-15 6.4,-13 4,-9.6 -2.4,-10.4Z" fill="${mid}" opacity="0.9"/>`;
  if (twin) {
    out += `<polygon points="5.6,3.2 5.6,-7.2 7.2,-12 9.6,-12 9.6,3.2" fill="${dark}" opacity="0.9"/>`;
    out += `<polygon points="9.6,3.2 9.6,-12 11.2,-8.8 11.2,3.2" fill="${dark}"/>`;
  }
  out += '</g>';
  return out;
}

/** Acacia — the defining feature is a wide, flat-topped umbrella canopy (classic savanna
 *  silhouette), built from faceted triangles (not a smooth gradient blob) for real volume. */
function acaciaSilhouette(cx, cy, scale, color = '#4A6741') {
  const dark = '#243318', light = '#7EA164';
  let out = `<g transform="translate(${cx},${cy}) scale(${scale})">`;
  out += contactShadow(0, 11, 15, 3.4, 0.24);
  out += facetedTrunk(0, -3, 10, 2.6, 3.4, PAL.barkLight, PAL.bark);
  out += `<polygon points="-1,-3 -6,-6 -5,-9" fill="${PAL.bark}"/><polygon points="1,-3 6,-6.5 5,-10" fill="${PAL.barkLight}"/>`;
  // wide flat canopy: a fan of triangular facets from a shared spine, alternating light/dark
  // to read as a faceted umbrella rather than a smooth dome
  const spine = [-14, -3, -7, -12, 0, -14, 7, -12, 14, -3];
  const rim = [-14, -10.5, -7, -17, 0, -19, 7, -16.5, 14, -10.5];
  for (let i = 0; i < 4; i++) {
    const ax = spine[i * 2], ay = spine[i * 2 + 1];
    const bx = spine[i * 2 + 2], by = spine[i * 2 + 3];
    const rx = rim[i * 2], ry = rim[i * 2 + 1];
    const rx2 = rim[i * 2 + 2], ry2 = rim[i * 2 + 3];
    const fill = i < 2 ? light : (i === 2 ? color : dark);
    out += `<polygon points="${ax},${ay} ${rx},${ry} ${rx2},${ry2} ${bx},${by}" fill="${fill}"/>`;
  }
  out += `<polygon points="-14,-3 0,-9 14,-3 0,1Z" fill="${dark}" opacity="0.55"/>`;
  out += '</g>';
  return out;
}

/** Candelabra euphorbia — thick fleshy upright arms, each a faceted 2-tone prism. */
function euphorbiaSilhouette(cx, cy, scale, color = '#3E6B4A') {
  const light = '#6FA37E', dark = '#26402E';
  function arm(x1, y1, x2, y2, w) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * w, ny = dx / len * w;
    return `<polygon points="${x1 + nx / 2},${y1 + ny / 2} ${x1 - nx / 2},${y1 - ny / 2} ${x2 - nx / 2},${y2 - ny / 2}" fill="${dark}"/>
      <polygon points="${x1 + nx / 2},${y1 + ny / 2} ${x2 - nx / 2},${y2 - ny / 2} ${x2 + nx / 2},${y2 + ny / 2}" fill="${light}"/>`;
  }
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    ${contactShadow(0, 11, 8, 2.6, 0.24)}
    ${arm(0, 11, -1, -16, 3.2)}
    ${arm(-1, -3, -7.5, -11, 2.6)}
    ${arm(1, -5, 7.8, -13, 2.6)}
    ${arm(-0.7, 7, -5.5, 0, 2.2)}
  </g>`;
}

function palmSilhouette(cx, cy, scale, color = '#3E7A4A') {
  const light = '#7DBE85', dark = '#255238';
  let fronds = '';
  const angles = [-70, -35, -10, 15, 45];
  const lens = [13, 15, 16, 15, 12];
  for (let i = 0; i < angles.length; i++) {
    const a = (Math.PI / 180) * angles[i];
    const len = lens[i];
    const tipX = Math.sin(a) * len, tipY = -10 - Math.cos(a) * len * 0.7;
    const midX = tipX * 0.5, midY = -10 + (tipY + 10) * 0.5 - 2;
    const fill = i < 2 ? light : (i === 2 ? color : dark);
    fronds += `<polygon points="0,-10 ${(midX - 2.2).toFixed(1)},${(midY - 1).toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)}" fill="${fill}"/>`;
    fronds += `<polygon points="0,-10 ${tipX.toFixed(1)},${tipY.toFixed(1)} ${(midX + 2.2).toFixed(1)},${(midY + 1).toFixed(1)}" fill="${dark}" opacity="0.6"/>`;
  }
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    ${contactShadow(0, 9, 9, 2.6, 0.24)}
    <polygon points="-1.6,9 -1,-3 1,-10 2,-10 1.6,9" fill="${PAL.barkLight}"/>
    <polygon points="1,-3 2,-10 2.6,9 1.6,9" fill="${PAL.bark}"/>
    ${fronds}
  </g>`;
}

/** Papyrus reed cluster for riverbanks and the Nile Valley — faceted blade tips. */
function papyrusCluster(cx, cy, scale, color = '#4F8B4A') {
  const light = '#7BB870', dark = '#2E5A34';
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    ${facetedTrunk(0, -10, 10, 1.6, 2.2, light, dark)}
    ${facetedTrunk(-3, -7, 10, 1.4, 1.8, light, dark)}
    ${facetedTrunk(3, -7, 10, 1.4, 1.8, light, dark)}
    <polygon points="0,-11 -3,-16 0,-15 3,-16" fill="${light}"/>
    <polygon points="-3,-8 -6,-12 -3,-11.5 0,-12" fill="${dark}"/>
    <polygon points="3,-8 0,-12 3,-11.5 6,-12" fill="${light}"/>
  </g>`;
}

/** Termite mound — small savanna landmark, faceted ochre spire (light-left/dark-right). */
function termiteMound(cx, cy, scale) {
  const light = '#C97A4A', dark = '#8C4A26';
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    ${contactShadow(0, 8, 6, 1.8, 0.22)}
    <polygon points="-4,8 -6,-4 0,-12 0,8" fill="${light}"/>
    <polygon points="0,8 0,-12 6,-4 4,8" fill="${dark}"/>
    <polygon points="-3,-2 0,-9 3,-2 0,2" fill="${light}" opacity="0.5"/>
  </g>`;
}

function duneCurves(color1 = PAL.goldDeep, color2 = PAL.gold, shift = 0) {
  return `<path d="M ${-10 + shift} 52 Q ${25 + shift} 36 ${60 + shift} 52 T ${130 + shift} 46 L 130 110 L -10 110 Z" fill="${color1}" opacity="0.55"/>
          <path d="M ${-10 - shift} 68 Q ${30 - shift} 55 ${60 - shift} 68 T ${130 - shift} 63 L 130 110 L -10 110 Z" fill="${color2}" opacity="0.4"/>
          <path d="M -10 82 Q 40 74 70 84 T 130 80 L 130 110 L -10 110 Z" fill="${color1}" opacity="0.25"/>`;
}

/** Water surface highlight — faceted diamond gleams instead of stroked ripple lines,
 *  consistent with the medium-poly faceted style used everywhere else. */
function waterRipples(cx, cy, w = 24, color = 'rgba(255,255,255,0.4)') {
  return `${facetedWaterGleam(cx - w * 0.4, cy, w * 0.32, 3.4, color, 0.5)}
    ${facetedWaterGleam(cx + w * 0.35, cy + 6, w * 0.22, 2.6, color, 0.4)}`;
}

/** Mountain range — each peak is now a genuine 3-facet faceted form (light left slope,
 *  mid ridge, dark right slope) instead of one flat triangle, matching the low-poly
 *  mountain language used for volcanic peaks and gem/rock props. */
function mountainRange(baseColor, midColor, snow = false, shift = 0) {
  const light = '#8FA26A', dark = '#465432';
  let out = '<g>';
  out += facetedPeak(20 + shift, 82, 20 + shift, 28, 24, light, baseColor, dark, snow ? '#F0F4E8' : null);
  out += facetedPeak(64 + shift, 82, 64 + shift, 18, 30, light, baseColor, dark, snow ? '#F0F4E8' : null);
  out += facetedPeak(42 + shift, 82, 42 + shift, 44, 16, midColor, midColor, dark, null);
  out += '</g>';
  return out;
}

// --- biome SVG generators (3 hand-authored variants each) ------------------------

function svgOceanA() {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="45%" cy="30%" r="80%">
    <stop offset="0%" stop-color="${PAL.waterShallow}"/><stop offset="55%" stop-color="${PAL.water}"/><stop offset="100%" stop-color="${PAL.waterDeep}"/>
  </radialGradient>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>${waterRipples(32, 36, 22)}${waterRipples(66, 62, 26)}${waterRipples(48, 82, 18)}`);
}
function svgOceanB() {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="60%" cy="45%" r="75%">
    <stop offset="0%" stop-color="${PAL.waterShallow}"/><stop offset="60%" stop-color="${PAL.water}"/><stop offset="100%" stop-color="${PAL.waterDeep}"/>
  </radialGradient>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>${waterRipples(40, 28, 24)}${waterRipples(58, 58, 20)}${waterRipples(30, 78, 22)}`);
}
function svgOceanC() {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="35%" cy="60%" r="80%">
    <stop offset="0%" stop-color="${PAL.waterShallow}"/><stop offset="55%" stop-color="${PAL.water}"/><stop offset="100%" stop-color="${PAL.waterDeep}"/>
  </radialGradient>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>${waterRipples(50, 24, 20)}${waterRipples(24, 54, 22)}${waterRipples(70, 74, 24)}`);
}

function svgCoastVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${PAL.waterShallow}"/><stop offset="55%" stop-color="#7FD4C9"/><stop offset="100%" stop-color="#9FE0D2"/>
  </linearGradient>`;
  // Pale, low-opacity sandbar patches suggest a visible shallow seafloor through clear water —
  // the tile still reads unambiguously as water (no dry shoreline), consistent with it being
  // impassable to land units, but distinct in tone from the darker, deeper ocean tile.
  const sandbars = seed === 0
    ? `<ellipse cx="35" cy="70" rx="27" ry="11" fill="${PAL.sand}" opacity="0.22"/><ellipse cx="72" cy="42" rx="18" ry="8" fill="${PAL.sand}" opacity="0.16"/>`
    : seed === 1
    ? `<ellipse cx="56" cy="60" rx="32" ry="13" fill="${PAL.sand}" opacity="0.2"/><ellipse cx="20" cy="30" rx="14" ry="7" fill="${PAL.sand}" opacity="0.14"/>`
    : `<ellipse cx="28" cy="48" rx="20" ry="9" fill="${PAL.sand}" opacity="0.2"/><ellipse cx="70" cy="72" rx="24" ry="10" fill="${PAL.sand}" opacity="0.16"/>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>
    ${sandbars}
    ${waterRipples(38, 24, 22)}${waterRipples(64, 46, 20)}${waterRipples(46, 74, 20)}`);
}

function svgSaharaVariant(duneShift, palmOasis) {
  const id = uid();
  const mc = mudclothTriangles(PAL.clayDark, 0.09, 16, 8);
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="${PAL.goldLight}"/><stop offset="100%" stop-color="${PAL.gold}"/>
  </linearGradient>${mc.defs}`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/><rect x="-10" y="-10" width="120" height="120" fill="url(#pat-${mc.id})"/>
    ${duneCurves(PAL.goldDeep, PAL.gold, duneShift)}
    ${rockArtDots(76, 30, 0.9)}`);
}

function svgSahelVariant(treeSeed) {
  const id = uid();
  const mc = mudclothTriangles(PAL.bark, 0.08, 13, -6);
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D9B968"/><stop offset="100%" stop-color="#C29A4C"/>
  </linearGradient>${mc.defs}`;
  const trees = treeSeed === 0
    ? `${acaciaSilhouette(28, 62, 1)}${acaciaSilhouette(70, 42, 0.75)}${termiteMound(52, 74, 0.8)}`
    : treeSeed === 1
    ? `${acaciaSilhouette(62, 50, 1.05)}${acaciaSilhouette(27, 39, 0.65)}${termiteMound(80, 66, 0.7)}`
    : `${acaciaSilhouette(45, 60, 0.95)}${acaciaSilhouette(73, 41, 0.6)}${adinkraStamp(20, 40, 0.9)}`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/><rect x="-10" y="-10" width="120" height="120" fill="url(#pat-${mc.id})"/>${trees}`);
}

function svgSavannaVariant(seed) {
  const id = uid();
  const mc = mudclothTriangles(PAL.kenteDark, 0.06, 15, 4);
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="30%" r="90%">
    <stop offset="0%" stop-color="#DFC067"/><stop offset="100%" stop-color="#C7A24E"/>
  </radialGradient>${mc.defs}`;
  const scene = seed === 0
    ? `${acaciaSilhouette(36, 50, 1.2)}${baobabSilhouette(72, 64, 0.85)}${termiteMound(58, 78, 0.9)}`
    : seed === 1
    ? `${baobabSilhouette(30, 58, 0.95)}${acaciaSilhouette(68, 40, 1)}${adinkraStamp(50, 76, 1)}`
    : `${acaciaSilhouette(50, 34, 0.85)}${acaciaSilhouette(69, 60, 0.85)}${baobabSilhouette(26, 68, 0.62, PAL.bark, true)}`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/><rect x="-10" y="-10" width="120" height="120" fill="url(#pat-${mc.id})"/>${scene}`);
}

function svgRainforestVariant(seed) {
  const id = uid();
  const kb = kubaLattice(PAL.kenteLight, PAL.goldLight, 0.14);
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="20%" r="100%">
    <stop offset="0%" stop-color="#2A6B45"/><stop offset="100%" stop-color="#173D28"/>
  </radialGradient>${kb.defs}`;
  const canopy = seed === 0
    ? `<circle cx="28" cy="40" r="16" fill="#2E7A4C"/><circle cx="56" cy="54" r="19" fill="#245F3C"/><circle cx="74" cy="32" r="13" fill="#338352"/>`
    : seed === 1
    ? `<circle cx="40" cy="30" r="18" fill="#2E7A4C"/><circle cx="66" cy="58" r="16" fill="#245F3C"/><circle cx="20" cy="62" r="14" fill="#338352"/>`
    : `<circle cx="50" cy="50" r="20" fill="#245F3C"/><circle cx="24" cy="30" r="13" fill="#2E7A4C"/><circle cx="78" cy="64" r="12" fill="#338352"/>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/><rect x="-10" y="-10" width="120" height="120" fill="url(#pat-${kb.id})"/>
    ${canopy}<circle cx="50" cy="46" r="34" fill="none" stroke="#0F2E1C" stroke-width="1" opacity="0.3"/>`);
}

function svgRiftHighlandsVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#B7C79A"/><stop offset="55%" stop-color="#8A9C72"/><stop offset="100%" stop-color="#6C7C58"/>
  </linearGradient>`;
  const shift = seed === 0 ? 0 : seed === 1 ? -8 : 10;
  const terraces = `<g opacity="0.9">
    <path d="M -10,84 L 40,84 L 34,90 L -10,90 Z" fill="#8C2F2F"/>
    <path d="M 40,84 L 90,84 L 84,90 L 34,90 Z" fill="${PAL.gold}"/>
    <path d="M -10,90 L 34,90 L 28,96 L -10,96 Z" fill="${PAL.indigo}"/>
    <path d="M 34,90 L 84,90 L 78,96 L 28,96 Z" fill="#8C2F2F"/>
  </g>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>${mountainRange('#5F6E4B', '#7C8C63', false, shift)}
    ${seed === 2 ? terraces : euphorbiaSilhouette(72, 68, 0.85)}${seed === 0 ? euphorbiaSilhouette(23, 70, 0.62) : ''}`);
}

function svgVolcanicVariant(seed) {
  const shift = seed === 0 ? 0 : seed === 1 ? 8 : -8;
  const cx = 60 + shift;
  const coneFacets = `
    <polygon points="${45 + shift},55 ${cx},18 ${cx + 4},22" fill="${PAL.lavaCore}"/>
    <polygon points="${cx},18 ${75 + shift},55 ${cx + 4},22" fill="${PAL.lava}"/>
    <polygon points="${45 + shift},55 ${cx + 4},22 ${cx},34 ${58+shift},55" fill="${PAL.stoneDark}" opacity="0.7"/>
    <circle cx="${cx}" cy="22" r="4" fill="${PAL.lavaCore}"/>`;
  return wrap('', `<rect x="-10" y="-10" width="120" height="120" fill="#332C28"/>${mountainRange('#3B342F', '#4A423B', false, shift)}
    ${coneFacets}
    <path d="M${58 + shift},50 Q${60 + shift},60 ${56 + shift},70" stroke="${PAL.ember}" stroke-width="2" fill="none" opacity="0.8"/>`);
}

function svgBaobabForestVariant(seed) {
  const id = uid();
  const mc = mudclothTriangles(PAL.bark, 0.07, 14, 12);
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D2B168"/><stop offset="100%" stop-color="#BC9752"/>
  </linearGradient>${mc.defs}`;
  const trees = seed === 0
    ? `${baobabSilhouette(35, 58, 1.05)}${baobabSilhouette(67, 42, 0.62, PAL.bark, true)}${baobabSilhouette(76, 68, 0.5)}`
    : seed === 1
    ? `${baobabSilhouette(50, 55, 1.05, PAL.bark, true)}${baobabSilhouette(26, 36, 0.55)}`
    : `${baobabSilhouette(28, 64, 0.8)}${baobabSilhouette(55, 36, 0.72)}${baobabSilhouette(78, 60, 0.55, PAL.bark, true)}`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/><rect x="-10" y="-10" width="120" height="120" fill="url(#pat-${mc.id})"/>${trees}`);
}

function svgMangroveVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${PAL.waterShallow}"/><stop offset="45%" stop-color="#345C40"/><stop offset="100%" stop-color="#22432D"/>
  </linearGradient>`;
  const rootColor = '#2E2015';
  const roots = seed === 0
    ? `<g stroke="${rootColor}" stroke-width="2.6" fill="none"><path d="M25,70 L25,92 M19,72 L19,90 M31,72 L31,91"/><path d="M65,64 L65,90 M59,66 L59,88 M71,66 L71,89"/></g>
       <ellipse cx="25" cy="66" rx="11" ry="7" fill="#5A9268"/><ellipse cx="65" cy="60" rx="12" ry="7" fill="#5A9268"/>`
    : seed === 1
    ? `<g stroke="${rootColor}" stroke-width="2.6" fill="none"><path d="M40,58 L40,90 M33,61 L33,87 M47,61 L47,88"/></g><ellipse cx="40" cy="54" rx="15" ry="8" fill="#5A9268"/>`
    : `<g stroke="${rootColor}" stroke-width="2.6" fill="none"><path d="M22,64 L22,90 M55,70 L55,92 M78,58 L78,86"/></g>
       <ellipse cx="22" cy="60" rx="10" ry="6" fill="#5A9268"/><ellipse cx="55" cy="66" rx="10" ry="6" fill="#5A9268"/><ellipse cx="78" cy="54" rx="10" ry="6" fill="#5A9268"/>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="58" fill="${PAL.waterShallow}"/><rect x="-10" y="48" width="120" height="62" fill="url(#g-${id})"/>
    ${waterRipples(50, 28, 20)}${roots}`);
}

// Nile Valley / river-carrying tiles: lush fertile fields. The water itself is drawn
// dynamically by the renderer (it needs per-tile neighbor connectivity to flow correctly
// across edges), so this art is "fertile farmland" that the river ribbon then overlays.
function svgNileValleyVariant(seed) {
  const id = uid();
  const mc = mudclothTriangles(PAL.kenteDark, 0.07, 13, 0);
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#D6E28A"/><stop offset="60%" stop-color="#B8D26A"/><stop offset="100%" stop-color="#93B850"/>
  </linearGradient>${mc.defs}`;
  const crops = seed === 0
    ? `<g fill="#4F8B4A"><path d="M62,78 L62,55 M62,55 Q56,60 54,55 M62,55 Q68,60 70,55 M62,63 Q56,67 54,63 M62,63 Q68,67 70,63"/></g>${papyrusCluster(22, 30, 0.9)}`
    : seed === 1
    ? `<g fill="#4F8B4A"><path d="M30,80 L30,58 M30,58 Q24,63 22,58 M30,58 Q36,63 38,58"/></g>${papyrusCluster(78, 26, 1)}${papyrusCluster(70, 40, 0.6)}`
    : `${papyrusCluster(50, 22, 1)}<g fill="#4F8B4A"><path d="M20,70 L20,50 M20,50 Q14,55 12,50 M20,50 Q26,55 28,50"/></g>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/><rect x="-10" y="-10" width="120" height="120" fill="url(#pat-${mc.id})"/>${crops}`);
}

function svgOasisVariant(seed) {
  const id = uid();
  const mc = mudclothTriangles(PAL.clayDark, 0.08, 15, 8);
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="${PAL.goldLight}"/><stop offset="100%" stop-color="${PAL.gold}"/>
  </linearGradient>${mc.defs}`;
  const layout = seed === 0
    ? `${duneCurves(PAL.goldDeep, PAL.gold, 4)}<ellipse cx="50" cy="72" rx="22" ry="10" fill="${PAL.waterShallow}"/>${palmSilhouette(36, 66, 0.9)}${palmSilhouette(62, 60, 0.75)}`
    : seed === 1
    ? `${duneCurves(PAL.goldDeep, PAL.gold, -6)}<ellipse cx="46" cy="60" rx="18" ry="9" fill="${PAL.waterShallow}"/>${palmSilhouette(46, 54, 1)}${palmSilhouette(66, 68, 0.7)}${palmSilhouette(26, 66, 0.6)}`
    : `${duneCurves(PAL.goldDeep, PAL.gold, 2)}<ellipse cx="58" cy="66" rx="20" ry="9" fill="${PAL.waterShallow}"/>${palmSilhouette(58, 58, 0.85)}${palmSilhouette(38, 72, 0.65)}`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/><rect x="-10" y="-10" width="120" height="120" fill="url(#pat-${mc.id})"/>${layout}`);
}

const VARIANT_GENERATORS = {
  ocean: [svgOceanA, svgOceanB, svgOceanC],
  coast: [() => svgCoastVariant(0), () => svgCoastVariant(1), () => svgCoastVariant(2)],
  sahara_desert: [() => svgSaharaVariant(-6, false), () => svgSaharaVariant(4, false), () => svgSaharaVariant(0, true)],
  sahel_grassland: [() => svgSahelVariant(0), () => svgSahelVariant(1), () => svgSahelVariant(2)],
  savanna: [() => svgSavannaVariant(0), () => svgSavannaVariant(1), () => svgSavannaVariant(2)],
  congo_rainforest: [() => svgRainforestVariant(0), () => svgRainforestVariant(1), () => svgRainforestVariant(2)],
  rift_highlands: [() => svgRiftHighlandsVariant(0), () => svgRiftHighlandsVariant(1), () => svgRiftHighlandsVariant(2)],
  volcanic_highlands: [() => svgVolcanicVariant(0), () => svgVolcanicVariant(1), () => svgVolcanicVariant(2)],
  baobab_forest: [() => svgBaobabForestVariant(0), () => svgBaobabForestVariant(1), () => svgBaobabForestVariant(2)],
  mangrove_coast: [() => svgMangroveVariant(0), () => svgMangroveVariant(1), () => svgMangroveVariant(2)],
  nile_valley: [() => svgNileValleyVariant(0), () => svgNileValleyVariant(1), () => svgNileValleyVariant(2)],
  oasis: [() => svgOasisVariant(0), () => svgOasisVariant(1), () => svgOasisVariant(2)],
};

export const BIOMES = {
  ocean: { id: 'ocean', name: 'Ocean', passable: false, naval: true, moveCost: 1, yields: { food: 1, fish: 2 }, color: PAL.waterDeep },
  coast: { id: 'coast', name: 'Coast', passable: false, naval: true, moveCost: 1, yields: { food: 2, fish: 3, salt: 1 }, color: PAL.waterShallow },
  sahara_desert: { id: 'sahara_desert', name: 'Sahara Desert', passable: true, moveCost: 2, yields: { food: 0, gold: 1, salt: 2 }, color: PAL.gold },
  sahel_grassland: { id: 'sahel_grassland', name: 'Sahel Grasslands', passable: true, moveCost: 1, yields: { food: 2, horses: 1 }, color: '#C9A857' },
  savanna: { id: 'savanna', name: 'Savanna', passable: true, moveCost: 1, yields: { food: 2, ivory: 1 }, color: '#CBAE55' },
  congo_rainforest: { id: 'congo_rainforest', name: 'Congo Rainforest', passable: true, moveCost: 2, yields: { food: 1, wood: 3 }, color: '#1F5D3C' },
  rift_highlands: { id: 'rift_highlands', name: 'Great Rift Highlands', passable: true, moveCost: 2, yields: { food: 1, stone: 2, iron: 1 }, color: '#8FA06B' },
  volcanic_highlands: { id: 'volcanic_highlands', name: 'Volcanic Highlands', passable: true, moveCost: 3, yields: { food: 0, stone: 2, gems: 1, copper: 1 }, color: '#453B36' },
  baobab_forest: { id: 'baobab_forest', name: 'Baobab Forest', passable: true, moveCost: 1, yields: { food: 1, wood: 2 }, color: '#C7A662' },
  mangrove_coast: { id: 'mangrove_coast', name: 'Mangrove Coast', passable: true, moveCost: 2, yields: { food: 2, fish: 2, wood: 1 }, color: '#3E6B4E' },
  nile_valley: { id: 'nile_valley', name: 'Nile Valley', passable: true, moveCost: 1, yields: { food: 4, gold: 1 }, color: '#CDBB6E' },
  oasis: { id: 'oasis', name: 'Oasis', passable: true, moveCost: 1, yields: { food: 3, gold: 2, spices: 1 }, color: PAL.gold },
};

const _svgCache = new Map();

/** Returns raw inline SVG markup string for a biome tile variant (0-2), cached. */
export function getBiomeSVG(biomeId, variant = 0) {
  const key = `${biomeId}:${variant}`;
  if (_svgCache.has(key)) return _svgCache.get(key);
  const generators = VARIANT_GENERATORS[biomeId] || VARIANT_GENERATORS.savanna;
  const gen = generators[variant % generators.length];
  const svg = gen();
  _svgCache.set(key, svg);
  return svg;
}

/** Returns an HTMLImageElement (decoded from inline SVG data-URI) ready for canvas drawImage, cached + preloaded. */
const _imgCache = new Map();
export function getBiomeImage(biomeId, variant = 0) {
  const key = `${biomeId}:${variant}`;
  if (_imgCache.has(key)) return _imgCache.get(key);
  const svg = getBiomeSVG(biomeId, variant);
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  _imgCache.set(key, img);
  return img;
}

export function preloadAllBiomeImages() {
  const promises = [];
  for (const id of Object.keys(BIOMES)) {
    for (let v = 0; v < 3; v++) {
      const img = getBiomeImage(id, v);
      if (!img.complete) {
        promises.push(new Promise((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); }));
      }
    }
  }
  return Promise.all(promises);
}

// --- fertile riverbank overlay (drawn atop any biome tile adjacent to a river) --------

function svgFertileOverlay(seed) {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stop-color="${PAL.fertileLight}" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="${PAL.fertile}" stop-opacity="0"/>
  </radialGradient>`;
  const sprouts = seed === 0
    ? `<g fill="${PAL.fertile}" opacity="0.75"><path d="M30,72 L30,60 M30,60 Q26,64 24,60 M30,60 Q34,64 36,60"/><path d="M68,66 L68,54 M68,54 Q64,58 62,54 M68,54 Q72,58 74,54"/></g>`
    : seed === 1
    ? `<g fill="${PAL.fertile}" opacity="0.75"><path d="M50,74 L50,58 M50,58 Q45,63 42,58 M50,58 Q55,63 58,58"/></g>`
    : `<g fill="${PAL.fertile}" opacity="0.75"><path d="M22,60 L22,48 M22,48 Q18,52 16,48 M22,48 Q26,52 28,48"/><path d="M74,74 L74,62 M74,62 Q70,66 68,62 M74,62 Q78,66 80,62"/></g>`;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>${sprouts}`, 'transparent');
}

const _fertileCache = new Map();
export function getFertileOverlayImage(variant = 0) {
  const key = variant % 3;
  if (_fertileCache.has(key)) return _fertileCache.get(key);
  const svg = svgFertileOverlay(key);
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  _fertileCache.set(key, img);
  return img;
}

export const PALETTE = PAL;
