// biomes.js — Biome data + inline SVG tile art generators
// Art direction: warm earth tones, mudcloth/kente-inspired geometric texture,
// hand-drawn silhouettes (baobabs, dunes, papyrus, stone koppies) instead of icons/emoji.

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

// --- shared decorative motifs -------------------------------------------------

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
  return `<g>
    <polygon points="-5,80 25,30 45,55 65,20 105,80" fill="${color}"/>
    <polygon points="10,80 30,45 45,58 60,80" fill="${PAL.stone}" opacity="0.7"/>
    ${snow ? '<polygon points="20,38 25,30 30,38" fill="#fff" opacity="0.85"/><polygon points="55,28 65,20 72,32" fill="#fff" opacity="0.85"/>' : ''}
  </g>`;
}

// --- biome SVG generators ------------------------------------------------------

const svgGenerators = {
  ocean(id) {
    const defs = `<radialGradient id="g-${id}" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="${PAL.waterShallow}"/>
      <stop offset="100%" stop-color="${PAL.waterDeep}"/>
    </radialGradient>`;
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>${waterRipples(35,40)}${waterRipples(65,68)}`);
  },
  coast(id) {
    return wrap(id, '', `<rect x="-10" y="-10" width="120" height="70" fill="${PAL.waterShallow}"/><rect x="-10" y="55" width="120" height="55" fill="${PAL.sand}"/>${waterRipples(50,35)}`);
  },
  sahara_desert(id) {
    const defs = mudclothTriangles(id, PAL.clayDark, 0.10);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="${PAL.gold}"/><rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>${duneCurves()}`);
  },
  sahel_grassland(id) {
    const defs = mudclothTriangles(id, PAL.bark, 0.10);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#C9A857"/><rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>${acaciaSilhouette(30,60,1)}${acaciaSilhouette(68,45,0.8)}`);
  },
  savanna(id) {
    const defs = mudclothTriangles(id, PAL.kenteDark, 0.08);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#CBAE55"/><rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>${acaciaSilhouette(38,52,1.15)}${baobabSilhouette(70,62,0.85)}`);
  },
  congo_rainforest(id) {
    const defs = kenteStripes(id, PAL.kenteDark, PAL.kente, 0.12);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#1F5D3C"/><rect x="-10" y="-10" width="120" height="120" fill="url(#ks-${id})"/>
      <circle cx="30" cy="42" r="15" fill="#2E7A4C"/><circle cx="55" cy="55" r="18" fill="#256B44"/><circle cx="72" cy="35" r="12" fill="#2E7A4C"/>`);
  },
  rift_highlands(id) {
    const defs = mudclothTriangles(id, PAL.stoneDark, 0.10);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#8FA06B"/><rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>${mountainRange('#6E7A55')}`);
  },
  volcanic_highlands(id) {
    const defs = `<radialGradient id="g-${id}" cx="50%" cy="70%" r="60%">
      <stop offset="0%" stop-color="${PAL.lava}"/><stop offset="100%" stop-color="${PAL.stoneDark}"/>
    </radialGradient>`;
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#453B36"/>${mountainRange('#3B342F')}
      <polygon points="45,55 60,20 75,55" fill="url(#g-${id})"/><circle cx="60" cy="24" r="4" fill="${PAL.lava}"/>`);
  },
  baobab_forest(id) {
    const defs = mudclothTriangles(id, PAL.bark, 0.09);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#C7A662"/><rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${baobabSilhouette(35,58,1.05)}${baobabSilhouette(66,40,0.75)}${baobabSilhouette(78,68,0.6)}`);
  },
  mangrove_coast(id) {
    return wrap(id, '', `<rect x="-10" y="-10" width="120" height="65" fill="${PAL.waterShallow}"/><rect x="-10" y="50" width="120" height="60" fill="#3E6B4E"/>
      ${waterRipples(50,32)}
      <g stroke="${PAL.bark}" stroke-width="2" fill="none">
        <path d="M25,70 L25,90 M20,70 L20,88 M30,70 L30,89"/>
        <path d="M65,65 L65,88 M60,65 L60,86 M70,65 L70,87"/>
      </g>
      <ellipse cx="25" cy="68" rx="10" ry="6" fill="#4C7E58"/><ellipse cx="65" cy="63" rx="11" ry="6" fill="#4C7E58"/>`);
  },
  nile_valley(id) {
    const defs = mudclothTriangles(id, PAL.kenteDark, 0.08);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="#CDBB6E"/><rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      <path d="M -10,10 Q 30,40 20,70 Q 10,95 30,110" stroke="${PAL.water}" stroke-width="16" fill="none" opacity="0.9"/>
      <path d="M -10,10 Q 30,40 20,70 Q 10,95 30,110" stroke="${PAL.waterShallow}" stroke-width="6" fill="none" opacity="0.9"/>
      <g fill="#4F8B4A"><path d="M60,75 L60,50 M60,50 Q54,55 52,50 M60,50 Q66,55 68,50 M60,58 Q54,62 52,58 M60,58 Q66,62 68,58"/></g>`);
  },
  oasis(id) {
    const defs = mudclothTriangles(id, PAL.clayDark, 0.10);
    return wrap(id, defs, `<rect x="-10" y="-10" width="120" height="120" fill="${PAL.gold}"/><rect x="-10" y="-10" width="120" height="120" fill="url(#mc-${id})"/>
      ${duneCurves(PAL.sandDark, PAL.gold)}
      <ellipse cx="50" cy="72" rx="22" ry="10" fill="${PAL.waterShallow}"/>
      ${palmSilhouette(36,66,0.9)}${palmSilhouette(62,60,0.75)}`);
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
