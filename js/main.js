// main.js — App bootstrap: kingdom select, world gen, camera/input, render loop, city/combat UI

import { generateWorld } from './worldgen.js';
import { GameState } from './state.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { axialToPixel, pixelToAxial, hexKey } from './hex.js';
import { KINGDOMS, getKingdomList } from './kingdoms.js';
import { BIOMES } from './biomes.js';
import { UNITS } from './units.js';
import { BUILDINGS } from './buildings.js';
import { computeReachable, reconstructPath } from './movement.js';
import { TECHS, BRANCH_LABELS, isTechAvailable, availableTechs, isUnitUnlocked, isBuildingUnlocked } from './tech.js';
import { WONDERS, isWonderAvailable } from './wonders.js';
import { computeCityYields, cityHasResource } from './cities.js';
import { getEffectiveCombatStats } from './kingdomEffects.js';
import { runAITurn, aiAutopickResearch } from './ai.js';
import { militaryStrength } from './diplomacy.js';
import { checkVictory, victoryProgress, VICTORY_LABELS } from './victory.js';
import { saveGame, loadGame, listSaves, deleteSave } from './save.js';
import { sfx, setMuted, isMuted } from './audio.js';

const canvas = document.getElementById('game-canvas');
const camera = new Camera(canvas);
const renderer = new Renderer(canvas, camera);

let state = null;
let humanPlayerId = null;
let selectedUnit = null;
let selectedCity = null;
let dragging = false;
let lastPointer = null;
let pointerMoved = false;
let reachableMap = new Map(); // hexKey -> {q,r,cost,from}
const pendingGrowthChoices = [];
let selectedDifficulty = 'normal';
let gameOver = false;

// ---------- Kingdom selection screen ----------

function buildKingdomSelect() {
  const diffButtons = document.querySelectorAll('.difficulty-btn');
  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      diffButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDifficulty = btn.dataset.difficulty;
    });
  });

  const grid = document.getElementById('kingdom-grid');
  grid.innerHTML = '';
  getKingdomList().forEach(k => {
    const card = document.createElement('button');
    card.className = 'kingdom-card';
    card.style.setProperty('--kcolor', k.color);
    card.innerHTML = `
      <div class="kingdom-emblem">${k.emblem}</div>
      <div class="kingdom-name">${k.name}</div>
      <div class="kingdom-subtitle">${k.subtitle}</div>
      <div class="kingdom-bonus">${k.bonus}</div>
    `;
    card.addEventListener('click', () => startGame(k.id));
    grid.appendChild(card);
  });

  refreshContinueSection();
}

async function refreshContinueSection() {
  const section = document.getElementById('continue-section');
  if (!section) return;
  try {
    const saves = await listSaves();
    const autosave = saves.find(s => s.slot === 'autosave');
    if (!autosave) { section.classList.add('hidden'); return; }
    const k = KINGDOMS[autosave.kingdomId];
    section.innerHTML = `
      <button id="continue-btn" class="continue-btn">
        <span class="continue-emblem">${k ? k.emblem : ''}</span>
        <span>Continue as ${k ? k.name : 'Unknown'} \u2014 Turn ${autosave.turn}, ${autosave.cityCount} cities</span>
      </button>`;
    section.classList.remove('hidden');
    document.getElementById('continue-btn').addEventListener('click', continueGame);
  } catch {
    section.classList.add('hidden');
  }
}

async function continueGame() {
  try {
    const loaded = await loadGame('autosave');
    if (!loaded) return;
    state = loaded.state;
    humanPlayerId = loaded.humanPlayerId;
    gameOver = false;
    pendingGrowthChoices.length = 0;
    selectedUnit = null;
    selectedCity = null;
    reachableMap = new Map();
    renderer.selected = null;
    renderer.reachable.clear();
    renderer.animations.clear();
    renderer.flashes.clear();

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('tile-info').classList.add('hidden');
    document.getElementById('city-panel').classList.add('hidden');

    const human = state.players.get(humanPlayerId);
    const anyCity = [...state.cities.values()].find(c => c.owner === humanPlayerId);
    const anyUnit = [...state.units.values()].find(u => u.owner === humanPlayerId);
    const focus = anyCity || anyUnit || { q: 0, r: 0 };
    const center = axialToPixel(focus.q, focus.r);
    renderer.resize();
    camera.zoom = 1;
    camera.centerOn(center.x, center.y);

    updateResourceBar();
    updateKingdomBadge();
    updateResearchPill();
    logEvent('Game loaded.');
    requestAnimationFrame(loop);
  } catch (err) {
    console.error('Failed to load save', err);
  }
}

function startGame(kingdomId) {
  gameOver = false;
  pendingGrowthChoices.length = 0;
  selectedUnit = null;
  selectedCity = null;
  reachableMap = new Map();
  renderer.selected = null;
  renderer.reachable.clear();
  renderer.animations.clear();
  renderer.flashes.clear();
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-ui').classList.remove('hidden');
  document.getElementById('tile-info').classList.add('hidden');
  document.getElementById('city-panel').classList.add('hidden');

  const world = generateWorld({ width: 44, height: 30, seed: `cradle-${Date.now()}`, numPlayers: 4 });
  state = new GameState(world);

  const human = state.addPlayer(kingdomId, true);
  humanPlayerId = human.id;

  const aiPool = getKingdomList().map(k => k.id).filter(id => id !== kingdomId);
  for (let i = 0; i < 3; i++) {
    const pick = aiPool.splice(Math.floor(Math.random() * aiPool.length), 1)[0];
    state.addPlayer(pick, false, selectedDifficulty);
  }
  state.activePlayerId = humanPlayerId;
  state.initializeStartingUnits();

  state.setResearch(human, 'agriculture');
  for (const pid of state.playerOrder) {
    if (pid === humanPlayerId) continue;
    aiAutopickResearch(state, state.players.get(pid));
  }

  const startPos = world.startingPositions[0];
  const center = axialToPixel(startPos.q, startPos.r);
  renderer.resize();
  camera.zoom = 1;
  camera.centerOn(center.x, center.y);

  updateResourceBar();
  updateKingdomBadge();
  updateResearchPill();
  requestAnimationFrame(loop);
}

// ---------- Render loop ----------

function loop() {
  renderer.render(state, humanPlayerId);
  requestAnimationFrame(loop);
}

// ---------- Input: pan / zoom / select ----------

function setupInput() {
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    pointerMoved = false;
    lastPointer = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || !lastPointer) return;
    const dx = e.clientX - lastPointer.x;
    const dy = e.clientY - lastPointer.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pointerMoved = true;
    camera.pan(dx, dy);
    lastPointer = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    if (!pointerMoved) handleTileClick(e.clientX, e.clientY);
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    camera.zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
  }, { passive: false });

  let pinchStartDist = null;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) pinchStartDist = touchDist(e.touches);
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchStartDist) {
      const d = touchDist(e.touches);
      const factor = d / pinchStartDist;
      const rect = canvas.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      camera.zoomAt(midX, midY, factor);
      pinchStartDist = d;
    }
  }, { passive: true });

  window.addEventListener('resize', () => renderer.resize());
}

function touchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// ---------- Tile / unit / city interaction ----------

function handleTileClick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const worldPt = camera.screenToWorld(sx, sy);
  const axial = pixelToAxial(worldPt.x, worldPt.y);
  const tile = state.world.tiles.get(hexKey(axial.q, axial.r));
  if (!tile || !tile.biome) return;

  const visState = state.fog.getState(humanPlayerId, tile.q, tile.r);
  if (visState === 0) return;

  const unitHere = state.unitsAt(tile.q, tile.r);
  const cityHere = state.cityAt(tile.q, tile.r);
  const key = hexKey(tile.q, tile.r);

  // 1) Attack?
  if (selectedUnit && unitHere && unitHere.owner !== humanPlayerId && state.canAttack(selectedUnit, tile.q, tile.r)) {
    const rel = state.getRelationship(humanPlayerId, unitHere.owner);
    if (rel.status === 'peace') {
      const targetKingdom = KINGDOMS[state.players.get(unitHere.owner).kingdomId].name;
      if (!window.confirm(`${targetKingdom} is at peace with you. Attacking will declare war. Continue?`)) return;
    }
    const attackerId = selectedUnit.instanceId, defenderId = unitHere.instanceId;
    const result = state.attack(selectedUnit, tile.q, tile.r);
    sfx.attackHit();
    renderer.flashUnit(defenderId, '#F0A8A8');
    if (result.dmgToAttacker > 0) renderer.flashUnit(attackerId, '#F0A8A8');
    if (result.defenderDied) sfx.unitDeath();
    logCombat(selectedUnit, unitHere, result);
    if (result.warDeclared) logEvent(`War declared on ${KINGDOMS[state.players.get(unitHere.owner).kingdomId].name}!`);
    if (result.attackerDied || selectedUnit.movesLeft <= 0 || selectedUnit.hasActed) {
      clearSelection();
    } else {
      computeUnitReachable(selectedUnit);
    }
    renderer.selected = { q: tile.q, r: tile.r };
    refreshSidePanels(tile, unitHere, cityHere);
    checkAndHandleVictory();
    return;
  }

  // 2) Move?
  if (selectedUnit && !unitHere && reachableMap.has(key)) {
    const path = reconstructPath(reachableMap, key);
    const dest = path[path.length - 1];
    const info = reachableMap.get(key);
    const fromQ = selectedUnit.q, fromR = selectedUnit.r;
    state.moveUnitTo(selectedUnit, dest.q, dest.r, info.cost);
    renderer.animateMove(selectedUnit.instanceId, fromQ, fromR, dest.q, dest.r);
    sfx.move();
    if (selectedUnit.movesLeft > 0) computeUnitReachable(selectedUnit);
    else clearSelection(false);
    renderer.selected = { q: tile.q, r: tile.r };
    refreshSidePanels(tile, selectedUnit, cityHere);
    return;
  }

  // 3) New selection
  renderer.selected = { q: tile.q, r: tile.r };
  if (unitHere && unitHere.owner === humanPlayerId && unitHere.movesLeft > 0 && !unitHere.hasActed) {
    selectedUnit = unitHere;
    computeUnitReachable(unitHere);
  } else {
    selectedUnit = null;
    reachableMap = new Map();
    renderer.reachable.clear();
  }

  selectedCity = (cityHere && cityHere.owner === humanPlayerId) ? cityHere : null;
  refreshSidePanels(tile, unitHere, cityHere);
}

function computeUnitReachable(unit) {
  const owner = state.players.get(unit.owner);
  reachableMap = computeReachable(state.world, unit, unit.movesLeft, owner);
  renderer.reachable = new Set(reachableMap.keys());
}

function clearSelection(clearRenderer = true) {
  selectedUnit = null;
  reachableMap = new Map();
  renderer.reachable.clear();
  if (clearRenderer) renderer.selected = null;
}

// ---------- Side panels: tile info + found-city action + city panel ----------

function refreshSidePanels(tile, unit, city) {
  updateTileInfo(tile, unit);
  updateCityPanel(city && city.owner === humanPlayerId ? city : null);
}

function updateTileInfo(tile, unit) {
  const panel = document.getElementById('tile-info');
  const biome = BIOMES[tile.biome];
  let html = `<div class="tile-info-title">${biome.name}</div>`;
  html += `<div class="tile-info-row">Move cost: ${biome.moveCost}</div>`;
  const yields = Object.entries(biome.yields || {}).map(([k, v]) => `${k} +${v}`).join(' \u00b7 ');
  if (yields) html += `<div class="tile-info-row">${yields}</div>`;
  if (tile.resource) html += `<div class="tile-info-row resource-row">Resource: ${tile.resource}</div>`;
  if (tile.isRiver) html += `<div class="tile-info-row">River tile</div>`;

  if (unit) {
    const def = UNITS[unit.type];
    const owner = state.players.get(unit.owner);
    const kname = KINGDOMS[owner.kingdomId].name;
    const eff = getEffectiveCombatStats(state, unit, { attacking: true });
    html += `<hr/><div class="tile-info-title">${def.name}</div>`;
    html += `<div class="tile-info-row">${kname} \u2014 HP ${unit.hp}/${unit.maxHp}</div>`;
    html += `<div class="tile-info-row">ATK ${round1(eff.attack)} \u00b7 DEF ${round1(eff.defense)} \u00b7 MOV ${unit.movesLeft}/${def.move}${eff.range > 1 ? ` \u00b7 RNG ${eff.range}` : ''}</div>`;

    if (unit.type === 'villager' && unit.owner === humanPlayerId && unit.movesLeft > 0) {
      const canFound = state.canFoundCityAt(state.players.get(humanPlayerId), tile.q, tile.r);
      html += `<button id="found-city-btn" class="panel-action-btn" ${canFound ? '' : 'disabled'}>${canFound ? 'Found City' : 'Too close to another city'}</button>`;
    }
  }
  panel.innerHTML = html;
  panel.classList.remove('hidden');

  const foundBtn = document.getElementById('found-city-btn');
  if (foundBtn) {
    foundBtn.addEventListener('click', () => {
      const player = state.players.get(humanPlayerId);
      const city = state.foundCity(player, tile.q, tile.r);
      if (city) {
        sfx.cityFounded();
        logEvent(`You founded ${city.name}.`);
        clearSelection();
        renderer.selected = { q: tile.q, r: tile.r };
        selectedCity = city;
        refreshSidePanels(tile, null, city);
        updateResourceBar();
      }
    });
  }
}

function updateCityPanel(city) {
  const panel = document.getElementById('city-panel');
  if (!city) { panel.classList.add('hidden'); panel.innerHTML = ''; return; }

  const yields = computeCityYields(state, city);
  const growthPct = Math.min(100, Math.round((city.foodStored / city.growthThreshold) * 100));
  const queueHtml = city.productionQueue.length
    ? city.productionQueue.slice(0, 3).map((item, i) => {
        const def = item.kind === 'unit' ? UNITS[item.id] : item.kind === 'wonder' ? WONDERS[item.id] : BUILDINGS[item.id];
        const pct = Math.min(100, Math.round((item.progress / item.cost) * 100));
        return `<div class="queue-item ${i === 0 ? 'active' : ''}">
          <span>${def.name}${item.kind === 'wonder' ? ' \u2726' : ''}</span>
          ${i === 0 ? `<div class="mini-bar"><div class="mini-bar-fill" style="width:${pct}%"></div></div>` : ''}
        </div>`;
      }).join('')
    : `<div class="queue-item empty">Production queue is empty</div>`;

  const improvementsHtml = city.improvements.map(id => {
    if (id.startsWith('wonder_')) {
      const w = WONDERS[id.replace('wonder_', '')];
      return w ? `<div class="improvement-chip" title="${w.name}">${w.icon}</div>` : '';
    }
    const b = BUILDINGS[id];
    return b ? `<div class="improvement-chip" title="${b.name}">${b.icon}</div>` : '';
  }).join('');

  panel.innerHTML = `
    <div class="city-panel-header">
      <div class="tile-info-title">${city.name}${city.isCapital ? ' \u2605' : ''}</div>
      <div class="tile-info-row">Population ${city.population}</div>
    </div>
    <div class="mini-bar"><div class="mini-bar-fill growth" style="width:${growthPct}%"></div></div>
    <div class="tile-info-row small">Food ${city.foodStored}/${city.growthThreshold} \u00b7 +${yields.gold}g \u00b7 +${yields.production}p \u00b7 +${yields.science}sci \u00b7 +${yields.culture}cul</div>
    <div class="improvement-row">${improvementsHtml || '<span class="tile-info-row small">No improvements yet</span>'}</div>
    <hr/>
    <div class="tile-info-title small-title">Production</div>
    <div class="production-queue">${queueHtml}</div>
    <button id="add-production-btn" class="panel-action-btn">Add to Queue</button>
  `;
  panel.classList.remove('hidden');

  document.getElementById('add-production-btn').addEventListener('click', () => openProductionMenu(city));
}

// ---------- Modal: production menu ----------

function openProductionMenu(city) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const player = state.players.get(city.owner);

  const buyableUnits = Object.values(UNITS).filter(u => u.tier !== 'legendary' || player.technologies.has(u.techReq));
  const availableBuildings = Object.values(BUILDINGS).filter(b =>
    b.id !== 'capital_seat' && !city.improvements.includes(b.id) && (!b.coastalOnly || city.isCoastal)
  );
  const availableWonders = Object.values(WONDERS).filter(w => isWonderAvailable(state, player, w.id));

  const unitCards = buyableUnits.map(u => {
    const techOk = isUnitUnlocked(u, player.technologies);
    const resOk = cityHasResource(state, city, u.resourceReq);
    const locked = !techOk || !resOk;
    const reason = !techOk ? `Requires ${TECHS[u.techReq] ? TECHS[u.techReq].name : u.techReq}` : !resOk ? `Requires ${u.resourceReq} in territory` : '';
    return `<button class="choice-card ${locked ? 'locked' : ''}" ${locked ? 'disabled' : ''} data-kind="unit" data-id="${u.id}">
      <div class="choice-icon">${u.svg}</div>
      <div class="choice-name">${u.name}</div>
      <div class="choice-desc">${locked ? reason : Object.entries(u.cost).map(([k, v]) => `${k} ${v}`).join(' \u00b7 ')}</div>
    </button>`;
  }).join('');

  const buildingCards = availableBuildings.map(b => {
    const locked = !isBuildingUnlocked(b.id, player.technologies);
    return `<button class="choice-card ${locked ? 'locked' : ''}" ${locked ? 'disabled' : ''} data-kind="building" data-id="${b.id}">
      <div class="choice-icon">${b.icon}</div>
      <div class="choice-name">${b.name}</div>
      <div class="choice-desc">${locked ? 'Locked \u2014 needs technology' : b.describe}</div>
    </button>`;
  }).join('');

  const wonderCards = availableWonders.map(w => `
    <button class="choice-card" data-kind="wonder" data-id="${w.id}">
      <div class="choice-icon">${w.icon}</div>
      <div class="choice-name">${w.name}</div>
      <div class="choice-desc">${w.describe}</div>
    </button>`).join('');

  content.innerHTML = `
    <div class="modal-title">Add to Production \u2014 ${city.name}</div>
    <div class="modal-section-label">Units</div>
    <div class="choice-grid">${unitCards}</div>
    <div class="modal-section-label">Buildings</div>
    <div class="choice-grid">${buildingCards || '<div class="tile-info-row small">All available improvements built.</div>'}</div>
    <div class="modal-section-label">Wonders</div>
    <div class="choice-grid">${wonderCards || '<div class="tile-info-row small">No wonders unlocked yet \u2014 research more technology.</div>'}</div>
    <button id="modal-close-btn" class="panel-action-btn modal-close">Close</button>
  `;

  content.querySelectorAll('.choice-card:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => {
      state.queueProduction(city, btn.dataset.kind, btn.dataset.id);
      closeModal();
      updateCityPanel(city);
    });
  });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}

// ---------- Modal: growth choice ----------

function showNextGrowthModal() {
  if (!pendingGrowthChoices.length) { closeModal(); runAITurns(); return; }
  const event = pendingGrowthChoices[0];
  const city = state.cities.get(event.cityId);
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');

  if (!city || !event.choices.length) {
    pendingGrowthChoices.shift();
    showNextGrowthModal();
    return;
  }

  const cards = event.choices.map(id => {
    const b = BUILDINGS[id];
    return `<button class="choice-card" data-id="${id}">
      <div class="choice-icon">${b.icon}</div>
      <div class="choice-name">${b.name}</div>
      <div class="choice-desc">${b.describe}</div>
    </button>`;
  }).join('');

  content.innerHTML = `
    <div class="modal-title">${city.name} grew to population ${event.population}!</div>
    <div class="modal-section-label">Choose a free improvement</div>
    <div class="choice-grid">${cards}</div>
  `;
  content.querySelectorAll('.choice-card').forEach(btn => {
    btn.addEventListener('click', () => {
      state.applyGrowthChoice(city, btn.dataset.id);
      logEvent(`${city.name} built a ${BUILDINGS[btn.dataset.id].name}.`);
      pendingGrowthChoices.shift();
      if (selectedCity === city) updateCityPanel(city);
      showNextGrowthModal();
    });
  });
  overlay.classList.remove('hidden');
}

// ---------- Event log ----------

function logEvent(message) {
  const log = document.getElementById('event-log');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  log.appendChild(entry);
  while (log.children.length > 4) log.removeChild(log.firstChild);
  setTimeout(() => entry.classList.add('fade'), 4000);
  setTimeout(() => entry.remove(), 5000);
}

function logCombat(attacker, defenderUnit, result) {
  const aName = UNITS[attacker.type].name;
  const dName = UNITS[defenderUnit.type].name;
  if (result.defenderDied) logEvent(`Your ${aName} defeated the enemy ${dName}!`);
  else if (result.attackerDied) logEvent(`Your ${aName} was destroyed attacking ${dName}.`);
  else logEvent(`Your ${aName} struck the enemy ${dName} (-${result.dmgToDefender} HP).`);
}

function cityName(cityId) {
  const c = state.cities.get(cityId);
  return c ? c.name : 'A city';
}

function handleCityEvents(events, isHuman) {
  for (const e of events) {
    if (e.type === 'growth') {
      if (isHuman) {
        pendingGrowthChoices.push(e);
      } else {
        const city = state.cities.get(e.cityId);
        if (city && e.choices.length) state.applyGrowthChoice(city, e.choices[0]);
      }
    } else if (e.type === 'building_complete' && isHuman) {
      sfx.buildingComplete();
      logEvent(`${cityName(e.cityId)} completed a ${BUILDINGS[e.buildingId].name}.`);
    } else if (e.type === 'unit_complete' && isHuman) {
      logEvent(`${cityName(e.cityId)} produced a ${UNITS[e.unitId].name}.`);
    } else if (e.type === 'wonder_complete') {
      sfx.buildingComplete();
      logEvent(`${isHuman ? 'You' : 'A rival'} completed the ${WONDERS[e.wonderId].name}!`);
    } else if (e.type === 'tech_complete') {
      if (isHuman) {
        sfx.techComplete();
        logEvent(`Research complete: ${TECHS[e.techId].name}.`);
        updateResearchPill();
      }
    }
  }
}

// ---------- Turn cycle ----------

function updateResourceBar() {
  const player = state.players.get(humanPlayerId);
  const bar = document.getElementById('resource-bar');
  const order = ['food', 'wood', 'stone', 'gold'];
  bar.innerHTML = order.map(r => `<div class="resource-chip"><span class="res-${r}"></span>${Math.floor(player.stockpile[r])}</div>`).join('');
}

function updateKingdomBadge() {
  const player = state.players.get(humanPlayerId);
  const k = KINGDOMS[player.kingdomId];
  document.getElementById('kingdom-badge').innerHTML = `<div class="badge-emblem">${k.emblem}</div><div class="badge-text"><div class="badge-name">${k.name}</div><div class="badge-turn">Turn <span id="turn-counter">${state.turn}</span></div></div>`;
}

function updateTurnCounter() {
  const el = document.getElementById('turn-counter');
  if (el) el.textContent = state.turn;
}

function runAITurns() {
  while (state.activePlayerId !== humanPlayerId) {
    const aiPlayer = state.players.get(state.activePlayerId);
    if (aiPlayer) runAITurn(state, aiPlayer);
    const { events, endingPlayerId } = state.endTurn();
    handleCityEvents(events, false);
    const endedPlayer = state.players.get(endingPlayerId);
    if (endedPlayer && !endedPlayer.isHuman) aiAutopickResearch(state, endedPlayer);
    if (checkAndHandleVictory()) return;
  }
  updateResourceBar();
  updateTurnCounter();
  autosave();
}

function autosave() {
  if (gameOver || !state || !humanPlayerId) return;
  saveGame(state, humanPlayerId, 'autosave').catch(err => console.warn('Autosave failed:', err));
}

// ---------- Victory ----------

function checkAndHandleVictory() {
  if (gameOver || !state) return false;
  const result = checkVictory(state);
  if (!result) return false;
  gameOver = true;
  showVictoryScreen(result);
  return true;
}

function showVictoryScreen(result) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const winner = state.players.get(result.winner);
  const k = KINGDOMS[winner.kingdomId];
  const isHumanWinner = result.winner === humanPlayerId;

  if (isHumanWinner) sfx.victory(); else sfx.defeat();

  content.innerHTML = `
    <div class="victory-emblem-large">${k.emblem}</div>
    <div class="modal-title">${isHumanWinner ? 'Victory!' : 'Defeat'}</div>
    <div class="victory-subtitle">${k.name} achieves the ${result.label} on turn ${state.turn}.</div>
    <button id="modal-close-btn" class="panel-action-btn modal-close">View Map</button>
    <button id="new-game-btn" class="panel-action-btn modal-close">New Game</button>
  `;
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('new-game-btn').addEventListener('click', () => {
    closeModal();
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    refreshContinueSection();
  });
  overlay.classList.remove('hidden');
}

// ---------- Progress modal ----------

function openProgressModal() {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const human = state.players.get(humanPlayerId);
  const progress = victoryProgress(state, human);
  const alive = state.playerOrder.map(id => state.players.get(id)).filter(p => p && p.alive);

  const rows = [
    ['economic', 'Economic (gold)'],
    ['cultural', 'Cultural (culture)'],
    ['religious', 'Religious (temples)'],
    ['scientific', 'Scientific (all techs)'],
    ['wonder', 'Wonder (5 wonders)'],
  ].map(([key, label]) => `
    <div class="progress-row">
      <div class="progress-row-label"><span>${label}</span><span>${Math.round(progress[key] * 100)}%</span></div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:${Math.round(progress[key] * 100)}%"></div></div>
    </div>`).join('');

  content.innerHTML = `
    <div class="modal-title">Path to Victory</div>
    <div class="tile-info-row small" style="text-align:center;margin-bottom:14px;">Domination: ${alive.length} of ${state.playerOrder.length} kingdoms remain</div>
    ${rows}
    <button id="modal-close-btn" class="panel-action-btn modal-close">Close</button>
  `;
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  overlay.classList.remove('hidden');
}

document.getElementById('progress-btn').addEventListener('click', openProgressModal);

// ---------- Save / mute controls ----------

document.getElementById('save-btn').addEventListener('click', async () => {
  try {
    await saveGame(state, humanPlayerId, 'autosave');
    logEvent('Game saved.');
  } catch (err) {
    console.error(err);
    logEvent('Save failed \u2014 this browser may be blocking storage.');
  }
});

const muteBtn = document.getElementById('mute-btn');
muteBtn.addEventListener('click', () => {
  setMuted(!isMuted());
  muteBtn.classList.toggle('muted', isMuted());
});

// ---------- Research pill + tech tree modal ----------

function updateResearchPill() {
  const player = state.players.get(humanPlayerId);
  const pill = document.getElementById('research-btn');
  if (!player.currentResearch) {
    pill.innerHTML = `<span>Choose Research</span>`;
    return;
  }
  const tech = TECHS[player.currentResearch];
  const pct = Math.min(100, Math.round((player.researchProgress / tech.cost) * 100));
  pill.innerHTML = `<span>${tech.name}</span><div class="pill-bar"><div class="pill-bar-fill" style="width:${pct}%"></div></div>`;
}

function openTechTree() {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const player = state.players.get(humanPlayerId);

  const branches = ['core', 'military', 'economic', 'naval'];
  const columns = branches.map(branch => {
    const techsInBranch = Object.values(TECHS).filter(t => t.branch === branch);
    const cards = techsInBranch.map(t => {
      const completed = player.technologies.has(t.id);
      const researching = player.currentResearch === t.id;
      const locked = !completed && !researching && !isTechAvailable(player.technologies, t.id);
      const stateClass = completed ? 'completed' : researching ? 'researching' : locked ? 'locked' : '';
      return `<button class="tech-card ${stateClass}" ${locked ? 'disabled' : ''} data-id="${t.id}">
        <div class="tech-icon">${t.icon}</div>
        <div class="tech-text">
          <div class="tech-name">${t.name}${completed ? ' \u2713' : ''}</div>
          <div class="tech-cost">${completed ? 'Researched' : `${t.cost} science`}</div>
        </div>
      </button>`;
    }).join('');
    return `<div class="tech-branch-col">
      <div class="tech-branch-title">${BRANCH_LABELS[branch]}</div>
      ${cards}
    </div>`;
  }).join('');

  content.innerHTML = `
    <div class="modal-title">Technology \u2014 ${player.researchProgress}/${player.currentResearch ? TECHS[player.currentResearch].cost : '\u2014'} science toward current research</div>
    <div class="tech-branches">${columns}</div>
    <button id="modal-close-btn" class="panel-action-btn modal-close">Close</button>
  `;

  content.querySelectorAll('.tech-card:not(.locked):not(.completed)').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setResearch(player, btn.dataset.id);
      updateResearchPill();
      openTechTree();
    });
  });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

  overlay.classList.remove('hidden');
}

document.getElementById('research-btn').addEventListener('click', openTechTree);

// ---------- Diplomacy modal ----------

function openDiplomacyModal() {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const human = state.players.get(humanPlayerId);
  const myStrength = militaryStrength(state, humanPlayerId);

  const cards = state.playerOrder.filter(pid => pid !== humanPlayerId).map(pid => {
    const player = state.players.get(pid);
    const k = KINGDOMS[player.kingdomId];
    const rel = state.getRelationship(humanPlayerId, pid);
    const theirStrength = Math.round(militaryStrength(state, pid));
    const powerNote = theirStrength > myStrength * 1.3 ? 'appears stronger than you'
      : theirStrength < myStrength * 0.7 ? 'appears weaker than you' : 'is roughly your equal';

    const actions = [];
    if (rel.status === 'war') {
      actions.push(`<button data-action="peace" data-pid="${pid}">Propose Peace</button>`);
    } else if (rel.status === 'peace') {
      actions.push(`<button data-action="war" data-pid="${pid}">Declare War</button>`);
      actions.push(`<button data-action="alliance" data-pid="${pid}">Propose Alliance</button>`);
      actions.push(`<button data-action="marriage" data-pid="${pid}">Marriage Alliance</button>`);
      if (!rel.tradeAgreement) actions.push(`<button data-action="trade" data-pid="${pid}">Propose Trade</button>`);
      actions.push(`<button data-action="tribute" data-pid="${pid}">Demand Tribute</button>`);
    } else if (rel.status === 'alliance') {
      actions.push(`<button data-action="break" data-pid="${pid}">Break Alliance</button>`);
      actions.push(`<button data-action="war" data-pid="${pid}">Declare War</button>`);
    }

    return `<div class="diplomacy-card">
      <div class="diplomacy-card-header">
        <div class="diplomacy-emblem">${k.emblem}</div>
        <div class="diplomacy-name">${k.name}</div>
        <div class="diplomacy-status ${rel.status}">${rel.status}${rel.tradeAgreement ? ' \u00b7 trade' : ''}</div>
      </div>
      <div class="tile-info-row small">${k.name} ${powerNote}.</div>
      <div class="diplomacy-actions">${actions.join('')}</div>
    </div>`;
  }).join('');

  content.innerHTML = `
    <div class="modal-title">Diplomacy</div>
    ${cards}
    <button id="modal-close-btn" class="panel-action-btn modal-close">Close</button>
  `;

  content.querySelectorAll('.diplomacy-actions button').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.pid;
      const action = btn.dataset.action;
      const kName = KINGDOMS[state.players.get(pid).kingdomId].name;
      let result;
      switch (action) {
        case 'peace': result = state.proposePeace(humanPlayerId, pid); break;
        case 'alliance': result = state.proposeAlliance(humanPlayerId, pid); break;
        case 'marriage': result = state.proposeMarriage(humanPlayerId, pid); break;
        case 'trade': result = state.proposeTrade(humanPlayerId, pid); break;
        case 'tribute': {
          const amount = Math.max(10, Math.round(militaryStrength(state, humanPlayerId) * 0.5));
          result = state.demandTribute(humanPlayerId, pid, amount);
          break;
        }
        case 'war': state.declareWar(humanPlayerId, pid); result = { accepted: true, message: `War declared on ${kName}.` }; break;
        case 'break': state.breakAlliance(humanPlayerId, pid); result = { accepted: true, message: `Alliance with ${kName} broken.` }; break;
      }
      if (result) { sfx.diplomacy(); logEvent(`${kName}: ${result.message}`); }
      updateResourceBar();
      openDiplomacyModal();
    });
  });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

  overlay.classList.remove('hidden');
}

document.getElementById('diplomacy-btn').addEventListener('click', openDiplomacyModal);

document.getElementById('end-turn-btn').addEventListener('click', () => {
  if (gameOver) return;
  clearSelection();
  selectedCity = null;
  document.getElementById('city-panel').classList.add('hidden');
  document.getElementById('tile-info').classList.add('hidden');
  sfx.turnEnd();

  const { events } = state.endTurn(); // human's own turn ends; their cities process
  handleCityEvents(events, true);
  updateResourceBar();
  updateTurnCounter();
  updateResearchPill();

  if (checkAndHandleVictory()) return;
  if (pendingGrowthChoices.length) showNextGrowthModal();
  else runAITurns();
});

// ---------- boot ----------

buildKingdomSelect();
setupInput();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker registration failed:', err));
  });
}
