// state.js — Core mutable game state (players, units, turns) and basic turn/economy logic

import { KINGDOMS } from './kingdoms.js';
import { UNITS } from './units.js';
import { hexKey, neighbors } from './hex.js';
import { FogOfWar } from './fog.js';

let _uid = 1;
function nextId(prefix) { return `${prefix}_${_uid++}`; }

export class Player {
  constructor(id, kingdomId, isHuman = false) {
    this.id = id;
    this.kingdomId = kingdomId;
    this.isHuman = isHuman;
    this.stockpile = { food: 30, wood: 20, stone: 10, gold: 15, iron: 0, copper: 0, salt: 0, ivory: 0, gems: 0, horses: 0, fish: 0, spices: 0 };
    this.unitIds = new Set();
    this.cityIds = new Set();
    this.technologies = new Set();
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
  }

  addPlayer(kingdomId, isHuman = false) {
    const id = nextId('player');
    const player = new Player(id, kingdomId, isHuman);
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
    return unit;
  }

  unitsAt(q, r) {
    const tile = this.world.tiles.get(hexKey(q, r));
    if (!tile || !tile.unitId) return null;
    return this.units.get(tile.unitId) || null;
  }

  moveUnit(unit, q, r) {
    const fromTile = this.world.tiles.get(hexKey(unit.q, unit.r));
    const toTile = this.world.tiles.get(hexKey(q, r));
    if (!toTile || !toTile.biome) return false;
    if (toTile.unitId) return false;
    if (fromTile) fromTile.unitId = null;
    unit.q = q; unit.r = r;
    toTile.unitId = unit.instanceId;
    this.refreshFogForPlayer(unit.owner);
    return true;
  }

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

  endTurn() {
    const idx = this.playerOrder.indexOf(this.activePlayerId);
    const nextIdx = (idx + 1) % this.playerOrder.length;
    if (nextIdx === 0) this.turn += 1;
    this.activePlayerId = this.playerOrder[nextIdx];
    for (const uid of this.players.get(this.activePlayerId).unitIds) {
      const u = this.units.get(uid);
      if (u) { u.movesLeft = u.def.move; u.hasActed = false; }
    }
    return this.activePlayerId;
  }
}
