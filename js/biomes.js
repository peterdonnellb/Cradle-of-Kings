// biomes.js — Biome data + inline SVG tile art generators (medium‑poly 3D style)

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

// --- Medium‑poly 3D helpers -------------------------------------------------

/** Adds a light source from top‑left: returns fill‑opacity based on angle */
function faceOpacity(angle, base = 0.8) {
  // angle in degrees; 0 = facing light, 180 = dark
  const norm = (angle % 360 + 360) % 360;
  const light = Math.cos(norm * Math.PI / 180) * 0.5 + 0.5;
  return (0.3 + 0.7 * light) * base;
}

// --- Biome SVG generators (3 hand‑authored polygon variants each) -----------

function svgOceanVariant(seed) {
  const id = uid();
  const shades = [PAL.waterDeep, PAL.water, PAL.waterShallow];
  // Random triangular mesh: 12 triangles covering the hex
  const tris = [
    [[10,50],[30,20],[50,60]], [[50,60],[30,20],[70,30]],
    [[70,30],[50,60],[90,40]], [[10,50],[50,60],[20,80]],
    [[20,80],[50,60],[70,70]], [[70,70],[50,60],[90,40]],
    [[30,20],[10,50],[20,10]], [[30,20],[70,30],[50,10]],
    [[20,80],[10,90],[50,90]], [[70,70],[50,90],[90,80]],
    [[50,90],[20,80],[70,70]], [[90,40],[70,70],[90,80]],
  ];
  // Shift triangles based on seed to create variation
  const shift = seed * 8;
  const points = tris.map(t => t.map(([x,y]) => [x + (seed%2?shift:-shift), y + (seed%3?shift/2:0)]));
  let body = '<g>';
  points.forEach((tri, i) => {
    const poly = tri.map(p => p.join(',')).join(' ');
    const shade = shades[i % shades.length];
    const op = faceOpacity(i * 30 + seed * 20, 0.85);
    body += `<polygon points="${poly}" fill="${shade}" opacity="${op}" stroke="${PAL.waterDeep}" stroke-width="0.6"/>`;
  });
  // Add ripples as low‑polys
  body += `<polygon points="30,30 40,25 50,32 42,38" fill="${PAL.waterFoam}" opacity="0.3"/>`;
  body += `<polygon points="60,60 72,55 80,64 68,70" fill="${PAL.waterFoam}" opacity="0.25"/>`;
  body += `</g>`;
  return wrap('', body);
}
function svgOceanA() { return svgOceanVariant(0); }
function svgOceanB() { return svgOceanVariant(1); }
function svgOceanC() { return svgOceanVariant(2); }

function svgCoastVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${PAL.waterShallow}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#9FE0D2" stop-opacity="0.7"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Sandbar polygons (low‑poly islands)
  const sandPolys = seed === 0
    ? `<polygon points="30,60 40,55 52,62 44,70 32,68" fill="${PAL.sand}" opacity="0.5"/>
       <polygon points="70,40 78,35 86,42 80,48 72,46" fill="${PAL.sand}" opacity="0.4"/>`
    : seed === 1
    ? `<polygon points="50,50 60,44 70,52 62,60 52,58" fill="${PAL.sand}" opacity="0.5"/>
       <polygon points="20,30 28,26 34,32 26,36" fill="${PAL.sand}" opacity="0.4"/>`
    : `<polygon points="28,40 38,34 48,42 40,50 30,48" fill="${PAL.sand}" opacity="0.5"/>
       <polygon points="68,68 76,62 84,70 74,76" fill="${PAL.sand}" opacity="0.4"/>`;
  const ripples = `<polygon points="40,24 48,18 56,24 50,30" fill="${PAL.waterFoam}" opacity="0.3"/>
                   <polygon points="64,48 72,42 80,50 72,56" fill="${PAL.waterFoam}" opacity="0.25"/>
                   <polygon points="44,74 52,68 60,76 52,82" fill="${PAL.waterFoam}" opacity="0.2"/>`;
  return wrap(defs, base + sandPolys + ripples);
}
function svgCoastA() { return svgCoastVariant(0); }
function svgCoastB() { return svgCoastVariant(1); }
function svgCoastC() { return svgCoastVariant(2); }

function svgSaharaVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="${PAL.goldLight}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="${PAL.gold}" stop-opacity="0.7"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Dune polygons
  const dunes = seed === 0
    ? `<polygon points="10,50 30,34 50,50 40,64 20,62" fill="${PAL.goldDeep}" opacity="0.5"/>
       <polygon points="50,50 70,38 90,50 80,60 60,58" fill="${PAL.gold}" opacity="0.6"/>
       <polygon points="20,70 40,60 60,72 50,80 30,78" fill="${PAL.goldDeep}" opacity="0.4"/>`
    : seed === 1
    ? `<polygon points="5,55 25,40 45,55 35,68 15,66" fill="${PAL.goldDeep}" opacity="0.5"/>
       <polygon points="45,55 65,42 85,55 75,65 55,63" fill="${PAL.gold}" opacity="0.6"/>
       <polygon points="30,74 50,64 70,76 60,84 40,82" fill="${PAL.goldDeep}" opacity="0.4"/>`
    : `<polygon points="15,48 35,32 55,48 45,60 25,58" fill="${PAL.goldDeep}" opacity="0.5"/>
       <polygon points="55,48 75,36 95,48 85,60 65,58" fill="${PAL.gold}" opacity="0.6"/>
       <polygon points="10,72 30,62 50,74 40,82 20,80" fill="${PAL.goldDeep}" opacity="0.4"/>`;
  // Rock art dots as small polygons
  const dots = `<polygon points="74,28 78,24 82,28 78,32" fill="${PAL.clayDark}" opacity="0.6"/>
                <polygon points="78,32 82,30 84,34 80,36" fill="${PAL.clayDark}" opacity="0.4"/>`;
  return wrap(defs, base + dunes + dots);
}
function svgSaharaA() { return svgSaharaVariant(0); }
function svgSaharaB() { return svgSaharaVariant(1); }
function svgSaharaC() { return svgSaharaVariant(2); }

function svgSahelVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D9B968" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#C29A4C" stop-opacity="0.8"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Low‑poly acacia trees and termite mound
  const tree1 = `<polygon points="30,60 34,48 38,60" fill="${PAL.bark}" opacity="0.9"/>
                 <polygon points="28,48 34,38 40,48 34,42" fill="#4A6741" opacity="0.8"/>
                 <polygon points="34,38 40,30 46,38 40,34" fill="#6E9159" opacity="0.7"/>`;
  const tree2 = `<polygon points="68,44 72,32 76,44" fill="${PAL.bark}" opacity="0.9"/>
                 <polygon points="66,32 72,22 78,32 72,28" fill="#4A6741" opacity="0.8"/>`;
  const mound = `<polygon points="50,70 54,62 58,70" fill="${PAL.clayDark}" opacity="0.8"/>`;
  const layout = seed === 0 ? tree1 + tree2 + mound : seed === 1 ? tree2 + mound : tree1 + mound;
  return wrap(defs, base + layout);
}
function svgSahelA() { return svgSahelVariant(0); }
function svgSahelB() { return svgSahelVariant(1); }
function svgSahelC() { return svgSahelVariant(2); }

function svgSavannaVariant(seed) {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="30%" r="90%">
    <stop offset="0%" stop-color="#DFC067" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#C7A24E" stop-opacity="0.8"/>
  </radialGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Acacia and baobab as faceted polygons
  const acacia = `<polygon points="36,44 42,32 48,44" fill="${PAL.bark}" opacity="0.9"/>
                  <polygon points="32,32 42,22 52,32 42,28" fill="#4A6741" opacity="0.8"/>
                  <polygon points="42,22 50,14 58,22 50,18" fill="#6E9159" opacity="0.7"/>`;
  const baobab = `<polygon points="70,60 74,50 78,60" fill="${PAL.bark}" opacity="0.9"/>
                  <polygon points="66,50 74,40 82,50 74,44" fill="#5C6B3E" opacity="0.8"/>
                  <polygon points="74,40 80,34 86,40 80,36" fill="#5C6B3E" opacity="0.7"/>`;
  const mound = `<polygon points="56,74 60,66 64,74" fill="${PAL.clayDark}" opacity="0.8"/>`;
  const layout = seed === 0 ? acacia + baobab + mound : seed === 1 ? baobab + acacia : acacia + mound;
  return wrap(defs, base + layout);
}
function svgSavannaA() { return svgSavannaVariant(0); }
function svgSavannaB() { return svgSavannaVariant(1); }
function svgSavannaC() { return svgSavannaVariant(2); }

function svgRainforestVariant(seed) {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="20%" r="100%">
    <stop offset="0%" stop-color="#2A6B45" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#173D28" stop-opacity="0.85"/>
  </radialGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Canopy as overlapping polygons
  const canopy1 = `<polygon points="20,40 36,24 52,40 44,52 28,52" fill="#2E7A4C" opacity="0.8"/>
                   <polygon points="36,24 50,12 64,24 56,32 40,32" fill="#245F3C" opacity="0.7"/>
                   <polygon points="50,12 66,6 78,18 68,28 54,26" fill="#338352" opacity="0.6"/>`;
  const canopy2 = `<polygon points="48,48 64,32 80,48 72,60 56,60" fill="#2E7A4C" opacity="0.8"/>
                   <polygon points="64,32 80,20 94,34 84,44 68,42" fill="#245F3C" opacity="0.7"/>`;
  const layout = seed === 0 ? canopy1 : seed === 1 ? canopy2 : canopy1 + canopy2;
  return wrap(defs, base + layout);
}
function svgRainforestA() { return svgRainforestVariant(0); }
function svgRainforestB() { return svgRainforestVariant(1); }
function svgRainforestC() { return svgRainforestVariant(2); }

function svgRiftHighlandsVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#B7C79A" stop-opacity="0.9"/>
    <stop offset="55%" stop-color="#8A9C72" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#6C7C58" stop-opacity="0.8"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Mountains as faceted peaks
  const m1 = `<polygon points="10,78 28,38 46,78" fill="#5F6E4B" opacity="0.9"/>
              <polygon points="28,38 36,26 44,38" fill="#7C8C63" opacity="0.8"/>
              <polygon points="46,78 28,38 38,56" fill="#3B4A32" opacity="0.6"/>`;
  const m2 = `<polygon points="54,78 72,34 90,78" fill="#5F6E4B" opacity="0.9"/>
              <polygon points="72,34 80,22 88,34" fill="#7C8C63" opacity="0.8"/>`;
  // Terraces (Ndebele‑style bands) as polygon strips
  const terraces = `<polygon points="10,84 50,84 44,90 10,90" fill="${PAL.red}" opacity="0.8"/>
                   <polygon points="50,84 90,84 84,90 44,90" fill="${PAL.gold}" opacity="0.8"/>
                   <polygon points="10,90 44,90 38,96 10,96" fill="${PAL.indigo}" opacity="0.8"/>
                   <polygon points="44,90 84,90 78,96 38,96" fill="${PAL.red}" opacity="0.8"/>`;
  const layout = seed === 2 ? m1 + m2 + terraces : m1 + m2;
  return wrap(defs, base + layout);
}
function svgRiftHighlandsA() { return svgRiftHighlandsVariant(0); }
function svgRiftHighlandsB() { return svgRiftHighlandsVariant(1); }
function svgRiftHighlandsC() { return svgRiftHighlandsVariant(2); }

function svgVolcanicVariant(seed) {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="72%" r="55%">
    <stop offset="0%" stop-color="${PAL.lavaCore}" stop-opacity="0.9"/>
    <stop offset="45%" stop-color="${PAL.lava}" stop-opacity="0.8"/>
    <stop offset="100%" stop-color="${PAL.stoneDark}" stop-opacity="0.7"/>
  </radialGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="#332C28"/>`;
  const shift = seed === 0 ? 0 : seed === 1 ? 8 : -8;
  const m1 = `<polygon points="${8+shift},78 ${28+shift},38 ${48+shift},78" fill="#3B342F" opacity="0.9"/>
              <polygon points="${28+shift},38 ${36+shift},26 ${44+shift},38" fill="#4A423B" opacity="0.8"/>`;
  const volcano = `<polygon points="${40+shift},56 ${60+shift},18 ${80+shift},56" fill="url(#g-${id})" stroke="#241708" stroke-width="1.2"/>`;
  const glow = `<polygon points="${58+shift},50 ${62+shift},42 ${66+shift},50" fill="${PAL.lavaCore}" opacity="0.9"/>`;
  const lavaFlow = `<polygon points="${56+shift},52 ${60+shift},48 ${64+shift},52 ${58+shift},58" fill="${PAL.ember}" opacity="0.7"/>`;
  return wrap(defs, base + m1 + volcano + glow + lavaFlow);
}
function svgVolcanicA() { return svgVolcanicVariant(0); }
function svgVolcanicB() { return svgVolcanicVariant(1); }
function svgVolcanicC() { return svgVolcanicVariant(2); }

function svgBaobabForestVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D2B168" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#BC9752" stop-opacity="0.85"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Baobab trees as faceted polygons
  const baobab1 = `<polygon points="30,56 36,40 42,56" fill="${PAL.bark}" opacity="0.9"/>
                   <polygon points="26,40 36,30 46,40 36,36" fill="#5C6B3E" opacity="0.8"/>
                   <polygon points="36,30 44,22 52,30 44,26" fill="#5C6B3E" opacity="0.7"/>`;
  const baobab2 = `<polygon points="64,44 70,30 76,44" fill="${PAL.bark}" opacity="0.9"/>
                   <polygon points="60,30 70,20 80,30 70,26" fill="#5C6B3E" opacity="0.8"/>`;
  const baobab3 = `<polygon points="48,66 54,52 60,66" fill="${PAL.bark}" opacity="0.9"/>
                   <polygon points="44,52 54,42 64,52 54,48" fill="#5C6B3E" opacity="0.8"/>`;
  const layout = seed === 0 ? baobab1 + baobab2 : seed === 1 ? baobab2 + baobab3 : baobab1 + baobab3;
  return wrap(defs, base + layout);
}
function svgBaobabForestA() { return svgBaobabForestVariant(0); }
function svgBaobabForestB() { return svgBaobabForestVariant(1); }
function svgBaobabForestC() { return svgBaobabForestVariant(2); }

function svgMangroveVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${PAL.waterShallow}" stop-opacity="0.9"/>
    <stop offset="45%" stop-color="#345C40" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#22432D" stop-opacity="0.8"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="58" fill="${PAL.waterShallow}"/>
                <rect x="-10" y="48" width="120" height="62" fill="url(#g-${id})"/>`;
  // Root polygons
  const roots1 = `<polygon points="22,58 26,50 30,58" fill="${PAL.bark}" opacity="0.9"/>
                  <polygon points="20,70 24,62 28,70" fill="${PAL.bark}" opacity="0.8"/>
                  <polygon points="24,62 28,54 32,62" fill="${PAL.bark}" opacity="0.7"/>`;
  const roots2 = `<polygon points="52,62 56,54 60,62" fill="${PAL.bark}" opacity="0.9"/>
                  <polygon points="50,74 54,66 58,74" fill="${PAL.bark}" opacity="0.8"/>`;
  const roots3 = `<polygon points="74,56 78,48 82,56" fill="${PAL.bark}" opacity="0.9"/>
                  <polygon points="72,68 76,60 80,68" fill="${PAL.bark}" opacity="0.8"/>`;
  // Canopy polygons
  const canopy = `<polygon points="18,52 26,44 34,52 26,48" fill="#5A9268" opacity="0.8"/>
                  <polygon points="48,56 56,48 64,56 56,52" fill="#5A9268" opacity="0.8"/>
                  <polygon points="70,50 78,42 86,50 78,46" fill="#5A9268" opacity="0.8"/>`;
  const layout = seed === 0 ? roots1 + roots2 + canopy : seed === 1 ? roots2 + roots3 + canopy : roots1 + roots3 + canopy;
  return wrap(defs, base + layout);
}
function svgMangroveA() { return svgMangroveVariant(0); }
function svgMangroveB() { return svgMangroveVariant(1); }
function svgMangroveC() { return svgMangroveVariant(2); }

function svgNileValleyVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#D6E28A" stop-opacity="0.9"/>
    <stop offset="60%" stop-color="#B8D26A" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#93B850" stop-opacity="0.8"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Fertile crops as small polygons
  const crops1 = `<polygon points="60,76 64,68 68,76" fill="#4F8B4A" opacity="0.9"/>
                  <polygon points="64,68 68,60 72,68" fill="#4F8B4A" opacity="0.8"/>`;
  const crops2 = `<polygon points="28,78 32,70 36,78" fill="#4F8B4A" opacity="0.9"/>
                  <polygon points="32,70 36,62 40,70" fill="#4F8B4A" opacity="0.8"/>`;
  const papyrus = `<polygon points="20,28 24,20 28,28" fill="#4F8B4A" opacity="0.9"/>
                   <polygon points="24,20 28,14 32,20" fill="#4F8B4A" opacity="0.8"/>`;
  const layout = seed === 0 ? crops1 + papyrus : seed === 1 ? crops2 + papyrus : crops1 + crops2;
  return wrap(defs, base + layout);
}
function svgNileValleyA() { return svgNileValleyVariant(0); }
function svgNileValleyB() { return svgNileValleyVariant(1); }
function svgNileValleyC() { return svgNileValleyVariant(2); }

function svgOasisVariant(seed) {
  const id = uid();
  const defs = `<linearGradient id="g-${id}" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="${PAL.goldLight}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="${PAL.gold}" stop-opacity="0.8"/>
  </linearGradient>`;
  const base = `<rect x="-10" y="-10" width="120" height="120" fill="url(#g-${id})"/>`;
  // Dune and water polygons
  const dune = `<polygon points="10,50 30,36 50,50 40,60 20,58" fill="${PAL.goldDeep}" opacity="0.5"/>
                <polygon points="50,50 70,38 90,50 80,60 60,58" fill="${PAL.gold}" opacity="0.6"/>`;
  const water = `<polygon points="36,60 50,52 64,60 56,70 44,70" fill="${PAL.waterShallow}" opacity="0.9"/>
                 <polygon points="50,52 58,46 66,52 58,56" fill="${PAL.water}" opacity="0.8"/>`;
  // Palm as faceted polygons
  const palm = `<polygon points="48,56 52,48 56,56" fill="${PAL.bark}" opacity="0.9"/>
                <polygon points="44,48 52,38 60,48 52,44" fill="#3E7A4A" opacity="0.8"/>
                <polygon points="52,38 58,32 64,38 58,34" fill="#5FA06B" opacity="0.7"/>`;
  const layout = seed === 0 ? dune + water + palm : seed === 1 ? dune + water + palm : dune + water;
  return wrap(defs, base + layout);
}
function svgOasisA() { return svgOasisVariant(0); }
function svgOasisB() { return svgOasisVariant(1); }
function svgOasisC() { return svgOasisVariant(2); }

const VARIANT_GENERATORS = {
  ocean: [svgOceanA, svgOceanB, svgOceanC],
  coast: [svgCoastA, svgCoastB, svgCoastC],
  sahara_desert: [svgSaharaA, svgSaharaB, svgSaharaC],
  sahel_grassland: [svgSahelA, svgSahelB, svgSahelC],
  savanna: [svgSavannaA, svgSavannaB, svgSavannaC],
  congo_rainforest: [svgRainforestA, svgRainforestB, svgRainforestC],
  rift_highlands: [svgRiftHighlandsA, svgRiftHighlandsB, svgRiftHighlandsC],
  volcanic_highlands: [svgVolcanicA, svgVolcanicB, svgVolcanicC],
  baobab_forest: [svgBaobabForestA, svgBaobabForestB, svgBaobabForestC],
  mangrove_coast: [svgMangroveA, svgMangroveB, svgMangroveC],
  nile_valley: [svgNileValleyA, svgNileValleyB, svgNileValleyC],
  oasis: [svgOasisA, svgOasisB, svgOasisC],
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

// --- Fertile riverbank overlay (medium‑poly 3D version) -----------------------

function svgFertileOverlay(seed) {
  const id = uid();
  const defs = `<radialGradient id="g-${id}" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stop-color="${PAL.fertileLight}" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="${PAL.fertile}" stop-opacity="0"/>
  </radialGradient>`;
  const sprouts = seed === 0
    ? `<polygon points="30,70 34,60 38,70" fill="${PAL.fertile}" opacity="0.8"/>
       <polygon points="34,60 38,52 42,60" fill="${PAL.fertileLight}" opacity="0.7"/>
       <polygon points="68,64 72,54 76,64" fill="${PAL.fertile}" opacity="0.8"/>`
    : seed === 1
    ? `<polygon points="50,72 54,62 58,72" fill="${PAL.fertile}" opacity="0.8"/>
       <polygon points="54,62 58,54 62,62" fill="${PAL.fertileLight}" opacity="0.7"/>`
    : `<polygon points="22,58 26,48 30,58" fill="${PAL.fertile}" opacity="0.8"/>
       <polygon points="74,72 78,62 82,72" fill="${PAL.fertile}" opacity="0.8"/>`;
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
