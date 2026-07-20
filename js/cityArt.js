// cityArt.js — Inline SVG settlement markers, tiered by population (hamlet -> town -> city
// -> capital metropolis), with an optional fortified-wall ring and capital finial overlay.
//
// Sprite pass: same toolkit as units.js — a dark outline on every shape, and every building
// face split into a lit half and a shadowed half (instead of one flat fill) so roofs and
// walls read as three-dimensional forms instead of paper cutouts. Architecture still
// escalates with tier the way unit gear does: thatch and wood at the low end, mud-brick
// next, dressed stone with a market street, then a monumental gold-trimmed capital.

const CLR = {
  thatch: '#9C7A48', thatchShadow: '#6B4E28', thatchDark: '#5A4126',
  mudbrick: '#C08F56', mudbrickShadow: '#8C5A2E',
  stone: '#ACA290', stoneShadow: '#726A5A', stoneDark: '#6B6354', stoneLight: '#C2B89E',
  gold: '#D8A93A', goldLight: '#F1CE73',
  shadow: 'rgba(20,14,8,0.4)',
  market: '#8C2F2F', marketDark: '#6B2020',
  outline: '#241708',
};

function hut(cx, baseY, w, h, roofColor, wallColor, roofShadow = CLR.thatchShadow, wallShadow = null) {
  const hw = w / 2;
  const peakY = baseY - h - w * 0.55;
  const wShadow = wallShadow || wallColor;
  return `
    <polygon points="${cx - hw},${baseY} ${cx - hw},${baseY - h} ${cx},${baseY - h} ${cx},${baseY}" fill="${wShadow}" stroke="${CLR.outline}" stroke-width="1" opacity="0.82"/>
    <polygon points="${cx},${baseY - h} ${cx + hw},${baseY - h} ${cx + hw},${baseY} ${cx},${baseY}" fill="${wallColor}" stroke="${CLR.outline}" stroke-width="1"/>
    <polygon points="${cx - hw - 2},${baseY - h} ${cx},${peakY} ${cx},${baseY - h}" fill="${roofShadow}" stroke="${CLR.outline}" stroke-width="1"/>
    <polygon points="${cx},${peakY} ${cx + hw + 2},${baseY - h} ${cx},${baseY - h}" fill="${roofColor}" stroke="${CLR.outline}" stroke-width="1"/>
    <line x1="${cx - hw * 0.4}" y1="${peakY + (baseY - h - peakY) * 0.42}" x2="${cx}" y2="${peakY}" stroke="#fff" stroke-width="0.8" opacity="0.22"/>
    <rect x="${cx - 2.2}" y="${baseY - 7}" width="4.4" height="7" fill="${CLR.shadow}"/>`;
}

function stoneBuilding(x, y, w, h, roofColor, wallColor, roofShadow = CLR.stoneShadow, wallShadow = CLR.stoneShadow, withDoor = true) {
  const midX = x + w / 2;
  return `
    <rect x="${x}" y="${y}" width="${w / 2}" height="${h}" fill="${wallShadow}" stroke="${CLR.outline}" stroke-width="1"/>
    <rect x="${midX}" y="${y}" width="${w / 2}" height="${h}" fill="${wallColor}" stroke="${CLR.outline}" stroke-width="1"/>
    <polygon points="${x - 2},${y} ${midX},${y - h * 0.4} ${midX},${y}" fill="${roofShadow}" stroke="${CLR.outline}" stroke-width="1"/>
    <polygon points="${midX},${y - h * 0.4} ${x + w + 2},${y} ${midX},${y}" fill="${roofColor}" stroke="${CLR.outline}" stroke-width="1"/>
    <line x1="${x + w * 0.15}" y1="${y - h * 0.18}" x2="${midX}" y2="${y - h * 0.4}" stroke="#fff" stroke-width="0.7" opacity="0.2"/>
    <line x1="${x}" y1="${y + h * 0.42}" x2="${x + w}" y2="${y + h * 0.42}" stroke="${CLR.outline}" stroke-width="0.6" opacity="0.3"/>
    ${withDoor ? `<rect x="${midX - 3}" y="${y + h - 10}" width="6" height="10" fill="${CLR.shadow}" stroke="${CLR.outline}" stroke-width="0.6"/>` : ''}
    <rect x="${x + 2}" y="${y + 4}" width="3" height="4" fill="${CLR.stoneDark}" stroke="${CLR.outline}" stroke-width="0.5" opacity="0.9"/>`;
}

function marketStall(x, y) {
  return `<rect x="${x}" y="${y}" width="10" height="6" fill="${CLR.marketDark}" stroke="${CLR.outline}" stroke-width="0.8"/>
    <polygon points="${x - 1.5},${y} ${x + 5},${y - 5} ${x + 11.5},${y}" fill="${CLR.market}" stroke="${CLR.outline}" stroke-width="0.8"/>
    <polygon points="${x + 1},${y - 1.6} ${x + 5},${y - 4.6} ${x + 9},${y - 1.6}" fill="${CLR.goldLight}"/>`;
}

function palmAccent(cx, cy, scale = 1) {
  const light = '#5FA06B', base = '#3E7A4A', dark = '#255238';
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <path d="M0,6 Q-1,-4 0,-8" stroke="${CLR.mudbrickShadow}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <polygon points="0,-8 -8,-11 -9,-6" fill="${light}" stroke="${CLR.outline}" stroke-width="0.5"/>
    <polygon points="0,-8 7,-11 9,-5" fill="${base}" stroke="${CLR.outline}" stroke-width="0.5"/>
    <polygon points="0,-8 0,-1 -3,3" fill="${dark}" stroke="${CLR.outline}" stroke-width="0.5"/>
  </g>`;
}

/** Fortified wall ring: crenellated battlements sampled along the front-facing arc, plus a
 *  small gatehouse — reads as an actual fortification rather than a flat colored ellipse. */
function wallsRing(w, h) {
  const cx = w / 2, cy = h - 6, rx = w / 2 - 2, ry = 9.5;
  let merlons = '';
  const count = 11;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    if (t > 0.42 && t < 0.58) continue; // leave a gap for the gatehouse
    const theta = Math.PI * (0.08 + t * 0.84);
    const x = cx + rx * Math.cos(theta);
    const y = cy + ry * Math.sin(theta);
    merlons += `<rect x="${(x - 1.7).toFixed(1)}" y="${(y - 3.4).toFixed(1)}" width="3.4" height="3.8" fill="${CLR.stoneDark}" stroke="${CLR.outline}" stroke-width="0.6"/>`;
  }
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${CLR.stoneShadow}" stroke-width="6.4" opacity="0.55"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${CLR.stone}" stroke-width="5" opacity="0.95"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${CLR.stoneLight}" stroke-width="1.3" opacity="0.7"/>
    ${merlons}
    <rect x="${cx - 6}" y="${cy - 1}" width="5" height="9" fill="${CLR.stoneShadow}" stroke="${CLR.outline}" stroke-width="0.7"/>
    <rect x="${cx + 1}" y="${cy - 1}" width="5" height="9" fill="${CLR.stone}" stroke="${CLR.outline}" stroke-width="0.7"/>
    <rect x="${cx - 6}" y="${cy - 3.5}" width="5" height="2.6" fill="${CLR.stoneDark}" stroke="${CLR.outline}" stroke-width="0.5"/>
    <rect x="${cx + 1}" y="${cy - 3.5}" width="5" height="2.6" fill="${CLR.stoneDark}" stroke="${CLR.outline}" stroke-width="0.5"/>
    <rect x="${cx - 2.4}" y="${cy + 3}" width="4.8" height="5" fill="${CLR.shadow}"/>`;
}

function settlementSVG(tier, ringColor, hasWalls, isCapital) {
  const w = 84, h = 62;
  let buildings;

  if (tier === 0) { // hamlet — a couple of thatched huts
    buildings = `${hut(30, 48, 16, 10, CLR.thatch, '#B99860')}${hut(50, 50, 13, 8, CLR.thatch, '#B99860')}`;
  } else if (tier === 1) { // town — mud-brick huts clustered, one bigger
    buildings = `${hut(22, 48, 15, 11, CLR.mudbrick, '#C99A5E', CLR.mudbrickShadow)}${hut(42, 44, 19, 15, CLR.mudbrick, '#C99A5E', CLR.mudbrickShadow)}${hut(62, 49, 13, 10, CLR.mudbrick, '#C99A5E', CLR.mudbrickShadow)}${palmAccent(74, 46, 0.8)}`;
  } else if (tier === 2) { // city — dressed stone buildings + a small market street
    buildings = `${stoneBuilding(12, 32, 14, 20, CLR.stoneDark, CLR.stone)}${stoneBuilding(30, 26, 18, 26, CLR.stoneDark, CLR.stoneLight)}
      ${stoneBuilding(52, 30, 15, 22, CLR.stoneDark, CLR.stone)}${marketStall(48, 52)}${marketStall(60, 53)}
      ${palmAccent(72, 44, 0.9)}${palmAccent(8, 46, 0.7)}`;
  } else { // capital metropolis — monumental stone core with gold trim, flanked by the city
    buildings = `${stoneBuilding(10, 34, 13, 18, CLR.stoneDark, CLR.stone)}${stoneBuilding(24, 28, 15, 24, CLR.stoneDark, CLR.stoneLight)}
      <rect x="42" y="12" width="12" height="38" fill="${CLR.stoneShadow}" stroke="${CLR.outline}" stroke-width="1"/>
      <rect x="54" y="12" width="12" height="38" fill="${CLR.stoneLight}" stroke="${CLR.outline}" stroke-width="1"/>
      <polygon points="40,12 54,-2 54,12" fill="${CLR.gold}" stroke="${CLR.outline}" stroke-width="1"/>
      <polygon points="54,-2 68,12 54,12" fill="${CLR.goldLight}" stroke="${CLR.outline}" stroke-width="1"/>
      <rect x="42" y="12" width="24" height="4" fill="${CLR.goldLight}"/>
      <rect x="51" y="30" width="6" height="20" fill="${CLR.shadow}" stroke="${CLR.outline}" stroke-width="0.6"/>
      ${stoneBuilding(68, 32, 13, 20, CLR.stoneDark, CLR.stone)}${marketStall(24, 54)}
      ${palmAccent(76, 44, 0.8)}`;
  }

  const walls = hasWalls ? wallsRing(w, h) : '';

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${w / 2}" cy="${h - 4}" rx="${w / 2 - 4}" ry="7" fill="${CLR.shadow}"/>
    ${walls}
    ${buildings}
    ${isCapital ? `<polygon points="${w / 2 - 5},4 ${w / 2},-6 ${w / 2 + 5},4" fill="${CLR.goldLight}" stroke="${CLR.outline}" stroke-width="0.8"/>` : ''}
    <rect x="${w / 2 - 1.4}" y="2" width="2.8" height="14" fill="${ringColor}" stroke="${CLR.outline}" stroke-width="0.6"/>
    <polygon points="${w / 2 + 1.4},2 ${w / 2 + 13},7 ${w / 2 + 1.4},12" fill="${ringColor}" stroke="${CLR.outline}" stroke-width="0.6"/>
  </svg>`;
}

const _cache = new Map();
export function getCityImage(populationTier, ringColor, hasWalls = false, isCapital = false) {
  const key = `${populationTier}-${ringColor}-${hasWalls ? 'w' : 'n'}-${isCapital ? 'c' : 'n'}`;
  if (_cache.has(key)) return _cache.get(key);
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(settlementSVG(populationTier, ringColor, hasWalls, isCapital));
  _cache.set(key, img);
  return img;
}

export function tierForPopulation(pop) {
  if (pop >= 10) return 3;
  if (pop >= 6) return 2;
  if (pop >= 3) return 1;
  return 0;
}
