// cities.js — City founding, territory, economy (food/production/gold/culture/science),
// growth, and the production queue (units, buildings, and world wonders).

import { hexKey, hexesInRange, neighbors } from './hex.js';
import { BIOMES } from './biomes.js';
import { UNITS } from './units.js';
import { BUILDINGS, eligibleGrowthChoices } from './buildings.js';
import { TECHS } from './tech.js';
import { WONDERS, isWonderAvailable } from './wonders.js';
import {
  cityGoldMultiplier, cityCultureMultiplier, riverProductionMultiplier,
  wonderCostMultiplier, buildingCostMultiplier, coastalGoldBonus,
  extraHappiness, freeWallsAtPop, freeHarborOnCoastalFound,
} from './kingdomEffects.js';

let _cid = 1;
const CITY_NAMES = {
  kemet: ['Waset', 'Men-nefer', 'Abu', 'Ineb-hedj'],
  kush: ['Napata', 'Meroe', 'Kerma', 'Sanam'],
  aksum: ['Adulis', 'Yeha', 'Matara', 'Qohaito'],
  mali: ['Niani', 'Timbuktu', 'Djenne', 'Walata'],
  songhai: ['Gao', 'Kukiya', 'Tendirma', 'Bamba'],
  benin: ['Ubinu', 'Ughoton', 'Ake', 'Ekiadolor'],
  zimbabwe: ['Danangombe', 'Naletale', 'Khami', 'Manyikeni'],
  zulu: ['Ulundi', 'Bulawayo', 'Nodwengu', 'Mgungundlovu'],
  yoruba: ['Ile-Ife', 'Oyo-Ile', 'Ijebu-Ode', 'Owo'],
  swahili: ['Kilwa', 'Mombasa', 'Lamu', 'Sofala'],
  ethiopia: ['Lalibela', 'Aksumite', 'Gondar', 'Debre'],
  carthage: ['Qart-Hadasht', 'Hippo', 'Utica', 'Hadrumetum'],
};
const usedNames = new Set();

function pickCityName(kingdomId) {
  const pool = CITY_NAMES[kingdomId] || ['Settlement'];
  const free = pool.filter(n => !usedNames.has(n));
  const name = (free.length ? free : pool)[Math.floor(Math.random() * (free.length ? free.length : pool.length))];
  usedNames.add(name);
  return name;
}

export class City {
  constructor(id, owner, q, r, name, isCapital, isCoastal) {
    this.id = id;
    this.owner = owner;
    this.q = q; this.r = r;
    this.name = name;
    this.population = 1;
    this.foodStored = 0;
    this.improvements = isCapital ? ['capital_seat'] : [];
    this.isCapital = isCapital;
    this.isCoastal = isCoastal;
    this.productionQueue = [];
    this.territory = new Set([hexKey(q, r)]);
    this.happiness = 60;
    this.culture = 0;
  }

  get growthThreshold() {
    return 10 + (this.population - 1) * 7;
  }
}

/** Every per-turn yield for a city, with kingdom bonuses and empire wonder bonuses applied. Pure/no mutation. */
export function computeCityYields(state, city) {
  const world = state.world;
  const player = state.players.get(city.owner);
  const wonderBonus = empireWonderBonus(player);

  let food = 2 + (city.improvements.includes('granary') ? 1 : 0) + (wonderBonus.foodFlat || 0);
  for (const key of city.territory) {
    if (key === hexKey(city.q, city.r)) continue;
    const tile = world.tiles.get(key);
    if (!tile || !tile.biome) continue;
    const biome = BIOMES[tile.biome];
    food += (biome.yields.food || 0);
    if (city.improvements.includes('harbor') && (tile.biome === 'ocean' || tile.biome === 'coast')) food += 2;
  }
  const upkeep = city.population * 2;
  const foodNet = food - upkeep;

  let production = 3 + city.population + (city.improvements.includes('forge') ? 2 : 0) + (wonderBonus.productionFlat || 0);
  production *= riverProductionMultiplier(player, city, world);
  production = Math.round(production);

  let gold = (city.isCapital ? 4 : 1)
    + (city.improvements.includes('market') ? 3 : 0)
    + (city.improvements.includes('harbor') ? 2 : 0)
    + (wonderBonus.goldFlat || 0)
    + coastalGoldBonus(player, city);
  gold = Math.round(gold * cityGoldMultiplier(player));

  let culture = (city.isCapital ? 2 : 0) + (city.improvements.includes('temple') ? 2 : 0) + (wonderBonus.cultureFlat || 0);
  culture = Math.round(culture * cityCultureMultiplier(player));

  const science = 1 + Math.floor(city.population / 2) + (city.improvements.includes('university') ? 3 : 0) + (wonderBonus.scienceFlat || 0);

  return { food, foodNet, production, gold, culture, science };
}

function empireWonderBonus(player) {
  const totals = { productionFlat: 0, foodFlat: 0, goldFlat: 0, cultureFlat: 0, scienceFlat: 0, happinessFlat: 0 };
  if (!player || !player.wonders) return totals;
  for (const wonderId of player.wonders) {
    const w = WONDERS[wonderId];
    if (!w) continue;
    for (const [key, val] of Object.entries(w.effect)) {
      totals[key] = (totals[key] || 0) + val;
    }
  }
  return totals;
}

/** Returns true if q,r is far enough from every existing city of any player (min city spacing). */
export function isValidCitySite(world, existingCities, q, r, minSpacing = 3) {
  const tile = world.tiles.get(hexKey(q, r));
  if (!tile || !tile.biome) return false;
  if (BIOMES[tile.biome] && BIOMES[tile.biome].passable === false) return false;
  if (tile.cityId) return false;
  for (const c of existingCities.values()) {
    const dq = c.q - q, dr = c.r - r;
    const dist = (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
    if (dist < minSpacing) return false;
  }
  return true;
}

export function foundCity(state, player, q, r) {
  const world = state.world;
  const tile = world.tiles.get(hexKey(q, r));
  if (!tile) return null;
  const isCoastal = !!tile.isCoast;
  const isCapital = player.cityIds.size === 0;
  const id = `city_${_cid++}`;
  const city = new City(id, player.id, q, r, pickCityName(player.kingdomId), isCapital, isCoastal);

  if (tile.unitId) {
    const founder = state.units.get(tile.unitId);
    if (founder) {
      state.units.delete(founder.instanceId);
      player.unitIds.delete(founder.instanceId);
    }
  }

  if (isCoastal && freeHarborOnCoastalFound(player)) {
    city.improvements.push('harbor');
  }

  state.cities.set(id, city);
  player.cityIds.add(id);
  tile.cityId = id;
  tile.owner = player.id;
  tile.unitId = null;

  claimTerritory(state, city);
  state.refreshFogForPlayer(player.id);
  return city;
}

export function claimTerritory(state, city) {
  const world = state.world;
  const ring = hexesInRange({ q: city.q, r: city.r }, 1);
  for (const h of ring) {
    const key = hexKey(h.q, h.r);
    const tile = world.tiles.get(key);
    if (!tile || !tile.biome) continue;
    if (tile.owner && tile.owner !== city.owner) continue;
    tile.owner = city.owner;
    city.territory.add(key);
  }
}

export function queueProduction(state, city, kind, id) {
  const player = state.players.get(city.owner);
  let cost;
  if (kind === 'unit') {
    const def = UNITS[id];
    if (!def) return false;
    cost = unitProductionCost(def);
  } else if (kind === 'building') {
    const def = BUILDINGS[id];
    if (!def) return false;
    cost = def.productionCost;
    if (def.cost && def.cost.stone) {
      cost = Math.round(cost * buildingCostMultiplier(player, 'stone'));
    }
  } else if (kind === 'wonder') {
    const def = WONDERS[id];
    if (!def || !isWonderAvailable(state, player, id)) return false;
    cost = Math.round(def.productionCost * wonderCostMultiplier(player));
  } else {
    return false;
  }
  city.productionQueue.push({ kind, id, cost, progress: 0 });
  return true;
}

function unitProductionCost(unitDef) {
  const sum = Object.values(unitDef.cost || {}).reduce((a, b) => a + b, 0);
  return Math.max(10, Math.round(sum * 1.1));
}

export function processCityTurn(state, city) {
  const events = [];
  const player = state.players.get(city.owner);
  const yields = computeCityYields(state, city);

  city.foodStored += Math.max(-2, yields.foodNet);

  if (city.foodStored >= city.growthThreshold) {
    city.foodStored -= city.growthThreshold;
    if (city.improvements.includes('granary')) city.foodStored = Math.round(city.foodStored * 1.5);
    city.population += 1;

    const freeWallsPop = freeWallsAtPop(player);
    if (freeWallsPop && city.population === freeWallsPop && !city.improvements.includes('walls')) {
      city.improvements.push('walls');
      events.push({ type: 'building_complete', cityId: city.id, buildingId: 'walls' });
    } else {
      const choices = eligibleGrowthChoices(city, Math.random, player.technologies);
      events.push({ type: 'growth', cityId: city.id, population: city.population, choices: choices.map(c => c.id) });
    }
  }
  if (city.foodStored < 0) city.foodStored = 0;

  player.stockpile.gold += yields.gold;
  city.culture += yields.culture;
  player.culture += yields.culture;

  if (player.currentResearch) {
    player.researchProgress += yields.science;
    const tech = TECHS[player.currentResearch];
    if (tech && player.researchProgress >= tech.cost) {
      player.technologies.add(tech.id);
      player.researchProgress = 0;
      const finishedId = player.currentResearch;
      player.currentResearch = null;
      events.push({ type: 'tech_complete', techId: finishedId });
    }
  } else {
    player.bankedScience = (player.bankedScience || 0) + yields.science;
  }

  if (city.productionQueue.length) {
    const head = city.productionQueue[0];

    if (head.kind === 'wonder' && state.builtWonders.has(head.id)) {
      city.productionQueue.shift();
      events.push({ type: 'production_cancelled', cityId: city.id, reason: 'wonder_taken', id: head.id });
    } else {
      head.progress += yields.production;
      if (head.progress >= head.cost) {
        city.productionQueue.shift();
        if (head.kind === 'building') {
          city.improvements.push(head.id);
          events.push({ type: 'building_complete', cityId: city.id, buildingId: head.id });
        } else if (head.kind === 'wonder') {
          player.wonders = player.wonders || new Set();
          player.wonders.add(head.id);
          state.builtWonders.add(head.id);
          city.improvements.push(`wonder_${head.id}`);
          events.push({ type: 'wonder_complete', cityId: city.id, wonderId: head.id });
        } else {
          const spot = findSpawnSpot(state, city);
          if (spot) {
            state.spawnUnit(head.id, city.owner, spot.q, spot.r);
            events.push({ type: 'unit_complete', cityId: city.id, unitId: head.id, q: spot.q, r: spot.r });
          } else {
            events.push({ type: 'unit_blocked', cityId: city.id, unitId: head.id });
            city.productionQueue.unshift(head);
            head.progress = head.cost;
          }
        }
      }
    }
  }

  return events;
}

export function cityHasResource(state, city, resourceId) {
  if (!resourceId) return true;
  const world = state.world;
  for (const key of city.territory) {
    const tile = world.tiles.get(key);
    if (tile && tile.resource === resourceId) return true;
  }
  return false;
}

function findSpawnSpot(state, city) {
  const world = state.world;
  const cityTile = world.tiles.get(hexKey(city.q, city.r));
  if (cityTile && !cityTile.unitId) return { q: city.q, r: city.r };
  for (const n of neighbors(city.q, city.r)) {
    const t = world.tiles.get(hexKey(n.q, n.r));
    if (t && t.biome && BIOMES[t.biome].passable !== false && !t.unitId) return n;
  }
  return null;
}

export function applyGrowthChoice(city, buildingId) {
  if (!city.improvements.includes(buildingId)) city.improvements.push(buildingId);
}
