// noise.js — Deterministic seeded PRNG + fractal value noise (no external deps)

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

// Value-noise field: builds a grid of random gradients per octave and smooths via bilinear + cosine interpolation.
export class ValueNoise2D {
  constructor(seed, gridSize = 32) {
    this.rand = mulberry32(seed);
    this.gridSize = gridSize;
    this.grid = new Float32Array(gridSize * gridSize);
    for (let i = 0; i < this.grid.length; i++) this.grid[i] = this.rand() * 2 - 1;
  }

  _sample(x, y) {
    const g = this.gridSize;
    const xi = ((Math.floor(x) % g) + g) % g;
    const yi = ((Math.floor(y) % g) + g) % g;
    return this.grid[yi * g + xi];
  }

  _smooth(t) {
    return t * t * (3 - 2 * t); // smoothstep
  }

  noise(x, y) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = this._smooth(x - x0), fy = this._smooth(y - y0);
    const v00 = this._sample(x0, y0);
    const v10 = this._sample(x0 + 1, y0);
    const v01 = this._sample(x0, y0 + 1);
    const v11 = this._sample(x0 + 1, y0 + 1);
    const a = v00 + (v10 - v00) * fx;
    const b = v01 + (v11 - v01) * fx;
    return a + (b - a) * fy;
  }

  // Fractal Brownian Motion — layered octaves for natural-looking terrain
  fbm(x, y, octaves = 4, persistence = 0.5, scale = 0.08) {
    let total = 0, amplitude = 1, maxAmp = 0, freq = scale;
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * freq, y * freq) * amplitude;
      maxAmp += amplitude;
      amplitude *= persistence;
      freq *= 2;
    }
    return total / maxAmp; // -1..1
  }
}
