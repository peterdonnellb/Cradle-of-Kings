// facetedArt.js — Shared "medium-poly" faceted-shading toolkit.
//
// Style: every solid form (tree, rock, mountain, gem, limb, torso, roof) is built from a
// small number of flat polygon facets rather than a single flat silhouette or smooth
// gradient. Each facet is a solid color; volume comes entirely from facet-to-facet color
// contrast under one consistent light source (upper-left = lightest, mid-facing = base
// color, lower-right = darkest), the same convention a low-poly 3D render would use with
// a single key light. No outlines — edges are sold by the color break between facets.
// This module has no dependency on game state; it's pure SVG-fragment geometry helpers
// reused by biomes.js, resources.js, kingdoms.js, units.js, buildings.js, and cityArt.js.

let _fu = 0;
export function fid() { return `f${(_fu++).toString(36)}`; }

// --- hex color math (shared by kingdoms.js and units.js for faceted-panel shading) -----

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
/** Lightens a hex color toward white by `amount` (0-100). */
export function liftColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const t = amount / 100;
  return rgbToHex([r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]);
}
/** Mixes two hex colors by ratio (0 = all colorA, 1 = all colorB). */
export function mixColor(hexA, hexB, ratio) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex([a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio, a[2] + (b[2] - a[2]) * ratio]);
}

/** Soft radial ground/contact shadow (ellipse, no hard edge) — sells that an object sits
 *  ON the surface rather than floating above it. */
export function contactShadow(cx, cy, rx, ry, opacity = 0.28) {
  const id = fid();
  return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#000" stop-opacity="${opacity}"/>
    <stop offset="100%" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`;
}

/** A faceted "canopy" blob (tree canopy, bush, shrub): an irregular 8-point silhouette
 *  subdivided into center-to-edge triangular facets, each colored by which compass
 *  direction it faces (upper-left = light, lower-right = dark, else base). `squashY`
 *  flattens the canopy vertically (useful for wide umbrella-shaped canopies). */
export function facetedCanopy(cx, cy, r, light, base, dark, rotation = 0, squashY = 0.85, jitterSeed = 0) {
  const jitters = [1, 0.9, 1.06, 0.88, 1.1, 0.93, 1.03, 0.86];
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const j = jitters[(i + jitterSeed) % jitters.length];
    const a = (Math.PI / 180) * (i * 45 + rotation);
    pts.push([cx + r * j * Math.cos(a), cy + r * j * Math.sin(a) * squashY]);
  }
  let out = '';
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const midAngle = ((i * 45 + 22.5 + rotation) % 360 + 360) % 360;
    let fill = base;
    if (midAngle > 135 && midAngle < 260) fill = light;
    else if (midAngle > 315 || midAngle < 80) fill = dark;
    out += `<polygon points="${cx},${cy} ${a[0].toFixed(1)},${a[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}" fill="${fill}"/>`;
  }
  return out;
}

/** A tapered trunk/stem: two facets (light-left, dark-right) narrowing toward the top. */
export function facetedTrunk(cx, topY, baseY, topW, baseW, light, dark) {
  const ht = topW / 2, hb = baseW / 2;
  return `<polygon points="${cx - ht},${topY} ${cx},${topY} ${cx},${baseY} ${cx - hb},${baseY}" fill="${light}"/>
    <polygon points="${cx},${topY} ${cx + ht},${topY} ${cx + hb},${baseY} ${cx},${baseY}" fill="${dark}"/>`;
}

/** A faceted rock/boulder cluster: 4 asymmetric facets around a peak point. */
export function facetedRock(cx, cy, r, light, mid, dark) {
  const top = [cx - r * 0.1, cy - r];
  const left = [cx - r * 0.95, cy + r * 0.25];
  const right = [cx + r * 0.85, cy + r * 0.15];
  const bottom = [cx + r * 0.05, cy + r * 0.8];
  return `<polygon points="${top},${left},${bottom}" fill="${mid}"/>
    <polygon points="${top},${bottom},${right}" fill="${dark}"/>
    <polygon points="${top[0]},${top[1]} ${left[0]},${left[1]} ${cx - r * 0.3},${cy - r * 0.05}" fill="${light}"/>
    <polygon points="${top[0]},${top[1]} ${cx - r * 0.3},${cy - r * 0.05} ${cx + r * 0.2},${cy - r * 0.35}" fill="${light}"/>`;
}

/** A faceted crystalline gem/nugget cluster — used for gold, gems, and mountain peaks. */
export function facetedGem(cx, cy, r, light, mid, base, dark) {
  return `<polygon points="${cx},${cy - r} ${cx - r * 0.75},${cy - r * 0.1} ${cx - r * 0.12},${cy + r * 0.12}" fill="${light}"/>
    <polygon points="${cx},${cy - r} ${cx - r * 0.12},${cy + r * 0.12} ${cx + r * 0.5},${cy - r * 0.35}" fill="${mid}"/>
    <polygon points="${cx},${cy - r} ${cx + r * 0.5},${cy - r * 0.35} ${cx + r * 0.85},${cy - r * 0.02}" fill="${base}"/>
    <polygon points="${cx - r * 0.75},${cy - r * 0.1} ${cx - r * 0.12},${cy + r * 0.12} ${cx - r * 0.5},${cy + r * 0.8}" fill="${base}"/>
    <polygon points="${cx - r * 0.12},${cy + r * 0.12} ${cx + r * 0.5},${cy - r * 0.35} ${cx + r * 0.32},${cy + r * 0.7}" fill="${dark}"/>
    <polygon points="${cx - r * 0.12},${cy + r * 0.12} ${cx + r * 0.32},${cy + r * 0.7} ${cx - r * 0.5},${cy + r * 0.8}" fill="${dark}"/>
    <polygon points="${cx + r * 0.5},${cy - r * 0.35} ${cx + r * 0.85},${cy - r * 0.02} ${cx + r * 0.32},${cy + r * 0.7}" fill="${base}"/>`;
}

/** A single faceted mountain peak: three visible faces (light left slope, mid face, dark
 *  right slope) instead of one flat triangle. */
export function facetedPeak(cx, baseY, peakX, peakY, halfWidth, light, mid, dark, snowLight = null) {
  const leftBase = [cx - halfWidth, baseY];
  const rightBase = [cx + halfWidth, baseY];
  const peak = [peakX, peakY];
  const ridge = [peakX + halfWidth * 0.15, peakY + (baseY - peakY) * 0.35];
  let out = `<polygon points="${leftBase.join(',')} ${peak.join(',')} ${ridge.join(',')}" fill="${light}"/>
    <polygon points="${leftBase.join(',')} ${ridge.join(',')} ${cx + halfWidth * 0.3},${baseY}" fill="${mid}"/>
    <polygon points="${ridge.join(',')} ${peak.join(',')} ${rightBase.join(',')}" fill="${dark}"/>`;
  if (snowLight) {
    const snowY = peakY + (baseY - peakY) * 0.22;
    out += `<polygon points="${peakX - halfWidth * 0.18},${snowY} ${peak.join(',')} ${peakX + halfWidth * 0.22},${snowY}" fill="${snowLight}"/>`;
  }
  return out;
}

/** Faceted grass tuft / reed — three thin triangular blades. */
export function facetedTuft(cx, cy, scale, light, dark) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <polygon points="0,0 -3,-9 -1,-1" fill="${dark}"/>
    <polygon points="0,0 0,-11 1.4,-1" fill="${light}"/>
    <polygon points="0,0 3.6,-8 1.4,-1" fill="${dark}"/>
  </g>`;
}

/** A faceted water ripple/plane highlight — a soft elongated diamond suggesting a
 *  reflective facet on water, used sparingly instead of stroke-based ripple lines. */
export function facetedWaterGleam(cx, cy, w, h, color, opacity = 0.5) {
  return `<polygon points="${cx - w},${cy} ${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h}" fill="${color}" opacity="${opacity}"/>`;
}

/** Faceted crop/plant row (papyrus, wheat, farmland) — small faceted blade cluster. */
export function facetedCrop(cx, cy, scale, light, dark) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <polygon points="0,2 -1.6,2 -0.6,-10" fill="${dark}"/>
    <polygon points="0,2 1.6,2 0.6,-10" fill="${light}"/>
    <polygon points="-0.6,-10 -3,-13 -1.4,-7" fill="${dark}"/>
    <polygon points="0.6,-10 3,-13 1.4,-7" fill="${light}"/>
  </g>`;
}
