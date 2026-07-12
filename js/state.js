// state.js — Core mutable game state (players, units, cities, turns) and turn/economy orchestration

import { KINGDOMS } from './kingdoms.js';
import { UNITS } from './units.js';
import { hexKey, neighbors } from './hex.js';
import { FogOfWar } from './fog.js';
import { foundCity as foundCityImpl, queueProduction as queueProductionImpl, processCityTurn, applyGrowthChoice as applyGrowthChoiceImpl, isValidCitySite } from './cities.js';
import { resolveAttack, canAttack, tryCaptureCity } from './combat.js';
import { getEffectiveMove } from './kingdomEffects.js';
import { TECHS, isTechAvailable } from './tech.js';
import {
  getRelationship, declareWar as declareWarImpl, canAttackAcrossDiplomacy, ensureWarForAttack,
  evaluateProposal, breakAlliance as breakAllianceImpl, tradeIncomeForPlayer,
} from './diplomacy.js';
import { AI_DIFFICULTY_MULT } from './difficulty.js';

let _uid = 1;
function nextId(prefix) { return `${prefix}_${_uid++}`; }

export { AI_DIFFICULTY_MULT };

export class Player {
  constructor(id, kingdomId, isHuman = false, difficulty = 'normal') {
    this.id = id;
    this.kingdomId = kingdomId;
    this.isHuman = isHuman;
    this.difficulty = difficulty;
    this.stockpile = { food: 30, wood: 20, stone: 10, gold: 15, iron: 0, copper: 0, salt: 0, ivory: 0, gems: 0, horses: 0, fish: 0, spices: 0 };
    this.unitIds = new Set();
    this.cityIds = new Set();
    this.technologies = new Set();
    this.currentResearch = null;
    this.researchProgress = 0;
    this.bankedScience = 0;
    this.wonders = new Set();
    this.culture = 0;
    this.score = 0;
    this.alive = true;
  }
  get kingdom() { return KINGDOMS[this.kingdomId]; }
}

export class Unit {
  constructor(unitTypeId, ownerId, q, r) {
    this.instanceId = nextId('unit');
    this.type = unitTypeId;
    this.owner = ownerId;
    this.q = q; this.r = r;
    const def = UNITS[unitTypeId];
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.movesLeft = def.move;
    this.hasActed = false;
    this.fortified = false;
  }
  get def() { return UNITS[this.type]; }
}

export class GameState {
  constructor(world) {
    this.world = world;
    this.players = new Map();
    this.units = new Map();
    this.cities = new Map();
    this.turn = 1;
    this.activePlayerId = null;
    this.fog = new FogOfWar();
    this.playerOrder = [];
    this.builtWonders = new Set();
    this.relationships = new Map();
  }

  addPlayer(kingdomId, isHuman = false, difficulty = 'normal') {
    const id = nextId('player');
    const player = new Player(id, kingdomId, isHuman, difficulty);
    this.players.set(id, player);
    this.playerOrder.push(id);
    if (!this.activePlayerId) this.activePlayerId = id;
    return player;
  }

  spawnUnit(unitTypeId, ownerId, q, r) {
    const unit = new Unit(unitTypeId, ownerId, q, r);
    this.units.set(unit.instanceId, unit);
    this.players.get(ownerId).unitIds.add(unit.instanceId);
    const tile = this.world.tiles.get(hexKey(q, r));
    if (tile) tile.unitId = unit.instanceId;
    unit.movesLeft = getEffectiveMove(this, unit);
    return unit;
  }

  unitsAt(q, r) {
    const tile = this.world.tiles.get(hexKey(q, r));
    if (!tile || !tile.unitId) return null;
    return this.units.get(tile.unitId) || null;
  }

  cityAt(q, r) {
    const tile = this.world.tiles.get(hexKey(q, r));
    if (!tile || !tile.cityId) return null;
    return this.cities.get(tile.cityId) || null;
  }

  /** Move a unit to a destination, deducting the given movement-point cost (from Dijkstra pathfinding). */
  moveUnitTo(unit, q, r, cost) {
    const fromTile = this.world.tiles.get(hexKey(unit.q, unit.r));
    const toTile = this.world.tiles.get(hexKey(q, r));
    if (!toTile || !toTile.biome) return false;
    if (toTile.unitId) return false;
    if (fromTile) fromTile.unitId = null;
    unit.q = q; unit.r = r;
    toTile.unitId = unit.instanceId;
    unit.movesLeft = Math.max(0, unit.movesLeft - cost);
    this.refreshFogForPlayer(unit.owner);
    return true;
  }

  // --- cities -------------------------------------------------------------

  canFoundCityAt(player, q, r) {
    return isValidCitySite(this.world, this.cities, q, r, 3);
  }

  foundCity(player, q, r) {
    return foundCityImpl(this, player, q, r);
  }

  queueProduction(city, kind, id) {
    return queueProductionImpl(this, city, kind, id);
  }

  applyGrowthChoice(city, buildingId) {
    applyGrowthChoiceImpl(city, buildingId);
  }

  // --- technology -----------------------------------------------------------

  setResearch(player, techId) {
    if (!isTechAvailable(player.technologies, techId) && !player.technologies.has(techId)) {
      if (!TECHS[techId] || !TECHS[techId].req.every(r => player.technologies.has(r))) return false;
    }
    if (player.technologies.has(techId)) return false;
    player.currentResearch = techId;
    return true;
  }

  // --- diplomacy --------------------------------------------------------------

  getRelationship(a, b) {
    return getRelationship(this, a, b);
  }

  declareWar(a, b) {
    return declareWarImpl(this, a, b);
  }

  proposePeace(proposer, target) { return evaluateProposal(this, proposer, target, 'peace'); }
  proposeAlliance(proposer, target) { return evaluateProposal(this, proposer, target, 'alliance'); }
  proposeTrade(proposer, target) { return evaluateProposal(this, proposer, target, 'trade'); }
  proposeMarriage(proposer, target) { return evaluateProposal(this, proposer, target, 'marriage_alliance'); }
  demandTribute(proposer, target, amount) { return evaluateProposal(this, proposer, target, 'tribute', { amount }); }
  breakAlliance(a, b) { return breakAllianceImpl(this, a, b); }

  // --- combat ---------------------------------------------------------------

  canAttack(attacker, q, r) {
    if (!canAttack(this, attacker, q, r)) return false;
    const defender = this.unitsAt(q, r);
    if (!defender) return false;
    return canAttackAcrossDiplomacy(this, attacker.owner, defender.owner);
  }

  attack(attacker, q, r) {
    const defender = this.unitsAt(q, r);
    if (!defender) return null;
    if (!canAttackAcrossDiplomacy(this, attacker.owner, defender.owner)) return null;
    const rel = this.getRelationship(attacker.owner, defender.owner);
    const warDeclared = rel.status === 'peace';
    ensureWarForAttack(this, attacker.owner, defender.owner);
    const result = resolveAttack(this, attacker, defender);
    if (result.defenderDied) tryCaptureCity(this, attacker, q, r);
    this.refreshFogForPlayer(attacker.owner);
    result.warDeclared = warDeclared;
    return result;
  }

  // --- fog ------------------------------------------------------------------

  refreshFogForPlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) return;
    const sources = [];
    for (const uid of player.unitIds) {
      const u = this.units.get(uid);
      if (u) sources.push({ q: u.q, r: u.r, sight: 2 });
    }
    for (const cid of player.cityIds) {
      const c = this.cities.get(cid);
      if (c) sources.push({ q: c.q, r: c.r, sight: 3 });
    }
    this.fog.recompute(playerId, sources, this.world);
  }

  refreshAllFog() {
    for (const pid of this.players.keys()) this.refreshFogForPlayer(pid);
  }

  initializeStartingUnits() {
    this.world.startingPositions.forEach((pos, i) => {
      const playerId = this.playerOrder[i];
      if (!playerId) return;
      this.spawnUnit('villager', playerId, pos.q, pos.r);
      const n = neighbors(pos.q, pos.r).find(nb => {
        const t = this.world.tiles.get(hexKey(nb.q, nb.r));
        return t && t.biome && t.biome !== 'ocean' && t.biome !== 'coast' && !t.unitId;
      });
      if (n) this.spawnUnit('warrior', playerId, n.q, n.r);
    });
    this.refreshAllFog();
  }

  /** Ends the current player's turn: processes their cities' economy + diplomacy income, then advances. */
  endTurn() {
    const endingPlayerId = this.activePlayerId;
    const endingPlayer = this.players.get(endingPlayerId);
    const events = [];
    if (endingPlayer) {
      for (const cid of endingPlayer.cityIds) {
        const city = this.cities.get(cid);
        if (city) events.push(...processCityTurn(this, city));
      }
      endingPlayer.stockpile.gold += tradeIncomeForPlayer(this, endingPlayerId);
      this.refreshFogForPlayer(endingPlayerId);
    }

    const idx = this.playerOrder.indexOf(this.activePlayerId);
    const nextIdx = (idx + 1) % this.playerOrder.length;
    if (nextIdx === 0) this.turn += 1;
    this.activePlayerId = this.playerOrder[nextIdx];
    const nextPlayer = this.players.get(this.activePlayerId);
    if (nextPlayer) {
      for (const uid of nextPlayer.unitIds) {
        const u = this.units.get(uid);
        if (u) { u.movesLeft = getEffectiveMove(this, u); u.hasActed = false; }
      }
    }
    return { nextPlayerId: this.activePlayerId, events, endingPlayerId };
  }
}
