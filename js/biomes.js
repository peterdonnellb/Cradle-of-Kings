// biomes.js — Biome data + inline SVG tile art generators
// Art direction: warm earth tones, mudcloth/kente-inspired geometric texture,
// hand-drawn silhouettes (baobabs, dunes, papyrus, stone koppies) instead of icons/emoji.
// Updated with higher visual fidelity and game-theoretic clarity:
// - High move cost = visually complex/dense (rainforest, volcanic).
// - Low move cost = open, clear sightlines (savanna, grassland).
// - Resources signaled by integrated silhouettes (fish, elephant, camel, gems).

const PAL = {
  clay: '#B5502D',
  clayDark: '#8C3A1F',
  gold: '#D8A93A',
  goldLight: '#F1CE73',
  indigo: '#223A5E',
  indigoDeep: '#152941',
  bark: '#4A3427',
  barkLight: '#6B4B33',
  sand: '#EDE0C0',
  sandDark: '#D8C594',
  kente: '#2E6B4F',
  kenteDark: '#1F4B37',
  red: '#8C2F2F',
  water: '#2C7E8C',
  waterDeep: '#1B5661',
  waterShallow: '#4FA6AE',
  stone: '#8D8474',
  stoneDark: '#655E51',
  ivory: '#F6EFDD',
  lava: '#C6491F',
  // New additions for enhanced realism
  mud: '#7B6A50',
  canopy: '#2A5A3A',
  peak: '#4A4545',
  highlandGreen: '#7A905A',
  lavaGlow: '#F25C2B',
  cropGreen: '#6A9B4A',
  riverBlue: '#3A9BBF',
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
const HEX_CLIP = hexPoints(50); // slightly oversized so fill bleeds to hex edge before stroke

function wrap(id, defs, body, strokeColor = 'rgba(20,14,8,0.35)') {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="clip-${id}"><polygon points="${HEX_CLIP}"/></clipPath>
      ${defs}
    </defs>
    <g clip-path="url(#clip-${id})">${body}</g>
    <polygon points="${hexPoints(49)}" fill="none" stroke="${strokeColor}" stroke-width="1.4"/>
  </svg>`;
}

// --- shared decorative motifs & silhouettes ------------------------------------

function mudclothTriangles(id, color, opacity = 0.14) {
  return `<pattern id="mc-${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
    <polygon points="0,14 7,0 14,14" fill="${color}" opacity="${opacity}"/>
  </pattern>`;
}

function kenteStripes(id, colorA, colorB, opacity = 0.18) {
  return `<pattern id="ks-${id}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="10" height="5" fill="${colorA}" opacity="${opacity}"/>
    <rect y="5" width="10" height="5" fill="${colorB}" opacity="${opacity}"/>
  </pattern>`;
}

// Silhouettes: Hand-drawn, realistic, game-theoretically informative

function baobabSilhouette(cx, cy, scale, color = PAL.bark) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${color}">
    <ellipse cx="0" cy="-16" rx="12" ry="9"/>
    <ellipse cx="-9" cy="-20" rx="6" ry="5"/>
    <ellipse cx="9" cy="-19" rx="6.5" ry="5.5"/>
    <rect x="-3.2" y="-14" width="6.4" height="16" rx="2"/>
    <path d="M -3 2 Q -8 6 -10 10 M 3 2 Q 8 6 10 10 M 0 2 L 0 9" stroke="${color}" stroke-width="1.6" fill="none"/>
  </g>`;
}

function acaciaSilhouette(cx, cy, scale, color = '#3B5230') {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <rect x="-1.4" y="-2" width="2.8" height="10" fill="${PAL.bark}"/>
    <path d="M -14 -2 Q 0 -14 14 -2 Q 0 -6 -14 -2 Z" fill="${color}"/>
  </g>`;
}

function palmSilhouette(cx, cy, scale, color = '#3E7A4A') {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <path d="M 0 8 Q -1.5 -6 0 -10" stroke="${PAL.barkLight}" stroke-width="1.8" fill="none"/>
    <g fill="${color}">
      <path d="M0,-10 Q -10,-14 -13,-6 Q -4,-9 0,-10Z"/>
      <path d="M0,-10 Q 10,-14 13,-6 Q 4,-9 0,-10Z"/>
      <path d="M0,-10 Q -8,-4 -12,3 Q -3,-4 0,-10Z"/>
      <path d="M0,-10 Q 8,-4 12,3 Q 3,-4 0,-10Z"/>
      <path d="M0,-10 Q 0,-2 0,6 Q -1,-3 0,-10Z"/>
    </g>
  </g>`;
}

function elephantSilhouette(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.bark}" opacity="0.9">
    <path d="M-14,10 C-16,4 -12,-2 -6,-4 C-2,-8 4,-8 8,-4 C12,-2 16,2 16,8 C18,8 18,12 16,12 L12,12 L12,8 L-14,8 L-14,12 L-16,12 C-18,12 -16,10 -14,10 Z M-8,0 L-4,0 C-2,-3 2,-3 4,0 L8,0 M-6,12 L-6,18 L-4,18 L-4,12 M4,12 L4,18 L6,18 L6,12" stroke="${PAL.bark}" stroke-width="1.5" fill="none"/>
    <ellipse cx="-4" cy="-4" rx="3" ry="2"/>
  </g>`;
}

function camelCaravan(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.bark}" opacity="0.8">
    <path d="M-10,4 C-12,0 -10,-4 -6,-6 C-2,-8 4,-8 6,-6 C8,-4 8,0 6,4 C4,6 0,6 -2,4 L-2,8 L-6,8 L-6,4 Z M-4,-6 L-4,-10 L-2,-10 L-2,-6 M4,-6 L4,-10 L6,-10 L6,-6" stroke="${PAL.bark}" stroke-width="1.5" fill="none"/>
    <circle cx="-2" cy="-8" r="2"/>
    <circle cx="4" cy="-8" r="2"/>
    <path d="M-8,4 L-12,4 L-12,6 L-8,6 M6,4 L10,4 L10,6 L6,6" stroke="${PAL.bark}" stroke-width="1.5" fill="none"/>
    <rect x="-4" y="-12" width="2" height="4" fill="${PAL.clay}"/>
  </g>`;
}

function hutSilhouette(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.sandDark}" opacity="0.9">
    <path d="M-8,6 L-10,0 L0,-8 L10,0 L8,6 Z" fill="${PAL.clayDark}"/>
    <rect x="-6" y="6" width="12" height="4" fill="${PAL.barkLight}"/>
    <rect x="-6" y="6" width="4" height="4" fill="${PAL.bark}"/>
  </g>`;
}

function crocodileSilhouette(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.kenteDark}" opacity="0.8">
    <path d="M-12,4 C-10,0 -4,-2 0,0 C4,2 10,4 14,2 C16,2 16,4 14,6 C10,6 6,8 0,8 C-4,8 -10,6 -14,6 Z M-12,4 L-14,2 M14,2 L16,0" stroke="${PAL.kenteDark}" stroke-width="1" fill="none"/>
    <circle cx="-8" cy="2" r="1" fill="${PAL.sand}"/>
  </g>`;
}

function kopjeSilhouette(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.stoneDark}" opacity="0.9">
    <path d="M-10,8 C-8,0 -4,-6 0,-10 C4,-6 8,0 10,8 Z"/>
    <path d="M-6,4 C-4,-2 0,-4 4,-2" stroke="${PAL.stone}" stroke-width="1.5" fill="none"/>
  </g>`;
}

function cropsSilhouette(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.cropGreen}" opacity="0.9">
    <path d="M-4,6 L-4,-4 M0,6 L0,-6 M4,6 L4,-4"/>
    <path d="M-4,-4 Q-6,-6 -8,-4 M0,-6 Q-2,-8 -4,-6 M4,-4 Q2,-6 0,-4" stroke="${PAL.cropGreen}" stroke-width="1.5" fill="none"/>
    <rect x="-8" y="4" width="16" height="4" fill="${PAL.clayDark}" opacity="0.5"/>
  </g>`;
}

function canoeSilhouette(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.bark}" opacity="0.8">
    <path d="M-12,4 C-10,6 10,6 12,4 C10,2 -10,2 -12,4 Z"/>
    <path d="M-4,4 L-4,8 L4,8 L4,4" stroke="${PAL.bark}" stroke-width="1" fill="none"/>
  </g>`;
}

function fishSchool(cx, cy, scale) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})" fill="${PAL.waterShallow}" opacity="0.6">
    <path d="M-10,0 L-6,-4 L-6,4 Z M-6,-2 L-2,-6 L-2,6 L-6,2 Z M-2,-4 L2,-8 L2,8 L-2,4 Z"/>
  </g>`;
}

function duneCurves(color1 = PAL.sandDark, color2 = PAL.gold) {
  return `<path d="M -10 55 Q 25 40 60 55 T 130 50 L 130 110 L -10 110 Z" fill="${color1}" opacity="0.55"/>
          <path d="M -10 70 Q 30 58 60 70 T 130 66 L 130 110 L -10 110 Z" fill="${color2}" opacity="0.35"/>`;
}

function waterRipples(cx = 50, cy = 55) {
  return `<g stroke="rgba(255,255,255,0.35)" stroke-width="1.5" fill="none">
    <path d="M ${cx - 22} ${cy} Q ${cx - 11} ${cy - 5} ${cx} ${cy} T ${cx + 22} ${cy}"/>
    <path d="M ${cx - 18} ${cy + 10} Q ${cx - 8} ${cy + 5} ${cx + 2} ${cy + 10} T ${cx + 24} ${cy + 8}"/>
  </g>`;
}

function mountainRange(color = PAL.stoneDark, snow = false) {
  let peaks = `<polygon points="-5,80 25,30 45,55 65,20 105,80" fill="${color}"/>
              <polygon points="10,80 30,45 45,58 60,80" fill="${PAL.stone}" opacity="0.7"/>`;
  if (snow) {
    peaks += `<polygon points="20,38 25,30 30,38" fill="#fff" opacity="0.85"/>
              <polygon points="55,28 65,20 72,32" fill="#fff" opacity="0.85"/>`;
  }
  return `<g>${peaks}</g>`;
}

// --- biome SVG generators ------------------------------------------------------
// Enhanced with game-theoretic visual clarity: 
// High density = high move cost, open plains = low move cost.
// Resources visually hinted via silhouettes.

const svgGenerators = {
  ocean(id) {
    const defs = `<radialGradient id="g-${id}" cx="40%" cy="30%" r="80%">
      <stop offset="0%" stop-color="${PAL.waterShallow}"/>
      <stop offset="60%" stop-color="${PAL.water}"/>
      <stop offset="100%" stop-color="${PAL.waterDeep}"/>
    </radialGradient>`;
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>
      ${waterRipples(25,30)}${waterRipples(50,55)}${waterRipples(75,80)}
      ${fishSchool(30, 40, 0.8)}${canoeSilhouette(70, 75, 0.7)}`);
  },

  coast(id) {
    return wrap(id, '', `<rect x="-10" y="-10" width="120" height="65" fill="${PAL.waterShallow}"/>
      <rect x="-10" y="55" width="120" height="55" fill="${PAL.sand}"/>
      ${waterRipples(50,30)}
      <path d="M-10,55 Q 20,45 50,55 T 110,55" stroke="${PAL.sandDark}" stroke-width="2" fill="none"/>
      ${palmSilhouette(75, 75, 0.9)}`);
  },

  sahara_desert(id) {
    const defs = `<linearGradient id="dune-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${PAL.goldLight}"/>
        <stop offset="100%" stop-color="${PAL.clay}"/>
      </linearGradient>` + mudclothTriangles(id, PAL.clayDark, 0.15);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="${PAL.gold}"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${duneCurves(PAL.sandDark, PAL.clayDark)}
      ${camelCaravan(65, 65, 0.7)}`);
  },

  sahel_grassland(id) {
    const defs = mudclothTriangles(id, PAL.bark, 0.10);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#C9A857"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${acaciaSilhouette(25,60,1.2)}
      ${acaciaSilhouette(65,75,0.9)}
      ${hutSilhouette(70, 45, 0.7)}`);
  },

  savanna(id) {
    const defs = mudclothTriangles(id, PAL.kenteDark, 0.08);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#CBAE55"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${baobabSilhouette(30,55,1.1)}
      ${acaciaSilhouette(65,65,0.9)}
      ${elephantSilhouette(50, 80, 0.6)}`);
  },

  congo_rainforest(id) {
    const defs = kenteStripes(id, PAL.kenteDark, PAL.kente, 0.15);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#1F5D3C"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#ks-${id})"/>
      <circle cx="25" cy="35" r="18" fill="${PAL.canopy}"/>
      <circle cx="55" cy="50" r="22" fill="#256B44"/>
      <circle cx="75" cy="30" r="15" fill="${PAL.canopy}"/>
      <circle cx="40" cy="65" r="14" fill="#2E7A4C"/>
      <circle cx="65" cy="70" r="16" fill="${PAL.canopy}"/>
      <path d="M 20,80 Q 40,60 60,85" stroke="${PAL.riverBlue}" stroke-width="8" fill="none" opacity="0.7"/>
      ${crocodileSilhouette(45, 80, 0.8)}`);
  },

  rift_highlands(id) {
    const defs = mudclothTriangles(id, PAL.stoneDark, 0.12);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="${PAL.highlandGreen}"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${mountainRange('#6E7A55')}
      ${kopjeSilhouette(70, 65, 0.8)}`);
  },

  volcanic_highlands(id) {
    const defs = `<radialGradient id="g-${id}" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stop-color="${PAL.lavaGlow}"/>
        <stop offset="40%" stop-color="${PAL.lava}"/>
        <stop offset="100%" stop-color="${PAL.stoneDark}"/>
      </radialGradient>`;
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="${PAL.peak}"/>
      ${mountainRange('#3B342F', true)}
      <polygon points="45,55 60,15 75,55" fill="url(#g-${id})"/>
      <circle cx="60" cy="18" r="5" fill="${PAL.lavaGlow}"/>
      <polygon points="50,25 55,35 65,35 70,25 65,30 55,30" fill="${PAL.goldLight}" opacity="0.8"/>`);
  },

  baobab_forest(id) {
    const defs = mudclothTriangles(id, PAL.bark, 0.12);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#C7A662"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${baobabSilhouette(25,55,1.0)}
      ${baobabSilhouette(50,65,0.8)}
      ${baobabSilhouette(75,45,1.1)}`);
  },

  mangrove_coast(id) {
    return wrap(id, '', `<rect x="-10" y="-10" width="120" height="45" fill="${PAL.waterShallow}"/>
      <rect x="-10" y="35" width="120" height="75" fill="#3E6B4E"/>
      <path d="M-10,35 Q 20,25 50,35 T 110,35" stroke="${PAL.water}" stroke-width="2" fill="none"/>
      ${waterRipples(50, 25)}
      <g stroke="${PAL.bark}" stroke-width="3" fill="none">
        <path d="M20,45 Q25,65 30,85 M30,45 Q35,65 40,85"/>
        <path d="M60,45 Q65,65 70,85 M70,45 Q75,65 80,85"/>
        <path d="M40,40 Q45,55 50,70"/>
      </g>
      <ellipse cx="25" cy="42" rx="12" ry="6" fill="#4C7E58"/>
      <ellipse cx="65" cy="38" rx="14" ry="7" fill="#4C7E58"/>
      ${fishSchool(80, 70, 0.6)}`);
  },

  nile_valley(id) {
    const defs = mudclothTriangles(id, PAL.kenteDark, 0.08);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#CDBB6E"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      <path d="M -10,10 Q 30,40 20,70 Q 10,95 30,110" stroke="${PAL.riverBlue}" stroke-width="18" fill="none" opacity="0.9"/>
      <path d="M -10,10 Q 30,40 20,70 Q 10,95 30,110" stroke="${PAL.waterShallow}" stroke-width="6" fill="none" opacity="0.9"/>
      ${cropsSilhouette(60, 75, 0.9)}
      ${cropsSilhouette(80, 60, 0.7)}`);
  },

  oasis(id) {
    const defs = mudclothTriangles(id, PAL.clayDark, 0.10);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="${PAL.gold}"/>
      <rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${duneCurves(PAL.sandDark, PAL.gold)}
      <ellipse cx="50" cy="72" rx="22" ry="10" fill="${PAL.riverBlue}"/>
      <ellipse cx="50" cy="72" rx="18" ry="7" fill="${PAL.waterShallow}"/>
      ${palmSilhouette(35,65,1.0)}
      ${palmSilhouette(65,60,0.8)}`);
  },
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

/** Returns raw inline SVG markup string for a biome tile (cached). */
export function getBiomeSVG(biomeId) {
  if (_svgCache.has(biomeId)) return _svgCache.get(biomeId);
  const gen = svgGenerators[biomeId] || svgGenerators.savanna;
  const svg = gen(biomeId);
  _svgCache.set(biomeId, svg);
  return svg;
}

/** Returns an HTMLImageElement (decoded from inline SVG data-URI) ready for canvas drawImage, cached + preloaded. */
const _imgCache = new Map();
export function getBiomeImage(biomeId) {
  if (_imgCache.has(biomeId)) return _imgCache.get(biomeId);
  const svg = getBiomeSVG(biomeId);
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  _imgCache.set(biomeId, img);
  return img;
}

export function preloadAllBiomeImages() {
  return Promise.all(Object.keys(BIOMES).map(id => new Promise((resolve) => {
    const img = getBiomeImage(id);
    if (img.complete) resolve();
    else { img.onload = () => resolve(); img.onerror = () => resolve(); }
  })));
}

export const PALETTE = PAL;
