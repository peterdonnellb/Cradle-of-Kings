// renderer.js — Draws the hex world to a 2D canvas using cached inline-SVG tile/unit art.
//
// Visual overhaul notes: each tile picks one of 3 hand-authored art variants (plus an
// optional horizontal flip) deterministically from data baked in at world-generation time
// (tile.artVariant / tile.artFlip), so the same biome doesn't look like a single image
// stamped across the map. Rivers are drawn dynamically here (not baked into the tile art)
// because a river's visual path depends on which of its neighbors are also river tiles —
// this lets water flow continuously across tile edges instead of looking like isolated
// per-tile squiggles. Tiles adjacent to a river get a translucent "fertile bank" overlay.

import { axialToPixel, hexCorners, edgeMidpoint, HEX_SIZE } from './hex.js';
import { getBiomeImage, getFertileOverlayImage, PALETTE } from './biomes.js';
import { getResourceImage } from './resources.js';
import { getUnitImage } from './units.js';
import { getCityImage, tierForPopulation } from './cityArt.js';
import { KINGDOMS } from './kingdoms.js';

export class Renderer {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = camera;
    this.selected = null; // {q,r}
    this.reachable = new Set(); // hexKey set for movement-range highlight
    this.animations = new Map(); // unitInstanceId -> {fromQ,fromR,toQ,toR,start,duration}
    this.flashes = new Map(); // unitInstanceId -> {start,duration,color}
  }

  /** Kick off a smooth slide animation for a unit that just moved. */
  animateMove(unitInstanceId, fromQ, fromR, toQ, toR, duration = 220) {
    this.animations.set(unitInstanceId, { fromQ, fromR, toQ, toR, start: performance.now(), duration });
  }

  /** Flash a unit's ring a color briefly (e.g. red on taking damage, white on a clean hit). */
  flashUnit(unitInstanceId, color = '#B5502D', duration = 380) {
    this.flashes.set(unitInstanceId, { start: performance.now(), duration, color });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._cssWidth = rect.width;
    this._cssHeight = rect.height;
  }

  render(state, viewerPlayerId) {
    const { ctx, camera } = this;
    ctx.save();
    ctx.fillStyle = '#0F1B22';
    ctx.fillRect(0, 0, this._cssWidth, this._cssHeight);

    const world = state.world;
    const fog = state.fog;

    for (const tile of world.tiles.values()) {
      if (!tile.biome) continue;
      const center = axialToPixel(tile.q, tile.r);
      const screen = camera.worldToScreen(center.x, center.y);
      const drawSize = HEX_SIZE * camera.zoom * 1.02;
      if (screen.x < -drawSize * 2 || screen.x > this._cssWidth + drawSize * 2) continue;
      if (screen.y < -drawSize * 2 || screen.y > this._cssHeight + drawSize * 2) continue;

      const visState = viewerPlayerId ? fog.getState(viewerPlayerId, tile.q, tile.r) : 2;
      if (visState === 0) continue; // fully unexplored: draw nothing (void)

      const variant = tile.artVariant || 0;
      this._drawTileImage(getBiomeImage(tile.biome, variant), screen.x, screen.y, drawSize, tile.artFlip);

      if (tile.isRiverBank) {
        this._drawTileImage(getFertileOverlayImage(variant), screen.x, screen.y, drawSize, tile.artFlip);
      }

      if (tile.isRiver) {
        this._drawRiver(tile, screen, drawSize);
      }

      if (tile.resource && visState === 2) {
        const img = getResourceImage(tile.resource);
        const s = drawSize * 0.42;
        if (img.complete) ctx.drawImage(img, screen.x + drawSize * 0.18, screen.y - drawSize * 0.62, s, s);
      }

      if (tile.owner) {
        this._drawOwnerBorder(tile, screen, drawSize, state);
      }

      if (tile.cityId && visState === 2) {
        const city = state.cities.get(tile.cityId);
        if (city) {
          const owner = state.players.get(city.owner);
          const ring = owner ? KINGDOMS[owner.kingdomId].color : '#F1CE73';
          const img = getCityImage(tierForPopulation(city.population), ring);
          const w = drawSize * 1.5, h = drawSize * 1.15;
          if (img.complete) ctx.drawImage(img, screen.x - w / 2, screen.y - h * 0.62, w, h);
          ctx.font = `${Math.max(10, drawSize * 0.34)}px Mukta, sans-serif`;
          ctx.fillStyle = '#F6EFDD';
          ctx.textAlign = 'center';
          ctx.fillText(city.name, screen.x, screen.y + drawSize * 0.62);
        }
      }

      if (visState === 1) {
        ctx.beginPath();
        this._hexPath(screen.x, screen.y, drawSize);
        ctx.fillStyle = 'rgba(6,10,14,0.55)';
        ctx.fill();
      }

      if (this.reachable.has(`${tile.q},${tile.r}`)) {
        ctx.beginPath();
        this._hexPath(screen.x, screen.y, drawSize * 0.92);
        ctx.fillStyle = 'rgba(216,169,58,0.28)';
        ctx.fill();
      }

      if (this.selected && this.selected.q === tile.q && this.selected.r === tile.r) {
        ctx.beginPath();
        this._hexPath(screen.x, screen.y, drawSize * 0.96);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#F1CE73';
        ctx.stroke();
      }
    }

    const now = performance.now();
    for (const unit of state.units.values()) {
      const visState = viewerPlayerId ? fog.getState(viewerPlayerId, unit.q, unit.r) : 2;
      if (visState !== 2) continue;

      let drawQ = unit.q, drawR = unit.r;
      const anim = this.animations.get(unit.instanceId);
      if (anim) {
        const t = Math.min(1, (now - anim.start) / anim.duration);
        const ease = 1 - Math.pow(1 - t, 2);
        drawQ = anim.fromQ + (anim.toQ - anim.fromQ) * ease;
        drawR = anim.fromR + (anim.toR - anim.fromR) * ease;
        if (t >= 1) this.animations.delete(unit.instanceId);
      }

      const center = axialToPixel(drawQ, drawR);
      const screen = camera.worldToScreen(center.x, center.y);
      const size = HEX_SIZE * camera.zoom * 0.62;
      const img = getUnitImage(unit.type);
      const owner = state.players.get(unit.owner);
      const ring = owner ? KINGDOMS[owner.kingdomId].color : '#F1CE73';
      ctx.save();
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, size * 0.56, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10,8,6,0.35)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ring;
      ctx.stroke();
      if (img.complete) ctx.drawImage(img, screen.x - size / 2, screen.y - size / 2, size, size);

      const flash = this.flashes.get(unit.instanceId);
      if (flash) {
        const ft = (now - flash.start) / flash.duration;
        if (ft >= 1) {
          this.flashes.delete(unit.instanceId);
        } else {
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, size * 0.62, 0, Math.PI * 2);
          ctx.strokeStyle = flash.color;
          ctx.lineWidth = 3;
          ctx.globalAlpha = 1 - ft;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      if (unit.hp < unit.maxHp) {
        const w = size * 0.9;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(screen.x - w / 2, screen.y + size / 2 + 2, w, 4);
        ctx.fillStyle = unit.hp / unit.maxHp > 0.5 ? '#4C9A4C' : '#B5502D';
        ctx.fillRect(screen.x - w / 2, screen.y + size / 2 + 2, w * (unit.hp / unit.maxHp), 4);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  _hexPath(cx, cy, size) {
    const corners = hexCorners({ x: cx, y: cy }, size);
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) this.ctx.lineTo(corners[i].x, corners[i].y);
    this.ctx.closePath();
  }

  _drawTileImage(img, cx, cy, size, flip = false) {
    if (!img.complete) return;
    const w = size * 2, h = size * 2;
    if (flip) {
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(img, -w / 2, -h / 2, w, h);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    }
  }

  /** Draws a continuous shallow-water river ribbon through the edges this tile's river connects to. */
  _drawRiver(tile, screen, drawSize) {
    const ctx = this.ctx;
    const dirs = tile.riverDirs;
    if (!dirs || !dirs.length) return;
    const center = { x: screen.x, y: screen.y };
    const points = dirs.map(d => edgeMidpoint(center, drawSize, d));

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawPath = () => {
      ctx.beginPath();
      if (points.length === 1) {
        ctx.moveTo(center.x, center.y);
        ctx.quadraticCurveTo(center.x, center.y, points[0].x, points[0].y);
      } else {
        ctx.moveTo(points[0].x, points[0].y);
        ctx.quadraticCurveTo(center.x, center.y, points[1].x, points[1].y);
        for (let i = 2; i < points.length; i++) {
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(center.x, center.y);
        }
      }
    };

    // wide shallow-water bed
    drawPath();
    ctx.strokeStyle = PALETTE.waterShallow;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = drawSize * 0.36;
    ctx.stroke();

    // slightly darker edge for depth
    drawPath();
    ctx.strokeStyle = PALETTE.water;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = drawSize * 0.36;
    ctx.stroke();

    // bright foam centerline suggesting current/flow
    drawPath();
    ctx.strokeStyle = PALETTE.waterFoam;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = drawSize * 0.1;
    ctx.stroke();

    ctx.restore();
  }

  _drawOwnerBorder(tile, screen, drawSize, state) {
    const player = state.players.get(tile.owner);
    if (!player) return;
    const color = KINGDOMS[player.kingdomId].color;
    this.ctx.beginPath();
    this._hexPath(screen.x, screen.y, drawSize * 0.98);
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  screenToHex(sx, sy) {
    const world = this.camera.screenToWorld(sx, sy);
    return world;
  }
}
