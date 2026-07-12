# Cradle's Conquest (working title)

A turn-based 4X strategy game inspired by the geography and kingdoms of Africa
from antiquity through the medieval period — in the spirit of *Battle of
Polytopia*, built for the web with hex tiles, hand-drawn inline-SVG art, and
mobile-first touch controls.

## Status: Stage 1 of 5 complete

This delivery implements the **world & exploration foundation**. It is a
real, playable prototype: pick a kingdom, generate a fresh procedural
continent, pan/zoom the map, click tiles and units, see fog of war, and move
your starting Villager and Warrior around. Combat, city founding, tech, AI
opponents, and diplomacy are **not** implemented yet — see the roadmap below.

## How to run

No build step, no dependencies. It's plain ES modules.

1. Serve the folder over HTTP (ES modules require a server, not `file://`).
   Any static server works, e.g.:
   ```bash
   cd cradles-conquest
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in a browser (desktop or mobile).
3. Pick a kingdom, then pan (drag), zoom (scroll/pinch), and click tiles/units.
   Click a tile inside the gold highlight to move your selected unit there.
   Click "End Turn" to pass through the (currently silent) AI turns back to you.

## Architecture

```
index.html          Kingdom-select screen + in-game HUD shell
css/style.css        Design system: palette, type, HUD, responsive rules
js/
  hex.js              Flat-top axial hex math (pixel<->hex, neighbors, range, distance)
  noise.js            Seeded PRNG + fractal value noise (no external deps)
  worldgen.js         Procedural continent generation (biomes, rivers, resources, spawns)
  biomes.js           11 biome definitions + inline-SVG tile art generators
  resources.js        12 resource definitions + inline-SVG badge icons
  kingdoms.js         12 playable kingdoms, bonuses, inline-SVG crest emblems
  units.js            18 units across 4 tiers, stats, inline-SVG token art
  fog.js              Per-player fog of war (unexplored / remembered / visible)
  state.js            Players, unit instances, turn order, spawning, movement
  camera.js           Pan/zoom camera, screen<->world transforms
  renderer.js         Canvas 2D renderer (tiles, resources, units, fog, selection)
  main.js             App bootstrap: kingdom select, input handling, HUD wiring
```

All visual art (tiles, resource badges, kingdom crests, unit tokens, app icon)
is generated as **inline SVG strings** in JS — no emoji, no external art
files — then rasterized to cached `Image` objects for fast Canvas 2D
`drawImage` calls. This keeps the whole game a handful of dependency-free
files while still giving each biome/kingdom/unit distinctive, hand-drawn-style
art (mudcloth and kente-inspired geometric patterns, baobab/acacia/palm
silhouettes, dune and river motifs, etc).

### World generation

`worldgen.js` layers fractal value noise for elevation and moisture, then
uses **percentile thresholds** (not fixed cutoffs) for sea level and
mountain level so land/ocean ratio stays consistent (~66% land) regardless
of seed. Biome selection combines elevation, moisture, and a latitude
"aridity band" to loosely mirror the real continent's structure: rainforest
near the equatorial band, desert/sahel toward the map edges, highlands from
elevation, rivers carved downhill from highland sources (becoming Nile
Valley tiles), oases sprinkled rarely inside deserts, and mangroves along
warm coastlines.

### Design system

Palette is warm terracotta/gold/indigo/kente-green earth tones; display type
is `Yeseva One` (ornamental serif) over `Mukta` (humanist UI sans). HUD
panels, kingdom cards, and buttons share a consistent dark-wood-and-gold
frame language rather than default browser chrome.

## Roadmap (remaining stages)

**Stage 2 — Cities, Units & Combat**
City founding (Villager → city), population growth tied to Food/Housing/
Happiness, improvement selection on growth (Granary, Market, Temple, etc.),
full unit production queue, movement cost by biome (not flat range), melee/
ranged combat resolution, unit death/capture, borders expanding from cities.

**Stage 3 — Technology & Progression**
Full tech tree (Agriculture -> ... -> Architecture, plus Military/Economic/
Naval branches) with UI, tech unlocking units/buildings/wonders, Wonders
(Great Pyramid, Great Mosque, Great Library, etc.) with permanent empire
bonuses, kingdom-specific bonus hooks (the `bonus` text on each kingdom
becomes real modifiers).

**Stage 4 — AI Opponents & Diplomacy**
Turn-driven AI (multiple difficulty levels: expansion/military/economic
heuristics), diplomacy actions (alliances, trade agreements, military pacts,
tribute, marriage alliances, peace treaties), espionage.

**Stage 5 — Victory, Persistence & Polish**
All six victory conditions (Domination/Economic/Cultural/Religious/
Scientific/Wonder), IndexedDB save/load, full PWA offline support (service
worker + cache manifest + proper PNG icon set), animated unit
movement/combat, sound & music, and — optionally — Firebase multiplayer and
a fictional-kingdoms campaign mode.

## Known limitations of this build

- AI players exist as data (players 2-4) but take no actions; "End Turn"
  currently just cycles turns silently back to the human.
- No combat resolution yet — units can move onto empty passable land only.
- No cities, production, or tech yet.
- `manifest.json` references only an SVG icon; add PNG 192/512 icons before
  shipping to app stores / for best Android home-screen support.
- No service worker yet, so offline play isn't wired up despite the PWA
  manifest scaffold being present.
