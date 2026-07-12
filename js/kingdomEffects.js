// kingdomEffects.js — Applies each kingdom's unique bonus (from kingdoms.js `effects`) to
// combat, movement, and city economy. Central place so the rest of the codebase stays generic.

import { KINGDOMS } from './kingdoms.js';
import { hexKey } from './hex.js';

function fx(player) {
  return (player && KINGDOMS[player.kingdomId] && KINGDOMS[player.kingdomId].effects) || {};
}

/** Effective combat stats for a unit, after its owner's kingdom bonuses. */
export function getEffectiveCombatStats(state, unit, { attacking = false } = {}) {
  const def = unit.def;
  const player = state.players.get(unit.owner);
  const e = fx(player);
  let attack = def.attack;
  let defense = def.defense;
  const range = def.range || 1;

  const isRanged = range > 1;
  const isCavalry = def.role === 'cavalry' || def.role === 'desert-cavalry';
  const isMelee = !isRanged;

  if (isRanged && e.rangedAttackMult) attack *= (1 + e.rangedAttackMult);
  if (isCavalry && e.cavalryAttackMult) attack *= (1 + e.cavalryAttackMult);
  if (isMelee && attacking && e.meleeAttackMultOnAttack) attack *= (1 + e.meleeAttackMultOnAttack);

  if (e.highlandDefenseBonus) {
    const tile = state.world.tiles.get(hexKey(unit.q, unit.r));
    if (tile && (tile.biome === 'rift_highlands' || tile.biome === 'volcanic_highlands')) {
      defense *= (1 + e.highlandDefenseBonus);
    }
  }

  if (e.defensePerPopTier) {
    const city = state.cityAt(unit.q, unit.r);
    if (city && city.owner === unit.owner) {
      const tier = city.population >= 6 ? 2 : city.population >= 3 ? 1 : 0;
      defense += e.defensePerPopTier * tier;
    }
  }

  const cityHere = state.cityAt(unit.q, unit.r);
  if (cityHere && cityHere.owner === unit.owner && cityHere.improvements.includes('walls')) {
    let wallsMult = 0.5;
    if (e.wallsDefenseMult) wallsMult += e.wallsDefenseMult;
    defense *= (1 + wallsMult);
  }

  return { attack, defense, range: range + (isRanged && e.rangedRangeBonus ? e.rangedRangeBonus : 0) };
}

/** Effective movement points for a unit this turn (kingdom cavalry/highland bonuses). */
export function getEffectiveMove(state, unit) {
  const def = unit.def;
  const player = state.players.get(unit.owner);
  const e = fx(player);
  let move = def.move;
  const isCavalry = def.role === 'cavalry' || def.role === 'desert-cavalry';
  if (isCavalry && e.cavalryMoveBonus) move += e.cavalryMoveBonus;
  return move;
}

/** True if the given kingdom effect grants free movement over highland terrain. */
export function hasHighlandMoveFree(player) {
  return !!fx(player).highlandMoveFree;
}

export function cityGoldMultiplier(player) {
  return 1 + (fx(player).cityGoldMult || 0);
}

export function cityCultureMultiplier(player) {
  return 1 + (fx(player).cultureMult || 0);
}

export function riverProductionMultiplier(player, city, world) {
  const e = fx(player);
  if (!e.riverProductionMult) return 1;
  for (const key of city.territory) {
    const tile = world.tiles.get(key);
    if (tile && tile.isRiver) return 1 + e.riverProductionMult;
  }
  return 1;
}

export function wonderCostMultiplier(player) {
  return 1 + (fx(player).wonderCostMult || 0);
}

export function buildingCostMultiplier(player, resourceKey) {
  const e = fx(player);
  if (resourceKey === 'stone' && e.buildingStoneCostMult) return 1 + e.buildingStoneCostMult;
  return 1;
}

export function coastalGoldBonus(player, city) {
  const e = fx(player);
  return (city.isCoastal && e.coastalGoldFlat) ? e.coastalGoldFlat : 0;
}

export function extraHappiness(player) {
  return fx(player).happinessFlat || 0;
}

export function freeWallsAtPop(player) {
  return fx(player).freeWallsAtPop || null;
}

export function freeHarborOnCoastalFound(player) {
  return !!fx(player).freeHarborOnCoastalFound;
}
