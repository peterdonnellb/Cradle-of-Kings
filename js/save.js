// save.js — Serialize/deserialize GameState to plain JSON, persisted via IndexedDB.
// Maps and Sets throughout the state model aren't structured-clone-friendly across every
// browser/versioning scenario we care about, so we convert everything to arrays/objects
// explicitly rather than relying on IndexedDB's native structured clone of Map/Set.

import { GameState, Player, Unit } from './state.js';
import { City } from './cities.js';
import { FogOfWar } from './fog.js';

const DB_NAME = 'cradles-conquest';
const DB_VERSION = 1;
const STORE = 'saves';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) { reject(new Error('IndexedDB unavailable')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'slot' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- serialization --------------------------------------------------------------

export function serializeState(state, humanPlayerId) {
  return {
    turn: state.turn,
    activePlayerId: state.activePlayerId,
    playerOrder: state.playerOrder,
    humanPlayerId,
    builtWonders: [...state.builtWonders],
    relationships: [...state.relationships.entries()],
    world: {
      width: state.world.width,
      height: state.world.height,
      seed: state.world.seed,
      startingPositions: state.world.startingPositions,
      tiles: [...state.world.tiles.entries()],
    },
    players: [...state.players.values()].map(p => ({
      id: p.id, kingdomId: p.kingdomId, isHuman: p.isHuman, difficulty: p.difficulty,
      stockpile: p.stockpile,
      unitIds: [...p.unitIds], cityIds: [...p.cityIds],
      technologies: [...p.technologies],
      currentResearch: p.currentResearch, researchProgress: p.researchProgress,
      bankedScience: p.bankedScience,
      wonders: [...(p.wonders || [])],
      culture: p.culture, score: p.score, alive: p.alive,
    })),
    units: [...state.units.values()].map(u => ({
      instanceId: u.instanceId, type: u.type, owner: u.owner, q: u.q, r: u.r,
      hp: u.hp, maxHp: u.maxHp, movesLeft: u.movesLeft, hasActed: u.hasActed, fortified: u.fortified,
    })),
    cities: [...state.cities.values()].map(c => ({
      id: c.id, owner: c.owner, q: c.q, r: c.r, name: c.name,
      population: c.population, foodStored: c.foodStored,
      improvements: c.improvements, isCapital: c.isCapital, isCoastal: c.isCoastal,
      productionQueue: c.productionQueue, territory: [...c.territory],
      happiness: c.happiness, culture: c.culture,
    })),
    fog: [...state.fog.playerVisibility.entries()].map(([pid, map]) => [pid, [...map.entries()]]),
  };
}

export function deserializeState(saved) {
  const world = {
    width: saved.world.width, height: saved.world.height, seed: saved.world.seed,
    startingPositions: saved.world.startingPositions,
    tiles: new Map(saved.world.tiles),
  };

  const state = new GameState(world);
  state.turn = saved.turn;
  state.activePlayerId = saved.activePlayerId;
  state.playerOrder = saved.playerOrder;
  state.builtWonders = new Set(saved.builtWonders);
  state.relationships = new Map(saved.relationships);

  for (const pd of saved.players) {
    const player = new Player(pd.id, pd.kingdomId, pd.isHuman, pd.difficulty);
    player.stockpile = pd.stockpile;
    player.unitIds = new Set(pd.unitIds);
    player.cityIds = new Set(pd.cityIds);
    player.technologies = new Set(pd.technologies);
    player.currentResearch = pd.currentResearch;
    player.researchProgress = pd.researchProgress;
    player.bankedScience = pd.bankedScience;
    player.wonders = new Set(pd.wonders);
    player.culture = pd.culture;
    player.score = pd.score;
    player.alive = pd.alive;
    state.players.set(player.id, player);
  }

  for (const ud of saved.units) {
    const unit = new Unit(ud.type, ud.owner, ud.q, ud.r);
    unit.instanceId = ud.instanceId;
    unit.hp = ud.hp; unit.maxHp = ud.maxHp; unit.movesLeft = ud.movesLeft;
    unit.hasActed = ud.hasActed; unit.fortified = ud.fortified;
    state.units.set(unit.instanceId, unit);
  }

  for (const cd of saved.cities) {
    const city = new City(cd.id, cd.owner, cd.q, cd.r, cd.name, cd.isCapital, cd.isCoastal);
    city.population = cd.population;
    city.foodStored = cd.foodStored;
    city.improvements = cd.improvements;
    city.productionQueue = cd.productionQueue;
    city.territory = new Set(cd.territory);
    city.happiness = cd.happiness;
    city.culture = cd.culture;
    state.cities.set(city.id, city);
  }

  state.fog = new FogOfWar();
  for (const [pid, entries] of saved.fog) {
    state.fog.playerVisibility.set(pid, new Map(entries));
  }

  return { state, humanPlayerId: saved.humanPlayerId };
}

// --- IndexedDB persistence --------------------------------------------------------

export async function saveGame(state, humanPlayerId, slot = 'autosave') {
  const db = await openDB();
  const payload = serializeState(state, humanPlayerId);
  const human = state.players.get(humanPlayerId);
  const record = {
    slot,
    savedAt: Date.now(),
    turn: state.turn,
    kingdomId: human ? human.kingdomId : null,
    cityCount: human ? human.cityIds.size : 0,
    data: payload,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadGame(slot = 'autosave') {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(slot);
    req.onsuccess = () => {
      if (!req.result) { resolve(null); return; }
      resolve(deserializeState(req.result.data));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function listSaves() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []).map(r => ({
      slot: r.slot, savedAt: r.savedAt, turn: r.turn, kingdomId: r.kingdomId, cityCount: r.cityCount,
    })));
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSave(slot) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(slot);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
