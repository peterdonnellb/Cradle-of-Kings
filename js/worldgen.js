// worldgen.js — Procedural generation of the hex world map

import { ValueNoise2D, mulberry32, hashSeedFromString } from './noise.js';
import { neighbors, hexKey, hexDistance, directionBetween } from './hex.js';

/**
 * Tile shape: {
 *   q, r, biome, elevation, moisture, isRiver, isCoast, resource,
 *   owner: playerId|null, cityId, unitId
 * }
 */

const RESOURCE_TABLE = {
  sahara_desert: ['salt', 'gold'],
  sahel_grassland: ['horses'],
  savanna: ['ivory', 'horses'],
  congo_rainforest: ['wood', 'ivory'],
  rift_highlands: ['iron', 'stone'],
  volcanic_highlands: ['gems', 'copper'],
  baobab_forest: ['wood'],
  mangrove_coast: ['fish', 'salt'],
  nile_valley: ['gold', 'spices'],
  oasis: ['spices', 'gold'],
  coast: ['fish'],
  ocean: ['fish'],
};

export function generateWorld({ width = 42, height = 30, seed = 'cradle', numPlayers = 4 } = {}) {
  const numericSeed = typeof seed === 'string' ? hashSeedFromString(seed) : seed;
  const elevNoise = new ValueNoise2D(numericSeed, 40);
  const moistNoise = new ValueNoise2D(numericSeed + 101, 40);
  const detailNoise = new ValueNoise2D(numericSeed + 202, 24);
  const rand = mulberry32(numericSeed + 303);

  const tiles = new Map();
  const centerRow = height / 2;

  // offset coordinates -> axial (odd-r horizontal layout, matches flat-top axial q/r used in hex.js)
  function offsetToAxial(col, row) {
    const q = col - Math.floor((row - (row & 1)) / 2);
    return { q, r: row };
  }

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const { q, r } = offsetToAxial(col, row);
      const elevation = elevNoise.fbm(col, row, 5, 0.5, 0.06)
        + detailNoise.fbm(col, row, 2, 0.5, 0.22) * 0.15;
      const moisture = moistNoise.fbm(col, row, 4, 0.55, 0.08);
      const latFactor = Math.abs(row - centerRow) / (height / 2);

      tiles.set(hexKey(q, r), {
        q, r, col, row,
        elevation, moisture, latFactor,
        biome: null, isRiver: false, isCoast: false, riverDirs: [], isRiverBank: false,
        artVariant: Math.floor(rand() * 3), artFlip: rand() > 0.5,
        resource: null, owner: null, cityId: null, unitId: null,
      });
    }
  }

  // Percentile-based thresholds keep land/ocean/mountain ratios stable across seeds,
  // instead of fixed elevation cutoffs which vary wildly with noise-field luck.
  const sortedElevations = [...tiles.values()].map(t => t.elevation).sort((a, b) => a - b);
  const percentile = (p) => sortedElevations[Math.floor(sortedElevations.length * p)];
  const SEA_LEVEL = percentile(0.34); // ~34% ocean
  const COAST_BAND = (percentile(0.40) - SEA_LEVEL) || 0.03;
  const MOUNTAIN_LEVEL = percentile(0.90); // top 10% of land elevation becomes highlands
  const VOLCANIC_CHANCE_FIELD = new ValueNoise2D(numericSeed + 404, 16);

  // Pass 1: base biome classification
  for (const tile of tiles.values()) {
    const { elevation, moisture, latFactor, col, row } = tile;
    if (elevation < SEA_LEVEL) { tile.biome = 'ocean'; continue; }
    if (elevation < SEA_LEVEL + COAST_BAND) { tile.biome = 'coast'; continue; }

    if (elevation > MOUNTAIN_LEVEL) {
      const volcanic = VOLCANIC_CHANCE_FIELD.fbm(col, row, 2, 0.5, 0.15);
      tile.biome = volcanic > 0.45 ? 'volcanic_highlands' : 'rift_highlands';
      continue;
    }

    const aridity = latFactor * 0.75 + (1 - moisture) * 0.25;

    if (latFactor < 0.22 && moisture > 0.15) {
      tile.biome = 'congo_rainforest';
    } else if (aridity > 0.62) {
      tile.biome = moisture < -0.05 ? 'sahara_desert' : 'sahel_grassland';
    } else if (aridity > 0.42) {
      tile.biome = rand() > 0.75 ? 'baobab_forest' : 'savanna';
    } else {
      tile.biome = moisture > 0.25 ? 'baobab_forest' : 'savanna';
    }
  }

  // Pass 2: mark coastal land tiles, occasionally upgrade to mangrove
  for (const tile of tiles.values()) {
    if (tile.biome === 'ocean' || tile.biome === 'coast') continue;
    const isNextToWater = neighbors(tile.q, tile.r).some(n => {
      const nt = tiles.get(hexKey(n.q, n.r));
      return nt && (nt.biome === 'ocean' || nt.biome === 'coast');
    });
    if (isNextToWater) {
      tile.isCoast = true;
      if (tile.moisture > 0.05 && tile.latFactor < 0.55 && rand() > 0.55) {
        tile.biome = 'mangrove_coast';
      }
    }
  }

  // Pass 3: carve rivers from highland sources down toward the sea, recording which
  // hex edge each river tile flows through (riverDirs) so the renderer can draw a
  // continuous ribbon of water across tile boundaries instead of an isolated squiggle.
  const riverSources = [...tiles.values()]
    .filter(t => (t.biome === 'rift_highlands' || t.biome === 'volcanic_highlands') && rand() > 0.85);

  function linkRiver(a, b) {
    const dAB = directionBetween(a, b);
    const dBA = directionBetween(b, a);
    if (dAB >= 0 && !a.riverDirs.includes(dAB)) a.riverDirs.push(dAB);
    if (dBA >= 0 && !b.riverDirs.includes(dBA)) b.riverDirs.push(dBA);
  }

  for (const source of riverSources) {
    let current = source;
    const visited = new Set();
    for (let step = 0; step < 60; step++) {
      visited.add(hexKey(current.q, current.r));
      current.isRiver = true;
      if (current.biome !== 'ocean' && current.biome !== 'coast' &&
          current.biome !== 'rift_highlands' && current.biome !== 'volcanic_highlands') {
        current.biome = 'nile_valley';
      }
      const candidates = neighbors(current.q, current.r)
        .map(n => tiles.get(hexKey(n.q, n.r)))
        .filter(t => t && !visited.has(hexKey(t.q, t.r)));
      if (!candidates.length) break;
      candidates.sort((a, b) => a.elevation - b.elevation);
      const next = candidates[0];
      linkRiver(current, next);
      if (next.biome === 'ocean' || next.biome === 'coast') { next.isRiver = true; break; }
      current = next;
    }
  }

  // Pass 3b: mark non-river tiles adjacent to a river as fertile riverbank (visual + gets a
  // lush-green fertile overlay in the renderer, echoing how real river valleys green their banks).
  for (const tile of tiles.values()) {
    if (tile.isRiver || !tile.biome) continue;
    const nextToRiver = neighbors(tile.q, tile.r).some(n => {
      const nt = tiles.get(hexKey(n.q, n.r));
      return nt && nt.isRiver;
    });
    if (nextToRiver && tile.biome !== 'ocean' && tile.biome !== 'coast') tile.isRiverBank = true;
  }

  // Pass 4: sprinkle rare oases within deserts
  for (const tile of tiles.values()) {
    if (tile.biome === 'sahara_desert' && rand() > 0.965) {
      tile.biome = 'oasis';
    }
  }

  // Pass 5: assign resources
  for (const tile of tiles.values()) {
    const table = RESOURCE_TABLE[tile.biome];
    if (!table) continue;
    if (rand() < 0.16) {
      tile.resource = table[Math.floor(rand() * table.length)];
    }
  }

  const startingPositions = pickStartingPositions(tiles, numPlayers, rand);

  return { width, height, seed: numericSeed, tiles, startingPositions };
}

function pickStartingPositions(tiles, numPlayers, rand) {
  const landTiles = [...tiles.values()].filter(t =>
    t.biome !== 'ocean' && t.biome !== 'coast' && t.biome !== 'volcanic_highlands'
  );
  const positions = [];
  let attempts = 0;
  const minDist = Math.max(6, Math.floor(Math.sqrt(landTiles.length) / Math.max(numPlayers, 1)));
  while (positions.length < numPlayers && attempts < 4000) {
    attempts++;
    const candidate = landTiles[Math.floor(rand() * landTiles.length)];
    if (!candidate) break;
    const farEnough = positions.every(p => hexDistance(p, candidate) > minDist);
    if (farEnough) positions.push({ q: candidate.q, r: candidate.r });
  }
  if (positions.length < numPlayers) {
    const sorted = [...landTiles].sort((a, b) => a.col - b.col);
    const step = Math.max(1, Math.floor(sorted.length / numPlayers));
    positions.length = 0;
    for (let i = 0; i < numPlayers; i++) {
      const t = sorted[Math.min(i * step, sorted.length - 1)];
      positions.push({ q: t.q, r: t.r });
    }
  }
  return positions;
}

export function getTile(world, q, r) {
  return world.tiles.get(hexKey(q, r));
}
