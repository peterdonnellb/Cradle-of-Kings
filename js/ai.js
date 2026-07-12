// ai.js — AI opponent decision-making: city production, unit movement/settling/combat, diplomacy.
// Runs once per AI player's turn, before that player's endTurn() is called, so units still
// have their full movesLeft for the turn.

import { hexKey, hexDistance, neighbors, hexesInRange } from './hex.js';
import { computeReachable, reconstructPath } from './movement.js';
import { UNITS } from './units.js';
import { BUILDINGS } from './buildings.js';
import { WONDERS, isWonderAvailable } from './wonders.js';
import { isUnitUnlocked, isBuildingUnlocked } from './tech.js';
import { cityHasResource } from './cities.js';
import { runAIDiplomacyTurn, getRelationship } from './diplomacy.js';
import { availableTechs } from './tech.js';

const AGGRESSION_BY_DIFFICULTY = { easy: 0.05, normal: 0.15, hard: 0.35 };

export function runAITurn(state, player) {
  runAIDiplomacyTurn(state, player.id);

  const unitIds = [...player.unitIds];
  for (const uid of unitIds) {
    const unit = state.units.get(uid);
    if (!unit || unit.hasActed || unit.movesLeft <= 0) continue;
    if (unit.type === 'villager') {
      aiHandleVillager(state, player, unit);
    } else {
      aiHandleMilitary(state, player, unit);
    }
  }

  for (const cid of player.cityIds) {
    const city = state.cities.get(cid);
    if (city) aiQueueCityProduction(state, player, city);
  }
}

// --- villagers: settle new cities ---------------------------------------------

function aiHandleVillager(state, player, unit) {
  const world = state.world;

  if (state.canFoundCityAt(player, unit.q, unit.r)) {
    state.foundCity(player, unit.q, unit.r);
    return;
  }

  const target = findSettleTarget(state, player, unit);
  const reachable = computeReachable(world, unit, unit.movesLeft, player);

  if (!target) {
    wanderRandomly(state, unit, reachable);
    return;
  }

  const targetKey = hexKey(target.q, target.r);
  if (reachable.has(targetKey)) {
    const info = reachable.get(targetKey);
    state.moveUnitTo(unit, target.q, target.r, info.cost);
    if (state.canFoundCityAt(player, unit.q, unit.r)) state.foundCity(player, unit.q, unit.r);
    return;
  }

  // Move toward the target: pick the reachable tile that best reduces distance to it.
  let best = null, bestDist = Infinity;
  for (const [key, info] of reachable) {
    const d = hexDistance(info, target);
    if (d < bestDist) { bestDist = d; best = info; }
  }
  if (best) state.moveUnitTo(unit, best.q, best.r, best.cost);
}

function findSettleTarget(state, player, unit) {
  const world = state.world;
  const candidates = hexesInRange({ q: unit.q, r: unit.r }, 8);
  let bestTile = null, bestScore = -Infinity;
  for (const c of candidates) {
    const key = hexKey(c.q, c.r);
    const visState = state.fog.getState(player.id, c.q, c.r);
    if (visState === 0) continue; // must have seen it at least once
    if (!state.canFoundCityAt(player, c.q, c.r)) continue;
    const tile = world.tiles.get(key);
    if (!tile || !tile.biome) continue;
    let score = 10 - hexDistance(unit, c) * 0.5;
    if (tile.biome === 'sahara_desert' || tile.biome === 'volcanic_highlands') score -= 6;
    if (tile.biome === 'nile_valley' || tile.biome === 'oasis') score += 5;
    if (tile.isCoast) score += 2;
    if (tile.resource) score += 3;
    for (const n of neighbors(c.q, c.r)) {
      const nt = world.tiles.get(hexKey(n.q, n.r));
      if (nt && nt.resource) score += 1;
      if (nt && (nt.biome === 'ocean' || nt.biome === 'coast')) score += 0.5;
    }
    if (score > bestScore) { bestScore = score; bestTile = { q: c.q, r: c.r }; }
  }
  return bestTile;
}

function wanderRandomly(state, unit, reachable) {
  const options = [...reachable.values()];
  if (!options.length) return;
  const pick = options[Math.floor(Math.random() * options.length)];
  state.moveUnitTo(unit, pick.q, pick.r, pick.cost);
}

// --- military units: attack, explore, or hold ---------------------------------

function aiHandleMilitary(state, player, unit) {
  const world = state.world;
  const aggression = AGGRESSION_BY_DIFFICULTY[player.difficulty] || 0.15;

  const target = findAttackTarget(state, player, unit, aggression);
  if (target) {
    state.attack(unit, target.q, target.r);
    return;
  }

  const reachable = computeReachable(world, unit, unit.movesLeft, player);
  if (!reachable.size) return;

  const nearestCity = nearestOwnCity(state, player, unit);
  const farFromHome = !nearestCity || hexDistance(unit, nearestCity) > 4;

  if (farFromHome || Math.random() < 0.6) {
    const best = pickExplorationTile(state, player, reachable);
    if (best) state.moveUnitTo(unit, best.q, best.r, best.cost);
  }
  // else: hold position (garrison/defend) — no move this turn
}

function findAttackTarget(state, player, unit, aggression) {
  const range = unit.def.range || 1;
  const nearby = hexesInRange({ q: unit.q, r: unit.r }, range);
  let best = null, bestHp = Infinity;
  for (const n of nearby) {
    const target = state.unitsAt(n.q, n.r);
    if (!target || target.owner === player.id) continue;
    if (!state.canAttack(unit, n.q, n.r)) continue;
    const rel = getRelationship(state, player.id, target.owner);
    if (rel.status === 'peace' && Math.random() > aggression) continue;
    if (target.hp < bestHp) { bestHp = target.hp; best = { q: n.q, r: n.r }; }
  }
  return best;
}

function nearestOwnCity(state, player, unit) {
  let best = null, bestDist = Infinity;
  for (const cid of player.cityIds) {
    const c = state.cities.get(cid);
    if (!c) continue;
    const d = hexDistance(unit, c);
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}

function pickExplorationTile(state, player, reachable) {
  let best = null, bestScore = -Infinity;
  for (const [key, info] of reachable) {
    let unexploredNeighbors = 0;
    for (const n of neighbors(info.q, info.r)) {
      if (state.fog.getState(player.id, n.q, n.r) === 0) unexploredNeighbors++;
    }
    const score = unexploredNeighbors + Math.random() * 0.5;
    if (score > bestScore) { bestScore = score; best = info; }
  }
  return best;
}

// --- city production ------------------------------------------------------------

function aiQueueCityProduction(state, player, city) {
  if (city.productionQueue.length >= 2) return;

  const hasDefender = !!state.world.tiles.get(hexKey(city.q, city.r))?.unitId
    || neighbors(city.q, city.r).some(n => {
      const u = state.unitsAt(n.q, n.r);
      return u && u.owner === player.id && u.def.attack > 0;
    });

  const unlockedBuildings = Object.values(BUILDINGS).filter(b =>
    b.id !== 'capital_seat' &&
    !city.improvements.includes(b.id) &&
    (!b.coastalOnly || city.isCoastal) &&
    isBuildingUnlocked(b.id, player.technologies)
  );

  if (!hasDefender) {
    queueBestAvailableUnit(state, player, city, ['spearman', 'warrior']);
    return;
  }
  if (unlockedBuildings.some(b => b.id === 'granary')) {
    state.queueProduction(city, 'building', 'granary');
    return;
  }
  if (city.population >= 3 && player.cityIds.size < 5 && Math.random() < 0.45) {
    state.queueProduction(city, 'unit', 'villager');
    return;
  }
  if (unlockedBuildings.some(b => b.id === 'market')) {
    state.queueProduction(city, 'building', 'market');
    return;
  }
  const wonderOptions = Object.values(WONDERS).filter(w => isWonderAvailable(state, player, w.id));
  if (city.isCapital && wonderOptions.length && Math.random() < 0.3) {
    const pick = wonderOptions[Math.floor(Math.random() * wonderOptions.length)];
    state.queueProduction(city, 'wonder', pick.id);
    return;
  }
  if (unlockedBuildings.length) {
    const pick = unlockedBuildings[Math.floor(Math.random() * unlockedBuildings.length)];
    state.queueProduction(city, 'building', pick.id);
    return;
  }
  queueBestAvailableUnit(state, player, city, ['warrior', 'spearman', 'archer']);
}

function queueBestAvailableUnit(state, player, city, preferenceOrder) {
  for (const unitId of preferenceOrder) {
    const def = UNITS[unitId];
    if (def && isUnitUnlocked(def, player.technologies) && cityHasResource(state, city, def.resourceReq)) {
      state.queueProduction(city, 'unit', unitId);
      return;
    }
  }
  state.queueProduction(city, 'unit', 'warrior');
}

/** Auto-pick a random available tech for an AI player with no current research. */
export function aiAutopickResearch(state, player) {
  if (player.currentResearch) return;
  const options = availableTechs(player.technologies);
  if (!options.length) return;
  const pick = options[Math.floor(Math.random() * options.length)];
  state.setResearch(player, pick.id);
}
