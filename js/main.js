// main.js — App bootstrap: kingdom select, world gen, camera/input, render loop, basic turn UI

import { generateWorld } from './worldgen.js';
import { GameState } from './state.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { axialToPixel, pixelToAxial, hexDistance, hexesInRange, hexKey } from './hex.js';
import { KINGDOMS, getKingdomList } from './kingdoms.js';
import { BIOMES } from './biomes.js';
import { UNITS } from './units.js';

const canvas = document.getElementById('game-canvas');
const camera = new Camera(canvas);
const renderer = new Renderer(canvas, camera);

let state = null;
let humanPlayerId = null;
let selectedUnit = null;
let dragging = false;
let lastPointer = null;
let pointerMoved = false;

function buildKingdomSelect() {
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
}

function startGame(kingdomId) {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-ui').classList.remove('hidden');

  const world = generateWorld({ width: 44, height: 30, seed: `cradle-${Date.now()}`, numPlayers: 4 });
  state = new GameState(world);

  const human = state.addPlayer(kingdomId, true);
  humanPlayerId = human.id;

  const aiPool = getKingdomList().map(k => k.id).filter(id => id !== kingdomId);
  for (let i = 0; i < 3; i++) {
    const pick = aiPool.splice(Math.floor(Math.random() * aiPool.length), 1)[0];
    state.addPlayer(pick, false);
  }
  state.activePlayerId = humanPlayerId;
  state.initializeStartingUnits();

  const startPos = world.startingPositions[0];
  const center = axialToPixel(startPos.q, startPos.r);
  renderer.resize();
  camera.zoom = 1;
  camera.centerOn(center.x, center.y);

  updateResourceBar();
  updateKingdomBadge();
  requestAnimationFrame(loop);
}

function loop() {
  renderer.render(state, humanPlayerId);
  requestAnimationFrame(loop);
}

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
    if (!pointerMoved) {
      handleTileClick(e.clientX, e.clientY);
    }
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

function handleTileClick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const world = camera.screenToWorld(sx, sy);
  const axial = pixelToAxial(world.x, world.y);
  const tile = state.world.tiles.get(hexKey(axial.q, axial.r));
  if (!tile || !tile.biome) return;

  const visState = state.fog.getState(humanPlayerId, tile.q, tile.r);
  if (visState === 0) return;

  const unitHere = state.unitsAt(tile.q, tile.r);

  if (selectedUnit && renderer.reachable.has(hexKey(tile.q, tile.r)) && !unitHere) {
    const cost = hexDistance(selectedUnit, tile);
    state.moveUnit(selectedUnit, tile.q, tile.r);
    selectedUnit.movesLeft = Math.max(0, selectedUnit.movesLeft - cost);
    renderer.reachable.clear();
    if (selectedUnit.movesLeft <= 0) selectedUnit = null;
    else computeReachable(selectedUnit);
    renderer.selected = { q: tile.q, r: tile.r };
    updateTileInfo(tile, unitHere);
    return;
  }

  renderer.selected = { q: tile.q, r: tile.r };

  if (unitHere && unitHere.owner === humanPlayerId && unitHere.movesLeft > 0) {
    selectedUnit = unitHere;
    computeReachable(unitHere);
  } else {
    selectedUnit = null;
    renderer.reachable.clear();
  }

  updateTileInfo(tile, unitHere);
}

function computeReachable(unit) {
  renderer.reachable.clear();
  const range = unit.movesLeft;
  const candidates = hexesInRange({ q: unit.q, r: unit.r }, range);
  for (const c of candidates) {
    if (c.q === unit.q && c.r === unit.r) continue;
    const tile = state.world.tiles.get(hexKey(c.q, c.r));
    if (!tile || !tile.biome) continue;
    if (tile.biome === 'ocean' || tile.biome === 'coast') continue;
    if (tile.unitId) continue;
    renderer.reachable.add(hexKey(c.q, c.r));
  }
}

function updateTileInfo(tile, unit) {
  const panel = document.getElementById('tile-info');
  const biome = BIOMES[tile.biome];
  let html = `<div class="tile-info-title">${biome.name}</div>`;
  html += `<div class="tile-info-row">Movement cost: ${biome.moveCost}</div>`;
  const yields = Object.entries(biome.yields || {}).map(([k, v]) => `${k} +${v}`).join(' \u00b7 ');
  if (yields) html += `<div class="tile-info-row">${yields}</div>`;
  if (tile.resource) html += `<div class="tile-info-row resource-row">Resource: ${tile.resource}</div>`;
  if (tile.isRiver) html += `<div class="tile-info-row">River tile</div>`;
  if (unit) {
    const def = UNITS[unit.type];
    const owner = state.players.get(unit.owner);
    const kname = KINGDOMS[owner.kingdomId].name;
    html += `<hr/><div class="tile-info-title">${def.name}</div>`;
    html += `<div class="tile-info-row">${kname} \u2014 HP ${unit.hp}/${unit.maxHp}</div>`;
    html += `<div class="tile-info-row">ATK ${def.attack} \u00b7 DEF ${def.defense} \u00b7 MOV ${unit.movesLeft}/${def.move}</div>`;
  }
  panel.innerHTML = html;
  panel.classList.remove('hidden');
}

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

document.getElementById('end-turn-btn').addEventListener('click', () => {
  selectedUnit = null;
  renderer.reachable.clear();
  let next = state.endTurn();
  while (next !== humanPlayerId) {
    next = state.endTurn();
  }
  updateResourceBar();
  const tc = document.getElementById('turn-counter');
  if (tc) tc.textContent = state.turn;
});

buildKingdomSelect();
setupInput();
