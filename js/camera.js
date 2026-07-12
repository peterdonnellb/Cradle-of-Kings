// camera.js — Pan & zoom camera for the hex map canvas

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0; // world-space pixel offset (top-left of view)
    this.y = 0;
    this.zoom = 1;
    this.minZoom = 0.35;
    this.maxZoom = 2.2;
  }

  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom,
      y: (wy - this.y) * this.zoom,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: sx / this.zoom + this.x,
      y: sy / this.zoom + this.y,
    };
  }

  pan(dx, dy) {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
  }

  zoomAt(screenX, screenY, factor) {
    const before = this.screenToWorld(screenX, screenY);
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * factor));
    const after = this.screenToWorld(screenX, screenY);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  centerOn(wx, wy) {
    this.x = wx - this.canvas.width / (2 * this.zoom);
    this.y = wy - this.canvas.height / (2 * this.zoom);
  }
}
