// biomes.js — Premium isometric medium-poly terrain tokens
// Style: Handcrafted diorama pieces with soft studio lighting, flat-shaded facets,
// saturated colors, and clean geometric forms. No overhang beyond the hex.

const PAL = {
  // Savanna
  gold: '#D4A843',
  goldLight: '#F0D17A',
  goldDeep: '#B8882E',
  olive: '#7A9B5A',
  oliveLight: '#9BBF72',
  oliveDark: '#5A7A3E',

  // Jungle
  emerald: '#2D7A4A',
  emeraldLight: '#4CA86A',
  emeraldDark: '#1A5532',
  moss: '#5A8F4A',
  mossLight: '#7AB262',

  // Desert
  sandstone: '#D4C4A0',
  sandstoneLight: '#F0E4C8',
  sandstoneDark: '#B8A47C',
  clay: '#C47A4A',
  clayLight: '#E09E6A',
  burntOrange: '#C06A38',

  // Mountains
  granite: '#8A8A8A',
  graniteLight: '#B0B0B0',
  graniteDark: '#5E5E5E',
  stone: '#A09A8A',
  stoneLight: '#C4BEA8',

  // Water
  turquoise: '#3AA8B8',
  teal: '#2A7A8A',
  deepBlue: '#1A4A5A',
  waterLight: '#6AC8D8',

  // Volcanic
  basalt: '#3A3A3A',
  basaltLight: '#5A5A5A',
  basaltDark: '#222222',
  lava: '#E0642C',
  lavaLight: '#F08A4A',
  lavaCore: '#FFB347',

  // General
  shadow: 'rgba(20,14,8,0.35)',
  fertile: '#6AAA4A',
  fertileLight: '#8AC86A',
  bark: '#6A4A38',
  barkLight: '#8A6A52',
  sand: '#EDE0C0',
  snow: '#F8F4EC',
  ivory: '#F6EFDD',
};

// Hex boundary — radius 46, flat-top orientation
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

// Isometric transform: 30° angle, orthographic projection
function isoWrap(defs, body, strokeColor = 'rgba(20,14,8,0.20)') {
  const clipId = uid();
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="clip-${clipId}"><polygon points="${HEX_CLIP}"/></clipPath>
      ${defs}
    </defs>
    <!-- Shadow ring -->
    <circle cx="50" cy="50" r="27" fill="rgba(20,14,8,0.12)"/>
    <g clip-path="url(#clip-${clipId})" transform="skewX(-30) rotate(30) translate(25,-15)">
      ${body}
    </g>
    <polygon points="${hexPoints(49)}" fill="none" stroke="${strokeColor}" stroke-width="1.5"/>
    <!-- Soft edge glow -->
    <polygon points="${hexPoints(47)}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  </svg>`;
}

// Helper: creates a faceted cylinder (tree trunk, pillar)
function facetedCylinder(cx, cy, radius, height, color, segments = 8, yOffset = 0) {
  let top = '';
  let side = '';
  for (let i = 0; i < segments; i++) {
    const a1 = (Math.PI * 2 * i) / segments;
    const a2 = (Math.PI * 2 * (i + 1)) / segments;
    const x1 = cx + radius * Math.cos(a1);
    const y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    const op = 0.5 + 0.5 * Math.cos(a1);
    side += `<polygon points="${x1},${y1 + yOffset} ${x2},${y2 + yOffset} ${x2},${y2 + yOffset + height} ${x1},${y1 + yOffset + height}" fill="${color}" opacity="${0.6 + 0.4 * op}"/>`;
    top += `<polygon points="${cx},${cy + yOffset} ${x1},${y1 + yOffset} ${x2},${y2 + yOffset}" fill="${color}" opacity="${0.8 + 0.2 * op}"/>`;
  }
  return side + top;
}

// Helper: faceted sphere (foliage, rocks)
function facetedSphere(cx, cy, radius, color, segments = 12, layers = 4) {
  let polys = '';
  for (let l = 0; l < layers; l++) {
    const y1 = -radius + (radius * 2 * l) / layers;
    const y2 = -radius + (radius * 2 * (l + 1)) / layers;
    const r1 = Math.sqrt(Math.max(0, radius * radius - y1 * y1));
    const r2 = Math.sqrt(Math.max(0, radius * radius - y2 * y2));
    const segs = Math.max(4, Math.floor(segments * (r1 / radius + 0.2)));
    for (let i = 0; i < segs; i++) {
      const a1 = (Math.PI * 2 * i) / segs;
      const a2 = (Math.PI * 2 * (i + 1)) / segs;
      const x1 = cx + r1 * Math.cos(a1);
      const z1 = cy + r1 * Math.sin(a1);
      const x2 = cx + r1 * Math.cos(a2);
      const z2 = cy + r1 * Math.sin(a2);
      const x3 = cx + r2 * Math.cos(a2);
      const z3 = cy + r2 * Math.sin(a2);
      const x4 = cx + r2 * Math.cos(a1);
      const z4 = cy + r2 * Math.sin(a1);
      const light = 0.6 + 0.4 * Math.cos(a1) * (0.5 + 0.5 * (1 - l / layers));
      const op = Math.max(0.4, Math.min(0.95, light));
      const col = l % 2 === 0 ? color : color;
      polys += `<polygon points="${x1},${z1} ${x2},${z2} ${x3},${z3} ${x4},${z4}" fill="${col}" opacity="${op}"/>`;
    }
  }
  return polys;
}

// Helper: faceted cone (mountain peak, volcano)
function facetedCone(cx, cy, baseRadius, height, color, segments = 8) {
  let polys = '';
  for (let i = 0; i < segments; i++) {
    const a1 = (Math.PI * 2 * i) / segments;
    const a2 = (Math.PI * 2 * (i + 1)) / segments;
    const x1 = cx + baseRadius * Math.cos(a1);
    const y1 = cy + baseRadius * Math.sin(a1);
    const x2 = cx + baseRadius * Math.cos(a2);
    const y2 = cy + baseRadius * Math.sin(a2);
    const light = 0.5 + 0.5 * Math.cos(a1 + Math.PI / 4);
    polys += `<polygon points="${cx},${cy - height} ${x1},${y1} ${x2},${y2}" fill="${color}" opacity="${0.5 + 0.5 * light}"/>`;
    polys += `<polygon points="${cx},${cy} ${x1},${y1} ${x2},${y2}" fill="${color}" opacity="${0.3 + 0.4 * (1 - light)}"/>`;
  }
  return polys;
}

// === BIOME GENERATORS =========================================================

function oceanVariant(seed) {
  const defs = `<linearGradient id="o-${seed}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${PAL.turquoise}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="${PAL.deepBlue}" stop-opacity="0.95"/>
  </linearGradient>`;
  const rippleOffset = seed * 4;
  return isoWrap(defs,
    `<rect x="-20" y="-20" width="140" height="140" fill="url(#o-${seed})"/>
     <polygon points="${20 + rippleOffset},40 ${30 + rippleOffset},36 ${40 + rippleOffset},42 ${32 + rippleOffset},48" fill="${PAL.waterLight}" opacity="0.25"/>
     <polygon points="${60 + rippleOffset},56 ${72 + rippleOffset},50 ${82 + rippleOffset},60 ${68 + rippleOffset},66" fill="${PAL.waterLight}" opacity="0.2"/>
     <polygon points="${40 + rippleOffset},72 ${50 + rippleOffset},66 ${60 + rippleOffset},74 ${50 + rippleOffset},80" fill="${PAL.waterLight}" opacity="0.15"/>
     <!-- Subtle depth facets -->
     <polygon points="-10,30 30,20 70,40 30,50" fill="${PAL.deepBlue}" opacity="0.15"/>
     <polygon points="30,20 70,30 90,20 70,40" fill="${PAL.turquoise}" opacity="0.1"/>`
  );
}

function coastVariant(seed) {
  const defs = `<linearGradient id="c-${seed}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${PAL.turquoise}" stop-opacity="0.8"/>
    <stop offset="100%" stop-color="${PAL.teal}" stop-opacity="0.9"/>
  </linearGradient>`;
  const sandPos = seed === 0 ? '30,64 44,56 58,66 46,74' :
                  seed === 1 ? '50,56 64,48 78,58 64,66' :
                               '28,44 42,36 56,46 42,54';
  return isoWrap(defs,
    `<rect x="-20" y="-20" width="140" height="140" fill="url(#c-${seed})"/>
     <polygon points="${sandPos}" fill="${PAL.sand}" opacity="0.6"/>
     <polygon points="${sandPos.replace('64','62').replace('56','54')}" fill="${PAL.sandstoneLight}" opacity="0.4"/>
     <polygon points="40,26 50,20 60,28 50,34" fill="${PAL.waterLight}" opacity="0.2"/>
     <polygon points="62,50 74,44 84,54 72,60" fill="${PAL.waterLight}" opacity="0.15"/>`
  );
}

function saharaVariant(seed) {
  const shift = seed * 6;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.goldLight}"/>
     <!-- Dune facets -->
     <polygon points="${-10 + shift},52 ${20 + shift},38 ${50 + shift},54 ${30 + shift},68" fill="${PAL.gold}" opacity="0.7"/>
     <polygon points="${20 + shift},38 ${40 + shift},30 ${60 + shift},44 ${40 + shift},50" fill="${PAL.goldLight}" opacity="0.6"/>
     <polygon points="${50 + shift},54 ${70 + shift},42 ${90 + shift},56 ${70 + shift},66" fill="${PAL.goldDeep}" opacity="0.5"/>
     <polygon points="${30 + shift},68 ${50 + shift},58 ${70 + shift},72 ${50 + shift},82" fill="${PAL.gold}" opacity="0.4"/>
     <!-- Rock detail -->
     <polygon points="72,30 76,26 80,32 74,36" fill="${PAL.clay}" opacity="0.5"/>
     <polygon points="76,26 80,22 84,28 80,32" fill="${PAL.clayLight}" opacity="0.4"/>`
  );
}

function sahelVariant(seed) {
  const trees = seed === 0 ?
    `<g>${facetedCylinder(28, 52, 2, 16, PAL.bark, 6)}${facetedSphere(28, 40, 10, PAL.olive, 10, 3)}${facetedSphere(30, 44, 7, PAL.oliveLight, 8, 3)}</g>
     ${facetedCylinder(68, 38, 1.8, 14, PAL.bark, 6)}${facetedSphere(68, 28, 8, PAL.olive, 8, 3)}` :
    seed === 1 ?
    `<g>${facetedCylinder(48, 48, 2, 18, PAL.bark, 6)}${facetedSphere(48, 36, 11, PAL.olive, 10, 4)}${facetedSphere(50, 40, 8, PAL.oliveLight, 8, 3)}</g>` :
    `<g>${facetedCylinder(32, 56, 2, 14, PAL.bark, 6)}${facetedSphere(32, 46, 8, PAL.olive, 8, 3)}</g>
     ${facetedCylinder(62, 44, 1.8, 16, PAL.bark, 6)}${facetedSphere(62, 34, 9, PAL.olive, 8, 3)}`;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.goldLight}"/>
     <rect x="-20" y="-20" width="140" height="140" fill="${PAL.olive}" opacity="0.08"/>
     ${trees}`
  );
}

function savannaVariant(seed) {
  const baobab = `<g>${facetedCylinder(36, 54, 4, 18, PAL.bark, 8)}${facetedSphere(36, 44, 9, PAL.olive, 8, 3)}</g>`;
  const acacia = `<g>${facetedCylinder(64, 40, 2, 20, PAL.bark, 6)}${facetedSphere(64, 26, 12, PAL.oliveLight, 10, 4)}</g>`;
  const grass = `<polygon points="20,70 28,62 36,70 28,78" fill="${PAL.olive}" opacity="0.4"/>
                 <polygon points="60,68 68,60 76,68 68,76" fill="${PAL.oliveLight}" opacity="0.3"/>`;
  const layout = seed === 0 ? baobab + acacia + grass :
                 seed === 1 ? acacia + baobab :
                              baobab + grass;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.goldLight}"/>
     <rect x="-20" y="-20" width="140" height="140" fill="${PAL.olive}" opacity="0.06"/>
     ${layout}`
  );
}

function rainforestVariant(seed) {
  const canopy1 = facetedSphere(30, 44, 14, PAL.emerald, 10, 4) +
                  facetedSphere(34, 48, 10, PAL.emeraldLight, 8, 3);
  const canopy2 = facetedSphere(56, 38, 16, PAL.emeraldDark, 10, 4) +
                  facetedSphere(60, 42, 12, PAL.emerald, 8, 3);
  const canopy3 = facetedSphere(76, 52, 12, PAL.moss, 8, 3);
  const trunks = facetedCylinder(30, 52, 2, 20, PAL.bark, 6) +
                 facetedCylinder(56, 46, 2.5, 22, PAL.bark, 6) +
                 facetedCylinder(76, 58, 2, 16, PAL.bark, 6);
  const layout = seed === 0 ? trunks + canopy1 + canopy2 :
                 seed === 1 ? trunks + canopy2 + canopy3 :
                              trunks + canopy1 + canopy3;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.emeraldDark}"/>
     <rect x="-20" y="-20" width="140" height="140" fill="${PAL.moss}" opacity="0.1"/>
     ${layout}
     <!-- Undergrowth -->
     <polygon points="16,68 24,60 32,68 24,76" fill="${PAL.moss}" opacity="0.3"/>
     <polygon points="64,72 72,64 80,72 72,80" fill="${PAL.mossLight}" opacity="0.2"/>`
  );
}

function riftHighlandsVariant(seed) {
  const shift = seed * 4;
  const mountain1 = facetedCone(24 + shift, 58, 16, 28, PAL.granite, 8) +
                    facetedCone(28 + shift, 54, 10, 18, PAL.graniteLight, 6);
  const mountain2 = facetedCone(58 - shift, 50, 14, 32, PAL.graniteDark, 8) +
                    facetedCone(62 - shift, 46, 8, 20, PAL.granite, 6);
  const grass = `<polygon points="10,74 30,64 50,74 30,84" fill="${PAL.olive}" opacity="0.3"/>
                 <polygon points="50,74 70,64 90,74 70,84" fill="${PAL.oliveLight}" opacity="0.2"/>
                 <polygon points="30,84 50,74 70,84 50,94" fill="${PAL.oliveDark}" opacity="0.15"/>`;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.stoneLight}"/>
     ${mountain1}${mountain2}${grass}`
  );
}

function volcanicVariant(seed) {
  const shift = seed * 3;
  const volcano = facetedCone(50 + shift, 54, 18, 32, PAL.basalt, 8) +
                  facetedCone(54 + shift, 48, 8, 14, PAL.basaltLight, 6);
  const crater = facetedCone(50 + shift, 48, 6, 6, PAL.lava, 6) +
                 facetedCone(52 + shift, 46, 4, 4, PAL.lavaCore, 6);
  const lavaFlow = `<polygon points="${46 + shift},56 ${56 + shift},54 ${60 + shift},62 ${48 + shift},66" fill="${PAL.lava}" opacity="0.7"/>
                    <polygon points="${56 + shift},54 ${60 + shift},52 ${64 + shift},60 ${60 + shift},62" fill="${PAL.lavaLight}" opacity="0.5"/>`;
  const rock = `<polygon points="22,68 28,62 34,68 28,74" fill="${PAL.basaltDark}" opacity="0.5"/>
                <polygon points="70,64 76,58 82,64 76,70" fill="${PAL.basalt}" opacity="0.4"/>`;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.basaltDark}"/>
     <rect x="-20" y="-20" width="140" height="140" fill="${PAL.basalt}" opacity="0.3"/>
     ${volcano}${crater}${lavaFlow}${rock}`
  );
}

function baobabForestVariant(seed) {
  const baobab1 = `<g>${facetedCylinder(32, 56, 5, 20, PAL.bark, 8)}${facetedSphere(32, 44, 12, PAL.olive, 8, 4)}</g>`;
  const baobab2 = `<g>${facetedCylinder(60, 44, 4, 18, PAL.bark, 8)}${facetedSphere(60, 34, 10, PAL.oliveLight, 8, 3)}</g>`;
  const baobab3 = `<g>${facetedCylinder(48, 68, 3.5, 14, PAL.bark, 6)}${facetedSphere(48, 60, 8, PAL.olive, 6, 3)}</g>`;
  const grass = `<polygon points="18,74 28,66 38,74 28,82" fill="${PAL.oliveDark}" opacity="0.2"/>
                 <polygon points="58,72 68,64 78,72 68,80" fill="${PAL.olive}" opacity="0.15"/>`;
  const layout = seed === 0 ? baobab1 + baobab2 + grass :
                 seed === 1 ? baobab2 + baobab3 :
                              baobab1 + baobab3 + grass;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.goldLight}"/>
     <rect x="-20" y="-20" width="140" height="140" fill="${PAL.olive}" opacity="0.06"/>
     ${layout}`
  );
}

function mangroveVariant(seed) {
  const root1 = facetedCylinder(26, 64, 3, 16, PAL.bark, 6) +
                facetedCylinder(22, 70, 2, 14, PAL.bark, 6) +
                facetedCylinder(30, 70, 2, 14, PAL.bark, 6);
  const root2 = facetedCylinder(52, 58, 3.5, 18, PAL.bark, 6) +
                facetedCylinder(48, 64, 2.5, 16, PAL.bark, 6) +
                facetedCylinder(56, 64, 2.5, 16, PAL.bark, 6);
  const root3 = facetedCylinder(74, 64, 3, 14, PAL.bark, 6) +
                facetedCylinder(70, 70, 2, 12, PAL.bark, 6) +
                facetedCylinder(78, 70, 2, 12, PAL.bark, 6);
  const canopy1 = facetedSphere(26, 56, 10, PAL.emerald, 8, 3);
  const canopy2 = facetedSphere(52, 50, 12, PAL.emeraldDark, 8, 3) +
                  facetedSphere(56, 54, 8, PAL.emerald, 6, 3);
  const canopy3 = facetedSphere(74, 56, 9, PAL.moss, 8, 3);
  const water = `<rect x="-20" y="50" width="140" height="70" fill="${PAL.teal}" opacity="0.6"/>
                 <polygon points="20,44 40,38 60,46 40,52" fill="${PAL.turquoise}" opacity="0.15"/>
                 <polygon points="40,56 60,48 80,56 60,64" fill="${PAL.turquoise}" opacity="0.1"/>`;
  const layout = seed === 0 ? root1 + root2 + canopy1 + canopy2 + water :
                 seed === 1 ? root2 + root3 + canopy2 + canopy3 + water :
                              root1 + root3 + canopy1 + canopy3 + water;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.deepBlue}" opacity="0.3"/>
     ${layout}`
  );
}

function nileValleyVariant(seed) {
  const crops = `<polygon points="48,64 54,56 60,64 54,72" fill="${PAL.fertile}" opacity="0.6"/>
                 <polygon points="54,56 60,48 66,56 60,64" fill="${PAL.fertileLight}" opacity="0.5"/>
                 <polygon points="26,72 32,64 38,72 32,80" fill="${PAL.fertile}" opacity="0.4"/>
                 <polygon points="66,72 72,64 78,72 72,80" fill="${PAL.fertile}" opacity="0.4"/>`;
  const palm = `<g>${facetedCylinder(52, 52, 1.5, 14, PAL.bark, 6)}${facetedSphere(52, 42, 8, PAL.emerald, 6, 3)}</g>`;
  const water = `<polygon points="30,50 50,40 70,52 50,62" fill="${PAL.turquoise}" opacity="0.3"/>
                 <polygon points="50,40 70,44 80,36 70,52" fill="${PAL.waterLight}" opacity="0.15"/>`;
  const layout = seed === 0 ? crops + palm + water :
                 seed === 1 ? crops + water :
                              palm + water;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.goldLight}"/>
     <rect x="-20" y="-20" width="140" height="140" fill="${PAL.olive}" opacity="0.08"/>
     ${layout}`
  );
}

function oasisVariant(seed) {
  const water = `<polygon points="32,60 48,50 64,60 52,70 38,70" fill="${PAL.turquoise}" opacity="0.8"/>
                 <polygon points="48,50 58,44 68,52 58,58" fill="${PAL.waterLight}" opacity="0.5"/>`;
  const palm1 = `<g>${facetedCylinder(44, 52, 1.8, 16, PAL.bark, 6)}${facetedSphere(44, 40, 10, PAL.emerald, 8, 3)}</g>`;
  const palm2 = `<g>${facetedCylinder(62, 54, 1.5, 14, PAL.bark, 6)}${facetedSphere(62, 44, 8, PAL.emeraldLight, 6, 3)}</g>`;
  const dune = `<polygon points="10,52 30,40 50,54 30,66" fill="${PAL.goldDeep}" opacity="0.4"/>
                <polygon points="50,54 70,42 90,56 70,66" fill="${PAL.gold}" opacity="0.3"/>`;
  const layout = seed === 0 ? water + palm1 + palm2 + dune :
                 seed === 1 ? water + palm1 + dune :
                              water + palm2 + dune;
  return isoWrap('',
    `<rect x="-20" y="-20" width="140" height="140" fill="${PAL.goldLight}"/>
     ${layout}`
  );
}

// === EXPORT CONFIGURATION ====================================================

const VARIANT_GENERATORS = {
  ocean: [oceanVariant, oceanVariant, oceanVariant],
  coast: [coastVariant, coastVariant, coastVariant],
  sahara_desert: [saharaVariant, saharaVariant, saharaVariant],
  sahel_grassland: [sahelVariant, sahelVariant, sahelVariant],
  savanna: [savannaVariant, savannaVariant, savannaVariant],
  congo_rainforest: [rainforestVariant, rainforestVariant, rainforestVariant],
  rift_highlands: [riftHighlandsVariant, riftHighlandsVariant, riftHighlandsVariant],
  volcanic_highlands: [volcanicVariant, volcanicVariant, volcanicVariant],
  baobab_forest: [baobabForestVariant, baobabForestVariant, baobabForestVariant],
  mangrove_coast: [mangroveVariant, mangroveVariant, mangroveVariant],
  nile_valley: [nileValleyVariant, nileValleyVariant, nileValleyVariant],
  oasis: [oasisVariant, oasisVariant, oasisVariant],
};

export const BIOMES = {
  ocean: { id: 'ocean', name: 'Ocean', passable: false, naval: true, moveCost: 1, yields: { food: 1, fish: 2 }, color: PAL.deepBlue },
  coast: { id: 'coast', name: 'Coast', passable: false, naval: true, moveCost: 1, yields: { food: 2, fish: 3, salt: 1 }, color: PAL.teal },
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

export function getBiomeSVG(biomeId, variant = 0) {
  const key = `${biomeId}:${variant}`;
  if (_svgCache.has(key)) return _svgCache.get(key);
  const generators = VARIANT_GENERATORS[biomeId] || VARIANT_GENERATORS.savanna;
  const gen = generators[variant % generators.length];
  const svg = gen(variant);
  _svgCache.set(key, svg);
  return svg;
}

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

// === FERTILE OVERLAY =========================================================

function fertileOverlayVariant(seed) {
  const defs = `<radialGradient id="f-${seed}" cx="50%" cy="50%" r="60%">
    <stop offset="0%" stop-color="${PAL.fertileLight}" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="${PAL.fertile}" stop-opacity="0"/>
  </radialGradient>`;
  const sprouts = seed === 0 ?
    `<polygon points="32,64 38,56 44,64 38,72" fill="${PAL.fertile}" opacity="0.7"/>
     <polygon points="38,56 42,50 46,56 42,62" fill="${PAL.fertileLight}" opacity="0.5"/>
     <polygon points="62,68 68,60 74,68 68,76" fill="${PAL.fertile}" opacity="0.6"/>` :
    seed === 1 ?
    `<polygon points="48,68 54,60 60,68 54,76" fill="${PAL.fertile}" opacity="0.7"/>
     <polygon points="54,60 58,54 62,60 58,66" fill="${PAL.fertileLight}" opacity="0.5"/>` :
    `<polygon points="24,62 30,54 36,62 30,70" fill="${PAL.fertile}" opacity="0.6"/>
     <polygon points="68,70 74,62 80,70 74,78" fill="${PAL.fertile}" opacity="0.7"/>`;
  return isoWrap(defs,
    `<rect x="-20" y="-20" width="140" height="140" fill="url(#f-${seed})"/>${sprouts}`,
    'transparent'
  );
}

const _fertileCache = new Map();
export function getFertileOverlayImage(variant = 0) {
  const key = variant % 3;
  if (_fertileCache.has(key)) return _fertileCache.get(key);
  const svg = fertileOverlayVariant(key);
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  _fertileCache.set(key, img);
  return img;
}

export const PALETTE = PAL;
