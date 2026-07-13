// cityArt.js — Inline SVG settlement markers, tiered by population (hamlet -> town -> city
// -> capital metropolis), with an optional stone-wall ring and capital finial overlay.
// Architecture escalates with tier the same way unit gear escalates with tier: thatch and
// wood at the low end, mud-brick next, then dressed stone with a market street, then a
// monumental capital with gold-trimmed masonry — so a glance at a city's silhouette alone
// hints at how developed it is, before you even open its panel.

const CLR = {
  thatch: '#8C6A3E',
  thatchDark: '#5A4126',
  mudbrick: '#B5804A',
  mudbrickDark: '#8C5A2E',
  stone: '#9C9280',
  stoneDark: '#6B6354',
  stoneLight: '#C2B89E',
  gold: '#D8A93A',
  goldLight: '#F1CE73',
  shadow: 'rgba(20,14,8,0.38)',
  market: '#8C2F2F',
};

function hut(cx, baseY, w, h, roofColor, wallColor) {
  const hw = w / 2;
  return `<polygon points="${cx - hw},${baseY} ${cx - hw},${baseY - h} ${cx},${baseY - h - w * 0.55} ${cx + hw},${baseY - h} ${cx + hw},${baseY}" fill="${wallColor}"/>
    <polygon points="${cx - hw - 2},${baseY - h} ${cx},${baseY - h - w * 0.55 - 3} ${cx + hw + 2},${baseY - h}" fill="${roofColor}"/>`;
}

function stoneBuilding(x, y, w, h, roofColor, wallColor, withDoor = true) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wallColor}"/>
    <polygon points="${x - 2},${y} ${x + w / 2},${y - h * 0.4} ${x + w + 2},${y}" fill="${roofColor}"/>
    ${withDoor ? `<rect x="${x + w / 2 - 3}" y="${y + h - 10}" width="6" height="10" fill="${CLR.shadow}"/>` : ''}`;
}

function marketStall(x, y) {
  return `<rect x="${x}" y="${y}" width="10" height="6" fill="${CLR.market}"/><polygon points="${x - 1.5},${y} ${x + 5},${y - 5} ${x + 11.5},${y}" fill="${CLR.goldLight}"/>`;
}

function palmAccent(cx, cy, scale = 1) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <path d="M0,6 Q-1,-4 0,-8" stroke="${CLR.mudbrickDark}" stroke-width="1.4" fill="none"/>
    <g fill="#3E7A4A"><path d="M0,-8 Q-7,-11 -9,-5 Q-3,-7 0,-8Z"/><path d="M0,-8 Q7,-11 9,-5 Q3,-7 0,-8Z"/><path d="M0,-8 Q0,-2 0,3 Q-1,-2 0,-8Z"/></g>
  </g>`;
}

function wallsRing(w, h) {
  return `<ellipse cx="${w / 2}" cy="${h - 6}" rx="${w / 2 - 2}" ry="9" fill="none" stroke="${CLR.stoneDark}" stroke-width="5" opacity="0.85"/>
    <ellipse cx="${w / 2}" cy="${h - 6}" rx="${w / 2 - 2}" ry="9" fill="none" stroke="${CLR.stoneLight}" stroke-width="1.4" opacity="0.6"/>`;
}

function settlementSVG(tier, ringColor, hasWalls, isCapital) {
  const w = 84, h = 62;
  let buildings;

  if (tier === 0) { // hamlet — a couple of thatched huts
    buildings = `${hut(30, 48, 16, 10, CLR.thatchDark, CLR.thatch)}${hut(50, 50, 13, 8, CLR.thatchDark, CLR.thatch)}`;
  } else if (tier === 1) { // town — mud-brick huts clustered, one bigger
    buildings = `${hut(22, 48, 15, 11, CLR.mudbrickDark, CLR.mudbrick)}${hut(42, 44, 19, 15, CLR.mudbrickDark, CLR.mudbrick)}${hut(62, 49, 13, 10, CLR.mudbrickDark, CLR.mudbrick)}${palmAccent(74, 46, 0.8)}`;
  } else if (tier === 2) { // city — dressed stone buildings + a small market street
    buildings = `${stoneBuilding(12, 32, 14, 20, CLR.stoneDark, CLR.stone)}${stoneBuilding(30, 26, 18, 26, CLR.stoneDark, CLR.stoneLight)}
      ${stoneBuilding(52, 30, 15, 22, CLR.stoneDark, CLR.stone)}${marketStall(48, 52)}${marketStall(60, 53)}
      ${palmAccent(72, 44, 0.9)}${palmAccent(8, 46, 0.7)}`;
  } else { // capital metropolis — monumental stone core with gold trim, flanked by the city
    buildings = `${stoneBuilding(10, 34, 13, 18, CLR.stoneDark, CLR.stone)}${stoneBuilding(24, 28, 15, 24, CLR.stoneDark, CLR.stoneLight)}
      <rect x="42" y="12" width="24" height="38" fill="${CLR.stoneLight}"/>
      <polygon points="40,12 54,-2 68,12" fill="${CLR.gold}"/>
      <rect x="42" y="12" width="24" height="4" fill="${CLR.goldLight}"/>
      <rect x="51" y="30" width="6" height="20" fill="${CLR.shadow}"/>
      ${stoneBuilding(68, 32, 13, 20, CLR.stoneDark, CLR.stone)}${marketStall(24, 54)}
      ${palmAccent(76, 44, 0.8)}`;
  }

  const walls = hasWalls ? wallsRing(w, h) : '';

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="${w / 2}" cy="${h - 4}" rx="${w / 2 - 4}" ry="7" fill="${CLR.shadow}"/>
    ${walls}
    ${buildings}
    ${isCapital ? `<polygon points="${w / 2 - 5},4 ${w / 2},-6 ${w / 2 + 5},4" fill="${CLR.goldLight}"/>` : ''}
    <rect x="${w / 2 - 1.4}" y="2" width="2.8" height="14" fill="${ringColor}"/>
    <polygon points="${w / 2 + 1.4},2 ${w / 2 + 13},7 ${w / 2 + 1.4},12" fill="${ringColor}"/>
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
