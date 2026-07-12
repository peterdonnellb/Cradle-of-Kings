// combat.js — Attack resolution between units, with terrain defense bonus, kingdom bonuses, and melee retaliation

import { hexDistance, hexKey } from './hex.js';
import { getEffectiveCombatStats } from './kingdomEffects.js';

const TERRAIN_DEFENSE_BONUS = {
  rift_highlands: 1.5,
  volcanic_highlands: 1.6,
  congo_rainforest: 1.25,
  baobab_forest: 1.15,
};

function terrainMultiplier(world, q, r) {
  const tile = world.tiles.get(hexKey(q, r));
  if (!tile) return 1.0;
  return TERRAIN_DEFENSE_BONUS[tile.biome] || 1.0;
}

/**
 * Resolve an attack. Mutates HP on both units, returns a result summary.
 * Force-exchange formula (Polytopia-inspired), using kingdom-adjusted stats:
 *   atkForce = attacker.attack * (attacker.hp / attacker.maxHp)
 *   defForce = defender.defense * (defender.hp / defender.maxHp) * terrainMultiplier
 *   dmgToDefender = round(atkForce / (atkForce + defForce) * atkForce * 2.6)
 *   if melee and defender survives: dmgToAttacker computed symmetrically
 */
export function resolveAttack(state, attacker, defender) {
  const world = state.world;
  const dist = hexDistance(attacker, defender);
  const attackerStats = getEffectiveCombatStats(state, attacker, { attacking: true });
  const defenderStats = getEffectiveCombatStats(state, defender, { attacking: false });
  const isRanged = attackerStats.range > 1 && dist > 1;

  const atkForce = attackerStats.attack * (attacker.hp / attacker.maxHp);
  const defForce = defenderStats.defense * (defender.hp / defender.maxHp) * terrainMultiplier(world, defender.q, defender.r);
  const totalForce = atkForce + defForce || 1;

  const dmgToDefender = Math.max(1, Math.round((atkForce / totalForce) * atkForce * 2.6));
  defender.hp = Math.max(0, defender.hp - dmgToDefender);

  let dmgToAttacker = 0;
  const canRetaliate = !isRanged && dist === 1 && defender.hp > 0;
  if (canRetaliate) {
    dmgToAttacker = Math.max(1, Math.round((defForce / totalForce) * defForce * 2.6));
    attacker.hp = Math.max(0, attacker.hp - dmgToAttacker);
  }

  const defenderDied = defender.hp <= 0;
  const attackerDied = attacker.hp <= 0;

  if (defenderDied) removeUnit(state, defender);
  if (attackerDied) removeUnit(state, attacker);

  attacker.hasActed = true;
  attacker.movesLeft = 0;

  return { dmgToDefender, dmgToAttacker, defenderDied, attackerDied, isRanged };
}

export function removeUnit(state, unit) {
  const tile = state.world.tiles.get(hexKey(unit.q, unit.r));
  if (tile && tile.unitId === unit.instanceId) tile.unitId = null;
  state.units.delete(unit.instanceId);
  const owner = state.players.get(unit.owner);
  if (owner) owner.unitIds.delete(unit.instanceId);
}

/** Can `attacker` legally attack the unit standing on q,r this turn? */
export function canAttack(state, attacker, q, r) {
  const target = state.unitsAt(q, r);
  if (!target || target.owner === attacker.owner) return false;
  if (attacker.hasActed) return false;
  const dist = hexDistance(attacker, { q, r });
  const range = getEffectiveCombatStats(state, attacker, { attacking: true }).range;
  return dist <= range;
}

/** If the tile is an undefended enemy city, capture it for the attacker's owner. */
export function tryCaptureCity(state, unit, q, r) {
  const tile = state.world.tiles.get(hexKey(q, r));
  if (!tile || !tile.cityId) return false;
  const city = state.cities.get(tile.cityId);
  if (!city || city.owner === unit.owner) return false;
  if (tile.unitId) return false;

  const prevOwner = state.players.get(city.owner);
  if (prevOwner) prevOwner.cityIds.delete(city.id);
  city.owner = unit.owner;
  city.productionQueue = [];
  tile.owner = unit.owner;
  const newOwner = state.players.get(unit.owner);
  if (newOwner) newOwner.cityIds.add(city.id);
  for (const key of city.territory) {
    const t = state.world.tiles.get(key);
    if (t) t.owner = unit.owner;
  }
  state.refreshFogForPlayer(unit.owner);
  return true;
}
