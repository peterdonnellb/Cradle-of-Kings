// cityArt.js — Inline SVG city marker (mud-brick settlement silhouette), tiered by population

function settlementSVG(tier, ringColor) {
  // tier 0: hamlet (pop 1-2), tier 1: town (pop 3-5), tier 2: city (pop 6+)
  const huts = tier === 0
    ? `<polygon points="30,44 30,30 40,22 50,30 50,44" fill="#6B4B33"/><polygon points="28,30 40,18 52,30" fill="#4A3427"/>`
    : tier === 1
    ? `<polygon points="18,46 18,30 28,22 38,30 38,46" fill="#6B4B33"/><polygon points="16,30 28,18 40,30" fill="#4A3427"/>
       <polygon points="42,46 42,28 54,18 66,28 66,46" fill="#8C5A3C"/><polygon points="40,28 54,14 68,28" fill="#4A3427"/>`
    : `<polygon points="14,48 14,28 26,18 38,28 38,48" fill="#6B4B33"/><polygon points="12,28 26,14 40,28" fill="#4A3427"/>
       <rect x="44" y="14" width="20" height="34" fill="#B5502D"/><polygon points="42,14 54,4 66,14" fill="#8C3A1F"/>
       <rect x="51" y="22" width="6" height="10" fill="#F1CE73"/>`;
  return `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="50" rx="34" ry="7" fill="rgba(20,14,8,0.35)"/>
    ${huts}
    <rect x="36" y="2" width="3" height="14" fill="${ringColor}"/>
    <polygon points="39,2 52,7 39,12" fill="${ringColor}"/>
  </svg>`;
}

const _cache = new Map();
export function getCityImage(populationTier, ringColor) {
  const key = `${populationTier}-${ringColor}`;
  if (_cache.has(key)) return _cache.get(key);
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(settlementSVG(populationTier, ringColor));
  _cache.set(key, img);
  return img;
}

export function tierForPopulation(pop) {
  if (pop >= 6) return 2;
  if (pop >= 3) return 1;
  return 0;
}
