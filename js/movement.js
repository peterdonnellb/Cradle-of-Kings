// movement.js — Dijkstra-based reachable tiles & path for a unit, respecting per-biome movement cost

import { neighbors, hexKey } from './hex.js';
import { BIOMES } from './biomes.js';
import { hasHighlandMoveFree } from './kingdomEffects.js';

const HIGHLAND_BIOMES = new Set(['rift_highlands', 'volcanic_highlands']);

/**
 * Returns a Map<hexKey, {q,r,cost,from}> of every tile reachable within `movePoints`.
 * Occupied tiles (friend or foe) block passage — no stacking in this build.
 * `owner` (optional Player) lets kingdom movement bonuses apply (e.g. Ethiopia ignores
 * the highland movement penalty).
 */
export function computeReachable(world, unit, movePoints, owner = null) {
  const start = { q: unit.q, r: unit.r };
  const visited = new Map();
  visited.set(hexKey(start.q, start.r), { q: start.q, r: start.r, cost: 0, from: null });
  const ignoreHighlandCost = hasHighlandMoveFree(owner);

  const frontier = [{ q: start.q, r: start.r, cost: 0 }];

  while (frontier.length) {
    frontier.sort((a, b) => a.cost - b.cost);
    const current = frontier.shift();
    const currentKey = hexKey(current.q, current.r);
    const bestKnown = visited.get(currentKey);
    if (bestKnown && current.cost > bestKnown.cost) continue;

    for (const n of neighbors(current.q, current.r)) {
      const key = hexKey(n.q, n.r);
      const tile = world.tiles.get(key);
      if (!tile || !tile.biome) continue;
      const biome = BIOMES[tile.biome];
      if (biome.passable === false) continue;
      if (tile.unitId && tile.unitId !== unit.instanceId) continue;
      const moveCost = (ignoreHighlandCost && HIGHLAND_BIOMES.has(tile.biome)) ? 1 : biome.moveCost;
      let newCost = current.cost + moveCost;
      const isFirstStepFromStart = currentKey === hexKey(start.q, start.r);
      if (newCost > movePoints) {
        if (isFirstStepFromStart) {
          // Guarantee: a unit can always take one step per turn, even into costly terrain.
          newCost = movePoints;
        } else {
          continue;
        }
      }
      const existing = visited.get(key);
      if (!existing || newCost < existing.cost) {
        visited.set(key, { q: n.q, r: n.r, cost: newCost, from: currentKey });
        frontier.push({ q: n.q, r: n.r, cost: newCost });
      }
    }
  }

  visited.delete(hexKey(start.q, start.r));
  return visited;
}

/** Reconstructs the path (array of {q,r}) from the reachable map produced above. */
export function reconstructPath(reachableMap, targetKey) {
  const path = [];
  let cur = reachableMap.get(targetKey);
  while (cur) {
    path.unshift({ q: cur.q, r: cur.r });
    cur = cur.from ? reachableMap.get(cur.from) : null;
  }
  return path;
}
