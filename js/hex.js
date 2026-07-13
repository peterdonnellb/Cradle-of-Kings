// hex.js — Flat-top axial hex grid math for Cradle's Conquest
// Axial coordinates (q, r). Cube coordinates derived as x=q, z=r, y=-x-z.

export const HEX_SIZE = 42; // pixel "radius" of a hex, center to corner

export function axialToCube(q, r) {
  return { x: q, z: r, y: -q - r };
}

export function cubeToAxial(x, y, z) {
  return { q: x, r: z };
}

export function cubeRound(x, y, z) {
  let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
  const xDiff = Math.abs(rx - x), yDiff = Math.abs(ry - y), zDiff = Math.abs(rz - z);
  if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
  else if (yDiff > zDiff) ry = -rx - rz;
  else rz = -rx - ry;
  return { x: rx, y: ry, z: rz };
}

// Flat-top hex: width = size*2, horizontal spacing = size*1.5, vertical spacing = size*sqrt(3)
export function axialToPixel(q, r, size = HEX_SIZE) {
  const x = size * (3 / 2) * q;
  const y = size * Math.sqrt(3) * (r + q / 2);
  return { x, y };
}

export function pixelToAxial(x, y, size = HEX_SIZE) {
  const q = ((2 / 3) * x) / size;
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / size;
  const cube = axialToCube(q, r);
  const rounded = cubeRound(cube.x, cube.y, cube.z);
  return cubeToAxial(rounded.x, rounded.y, rounded.z);
}

export function hexCorner(center, size, i) {
  // flat-top: corners start at angle 0
  const angleDeg = 60 * i;
  const angleRad = (Math.PI / 180) * angleDeg;
  return {
    x: center.x + size * Math.cos(angleRad),
    y: center.y + size * Math.sin(angleRad),
  };
}

export function hexCorners(center, size = HEX_SIZE) {
  const pts = [];
  for (let i = 0; i < 6; i++) pts.push(hexCorner(center, size, i));
  return pts;
}

export const DIRECTIONS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
];

export function neighbors(q, r) {
  return DIRECTIONS.map(d => ({ q: q + d.q, r: r + d.r }));
}

/** Index (0-5) of a neighbor direction -> which hex edge (between hexCorner(i) and hexCorner(i+1)) touches that neighbor. */
export function directionToEdgeIndex(dirIndex) {
  return (6 - dirIndex) % 6;
}

/** Midpoint of the hex edge shared with the neighbor in the given direction index — used to draw rivers/roads that flow continuously across tile boundaries. */
export function edgeMidpoint(center, size, dirIndex) {
  const e = directionToEdgeIndex(dirIndex);
  const a = hexCorner(center, size, e);
  const b = hexCorner(center, size, (e + 1) % 6);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Direction index pointing from tile a to adjacent tile b (assumes they are neighbors). */
export function directionBetween(a, b) {
  const dq = b.q - a.q, dr = b.r - a.r;
  for (let i = 0; i < DIRECTIONS.length; i++) {
    if (DIRECTIONS[i].q === dq && DIRECTIONS[i].r === dr) return i;
  }
  return -1;
}

export function hexDistance(a, b) {
  const ac = axialToCube(a.q, a.r);
  const bc = axialToCube(b.q, b.r);
  return (Math.abs(ac.x - bc.x) + Math.abs(ac.y - bc.y) + Math.abs(ac.z - bc.z)) / 2;
}

export function hexKey(q, r) {
  return `${q},${r}`;
}

export function hexesInRange(center, radius) {
  const results = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = Math.max(-radius, -dx - radius); dy <= Math.min(radius, -dx + radius); dy++) {
      const dz = -dx - dy;
      results.push({ q: center.q + dx, r: center.r + dz });
    }
  }
  return results;
}

// Simple line-of-hexes using cube linear interpolation (used for rivers/paths)
export function hexLine(a, b) {
  const N = hexDistance(a, b);
  const results = [];
  const ac = axialToCube(a.q, a.r);
  const bc = axialToCube(b.q, b.r);
  for (let i = 0; i <= N; i++) {
    const t = N === 0 ? 0 : i / N;
    const x = ac.x + (bc.x - ac.x) * t;
    const y = ac.y + (bc.y - ac.y) * t;
    const z = ac.z + (bc.z - ac.z) * t;
    const rounded = cubeRound(x, y, z);
    results.push(cubeToAxial(rounded.x, rounded.y, rounded.z));
  }
  return results;
}
