// fog.js — Fog of war tracking per player
// States: 0 = unexplored (black), 1 = explored/remembered (dimmed), 2 = currently visible (full clarity)

import { hexesInRange, hexKey } from './hex.js';

export class FogOfWar {
  constructor() {
    this.playerVisibility = new Map(); // playerId -> Map(hexKey -> state)
  }

  ensurePlayer(playerId) {
    if (!this.playerVisibility.has(playerId)) this.playerVisibility.set(playerId, new Map());
    return this.playerVisibility.get(playerId);
  }

  getState(playerId, q, r) {
    const map = this.playerVisibility.get(playerId);
    if (!map) return 0;
    return map.get(hexKey(q, r)) || 0;
  }

  /** Recompute "currently visible" -> "explored" for a player, then apply new visible set. */
  resetVisibleToExplored(playerId) {
    const map = this.ensurePlayer(playerId);
    for (const [key, state] of map.entries()) {
      if (state === 2) map.set(key, 1);
    }
  }

  revealAround(playerId, center, sightRadius, world) {
    const map = this.ensurePlayer(playerId);
    const hexes = hexesInRange(center, sightRadius);
    for (const h of hexes) {
      const key = hexKey(h.q, h.r);
      if (world.tiles.has(key)) map.set(key, 2);
    }
  }

  /** Convenience: recompute full visibility for a player from a list of {q,r,sight} sources. */
  recompute(playerId, sources, world) {
    this.resetVisibleToExplored(playerId);
    for (const src of sources) {
      this.revealAround(playerId, src, src.sight ?? 2, world);
    }
  }
}
