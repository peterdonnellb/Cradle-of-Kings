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
  const id = uid();
  const dark = '#42362A';
  const light = '#8C7A62';
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <defs><linearGradient id="bt-${id}" x1="0" y1="0" x2="1" y2="0.15">
      <stop offset="0%" stop-color="${dark}"/><stop offset="42%" stop-color="${color}"/><stop offset="75%" stop-color="${light}"/><stop offset="100%" stop-color="${dark}"/>
    </linearGradient></defs>
    <g stroke="${dark}" stroke-width="1.3" fill="none" stroke-linecap="round">
      <path d="M0,-19 Q-7,-25 -13,-26"/><path d="M0,-19 Q7,-26 12,-25"/>
      <path d="M0,-19 Q-2,-27 -4,-33"/><path d="M0,-19 Q3,-27 5,-33"/><path d="M0,-19 Q0,-25 -1,-30"/>
    </g>
    <g fill="#5C6B3E" opacity="0.9" stroke="${dark}" stroke-width="0.4">
      <circle cx="-13" cy="-26" r="2.3"/><circle cx="12" cy="-25" r="2.1"/><circle cx="-4" cy="-33" r="1.9"/><circle cx="5" cy="-33" r="2"/><circle cx="-1" cy="-30" r="1.7"/>
    </g>
    <path d="M-6,10 Q-10,-1 -8,-10 Q-6,-17 0,-19 Q6,-17 8,-10 Q10,-1 6,10 Z" fill="url(#bt-${id})" stroke="${dark}" stroke-width="0.9"/>
    <path d="M-6,10 Q-10,-1 -8,-10 Q-6,-17 -1,-18.5" fill="none" stroke="${dark}" stroke-width="0.5" opacity="0.55"/>
    <path d="M2,-17 Q4,-9 3.5,0 Q3,5 5,10" fill="none" stroke="${dark}" stroke-width="0.5" opacity="0.4"/>
    ${twin ? `<path d="M6,4 Q9,-4 7,-11 Q6,-14.5 2,-16.5" fill="none" stroke="${dark}" stroke-width="0.8" opacity="0.5"/>` : ''}
  </g>`;
}

/** Acacia — the defining feature is a wide, flat-topped umbrella canopy (classic savanna
 *  silhouette), rendered with a lit top / shadowed underside for a sense of volume. */
function acaciaSilhouette(cx, cy, scale, color = '#4A6741') {
  const id = uid();
  const dark = '#2C3D26';
  const light = '#6E9159';
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <defs><linearGradient id="ac-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${light}"/><stop offset="100%" stop-color="${color}"/>
    </linearGradient></defs>
    <path d="M-1.5,-2 L-2.3,10 L2.3,10 L1.5,-2Z" fill="${PAL.bark}" stroke="${dark}" stroke-width="0.6"/>
    <path d="M-1.2,-2 Q-6,-5.5 -5,-8.5" stroke="${PAL.bark}" stroke-width="1.1" fill="none"/>
    <path d="M1.2,-2 Q6,-5.5 5,-9" stroke="${PAL.bark}" stroke-width="1.1" fill="none"/>
    <path d="M-14,-2 Q-15,-9 -7,-11 Q-3,-15.5 3,-14 Q8,-15.5 12,-11 Q16,-8.5 14,-3 Q7,-6 0,-5.5 Q-7,-6 -14,-2Z" fill="url(#ac-${id})" stroke="${dark}" stroke-width="0.8"/>
    <path d="M-14,-2 Q0,-8 14,-3 Q7,1 0,0.5 Q-7,1 -14,-2Z" fill="${dark}" opacity="0.5"/>
    <path d="M-14,-11 Q0,-17 14,-11" fill="none" stroke="${light}" stroke-width="0.8" opacity="0.55"/>
  </g>`;
}

/** Candelabra euphorbia — thick fleshy upright arms, distinct from acacia's flat canopy. */
function euphorbiaSilhouette(cx, cy, scale, color = '#3E6B4A') {
  const id = uid();
  const light = '#5C8F6B';
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <defs><linearGradient id="eu-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${light}"/>
    </linearGradient></defs>
    <path d="M-1.6,11 Q-2.2,-1 -1.4,-13 Q-1,-16 1,-16 Q1.8,-2 1.6,11Z" fill="url(#eu-${id})"/>
    <path d="M-1.3,-3 Q-7,-4 -7.5,-11 Q-7.6,-14 -5.6,-14 Q-5.2,-8 -0.6,-6Z" fill="url(#eu-${id})"/>
    <path d="M1.3,-5 Q7,-6 7.8,-13 Q8,-16 6,-16 Q5.4,-10 0.6,-8Z" fill="url(#eu-${id})"/>
    <path d="M-0.7,7 Q-5,6 -5.5,0 Q-5.6,-3 -3.8,-3 Q-3.4,2 0.2,3.6Z" fill="url(#eu-${id})"/>
  </g>`;
}

function palmSilhouette(cx, cy, scale, color = '#3E7A4A') {
  const id = uid();
  const light = '#5FA06B';
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <defs><linearGradient id="pf-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${light}"/>
    </linearGradient></defs>
    <path d="M 0.6 9 Q -1.5 -3 0.4 -10" stroke="${PAL.barkLight}" stroke-width="2" fill="none"/>
    <path d="M -0.4 3 Q -3 1 -3.6 -3" stroke="${PAL.bark}" stroke-width="0.8" fill="none" opacity="0.6"/>
    <g fill="url(#pf-${id})">
      <path d="M0,-10 Q -11,-15 -14,-6 Q -4,-9.5 0,-10Z"/>
      <path d="M0,-10 Q 11,-15 14,-6 Q 4,-9.5 0,-10Z"/>
      <path d="M0,-10 Q -9,-3 -13,5 Q -3,-4 0,-10Z"/>
      <path d="M0,-10 Q 9,-3 13,5 Q 3,-4 0,-10Z"/>
      <path d="M0,-10 Q -5,-1 -6,8 Q -1,-2 0,-10Z"/>
      <path d="M0,-10 Q 5,-1 6,8 Q 1,-2 0,-10Z"/>
      <path d="M0,-10 Q 0,-1 0,7 Q -1,-2 0,-10Z"/>
    </g>
  </g>`;
}

/** Papyrus reed cluster for riverbanks and the Nile Valley. */
function papyrusCluster(cx, cy, scale, color = '#4F8B4A') {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" stroke="${color}" fill="${color}" stroke-width="1">
    <path d="M0,10 L0,-10 M-3,10 L-3,-7 M3,10 L3,-7" fill="none"/>
    <circle cx="0" cy="-11" r="2.4"/><circle cx="-3" cy="-8" r="1.8"/><circle cx="3" cy="-8" r="1.8"/>
  </g>`;
}

/** Termite mound — small savanna landmark detail, warm ochre spire. */
function termiteMound(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <path d="M -4 8 Q -6 -4 0 -12 Q 6 -4 4 8 Z" fill="${PAL.clayDark}"/>
    <path d="M -4 8 Q -6 -4 0 -12" stroke="${PAL.bark}" stroke-width="0.6" fill="none" opacity="0.5"/>
  </g>`;
}

function duneCurves(color1 = PAL.goldDeep, color2 = PAL.gold, shift = 0) {
  return `<path d="M ${-10 + shift} 52 Q ${25 + shift} 36 ${60 + shift} 52 T ${130 + shift} 46 L 130 110 L -10 110 Z" fill="${color1}" opacity="0.55"/>
          <path d="M ${-10 - shift} 68 Q ${30 - shift} 55 ${60 - shift} 68 T ${130 - shift} 63 L 130 110 L -10 110 Z" fill="${color2}" opacity="0.4"/>
          <path d="M -10 82 Q 40 74 70 84 T 130 80 L 130 110 L -10 110 Z" fill="${color1}" opacity="0.25"/>`;
}

function waterRipples(cx, cy, w = 24, color = 'rgba(255,255,255,0.4)') {
  return `<g stroke="${color}" stroke-width="1.4" fill="none">
    <path d="M ${cx - w} ${cy} Q ${cx - w / 2} ${cy - 4} ${cx} ${cy} T ${cx + w} ${cy}"/>
    <path d="M ${cx - w + 4} ${cy + 8} Q ${cx - w / 2 + 4} ${cy + 4} ${cx + 4} ${cy + 8} T ${cx + w + 4} ${cy + 6}"/>
  </g>`;
}

function mountainRange(baseColor, midColor, snow = false, shift = 0) {
  const outline = '#241708';
  const peaks = [
    { lx: -8 + shift, x: 20 + shift, topY: 28, rx: 42 + shift, baseY: 82 },
    { lx: 42 + shift, x: 64 + shift, topY: 18, rx: 108 + shift, baseY: 82 },
  ];
  let out = '<g>';
  for (const p of peaks) {
    out += `<polygon points="${p.lx},${p.baseY} ${p.x},${p.topY} ${p.rx},${p.baseY}" fill="${baseColor}" stroke="${outline}" stroke-width="1.3"/>`;
    out += `<polygon points="${p.x},${p.topY} ${p.rx},${p.baseY} ${p.x},${p.baseY}" fill="${outline}" opacity="0.22"/>`;
    out += `<polygon points="${p.lx},${p.baseY} ${p.x},${p.topY} ${p.x},${p.baseY}" fill="#fff" opacity="0.1"/>`;
    out += `<path d="M${p.x - (p.x - p.lx) * 0.35},${p.baseY - (p.baseY - p.topY) * 0.32} L${p.x},${p.topY + (p.baseY - p.topY) * 0.14}" stroke="${outline}" stroke-width="0.6" opacity="0.3" fill="none"/>`;
  }
  out += `<polygon points="${6 + shift},82 ${28 + shift},44 ${42 + shift},56 ${58 + shift},82" fill="${midColor}" stroke="${outline}" stroke-width="1" opacity="0.85"/>`;
  if (snow) {
    out += `<polygon points="${16 + shift},40 ${20 + shift},28 ${25 + shift},39" fill="#fff" stroke="${outline}" stroke-width="0.8" opacity="0.92"/><polygon points="${58 + shift},24 ${64 + shift},18 ${70 + shift},30" fill="#fff" stroke="${outline}" stroke-width="0.8" opacity="0.92"/>`;
  }
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
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="72%" r="55%">
    <stop offset="0%" stop-color="${PAL.lavaCore}"/><stop offset="45%" stop-color="${PAL.lava}"/><stop offset="100%" stop-color="${PAL.stoneDark}"/>
  </radialGradient>`;
  const shift = seed === 0 ? 0 : seed === 1 ? 8 : -8;
  return wrap(defs, `<rect x="-10" y="-10" width="120" height="120" fill="#332C28"/>${mountainRange('#3B342F', '#4A423B', false, shift)}
    <polygon points="${45 + shift},55 ${60 + shift},18 ${75 + shift},55" fill="url(#g-${id})" stroke="#241708" stroke-width="1.2"/>
    <circle cx="${60 + shift}" cy="22" r="4" fill="${PAL.lavaCore}"/>
    <circle cx="${60 + shift}" cy="22" r="4" fill="none" stroke="#241708" stroke-width="0.8"/>
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
