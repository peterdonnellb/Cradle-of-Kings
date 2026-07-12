# Cradle's Conquest (working title)

A turn-based 4X strategy game inspired by the geography and kingdoms of Africa
from antiquity through the medieval period — in the spirit of *Battle of
Polytopia*, built for the web with hex tiles, hand-drawn inline-SVG art, and
mobile-first touch controls.

## Status: Stage 3 of 5 complete

Stage 1 delivered the **world & exploration foundation**. Stage 2 added
**cities, production, and combat**. Stage 3 adds **technology and
progression**: a full four-branch tech tree (Core, Military, Economic,
Naval — 18 techs total) that gates units and buildings behind research,
8 world Wonders with permanent empire-wide bonuses, and — importantly —
every kingdom's bonus text from the concept doc is now a real, numeric
effect wired into combat, movement, and city economy (Kush archers really
do hit harder at range, Ethiopia really does ignore the highland movement
penalty, Kemet really does build Wonders cheaper next to rivers, and so on).
AI opponents now also research technology on their own (picking randomly
from what's available) in addition to growing/producing, though they still
don't move, attack, found cities, or choose what to build — that's Stage 4.
See the roadmap below for what's still ahead.

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
   - Click a tile inside the gold highlight to move your selected unit there
     (movement costs biome-specific points, not just a flat tile count).
   - Click an adjacent/in-range enemy unit while yours is selected to attack it.
   - Select your Villager and click **Found City** in the tile panel to settle.
   - Click your own city to open its panel: watch growth, queue units/buildings/
     Wonders via **Add to Queue**, and pick a free improvement whenever it
     levels up.
   - Click the **Research** pill (top bar) to open the tech tree and pick
     what to research next; production and growth-choice menus grey out
     anything you haven't unlocked yet.
   - Click "End Turn" to resolve your city economy and research, then
     auto-pass through the AI turns (who now also research, but don't yet
     act) back to you.

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
  kingdoms.js         12 playable kingdoms, bonuses (+ numeric `effects`), inline-SVG crests
  kingdomEffects.js   Applies each kingdom's numeric bonus to combat/movement/city economy
  units.js            18 units across 4 tiers, stats, tech/resource gates, inline-SVG art
  buildings.js        8 city improvements, cost/effects, tech gates, inline-SVG icon badges
  tech.js             18-tech, 4-branch tech tree (Core/Military/Economic/Naval) + unlock logic
  wonders.js          8 world Wonders, tech-gated, one-per-world, empire-wide bonuses
  cities.js           City founding, territory, full yields (food/prod/gold/culture/science), growth
  cityArt.js          Inline-SVG settlement marker, tiered by population (hamlet/town/city)
  combat.js           Attack resolution (terrain + kingdom bonuses), unit death, city capture
  movement.js         Dijkstra reachable-tiles & path for per-biome movement cost
  fog.js              Per-player fog of war (unexplored / remembered / visible)
  state.js            Players, units, cities, research, turn order, combat/production orchestration
  camera.js           Pan/zoom camera, screen<->world transforms
  renderer.js         Canvas 2D renderer (tiles, resources, units, cities, fog, selection)
  main.js             App bootstrap: kingdom select, input, city/tech/production/growth UI, combat
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

- AI players research technology and grow/produce their cities
  automatically (auto-picking the first growth-improvement option and a
  random available tech), but they never queue anything into production
  themselves, move units, attack, or found new cities. Real AI
  decision-making is Stage 4.
- Production queues are never auto-filled for AI cities, so AI production
  capacity currently accumulates without being spent — visually harmless,
  but it means AI empires won't grow militarily until Stage 4 gives them
  a production strategy too.
- No happiness/security mechanical effects yet (tracked on `City`, and
  Yoruba/Benin's happiness-related bonuses feed the number, but nothing
  consumes it) — unrest, rebellion, etc. land in a later stage alongside
  religion/culture victory tracking.
- Wonder effects are recomputed fresh each turn from `player.wonders`,
  which is simple and correct but means there's no UI yet listing "your
  empire's active bonuses" in one place — you can see them city-by-city
  in the improvements row.
- Unit stacking is disallowed (one unit per tile) and there's no unit
  "advance after kill" — the attacker stays put even if the defender dies.
- `manifest.json` references only an SVG icon; add PNG 192/512 icons before
  shipping to app stores / for best Android home-screen support.
- No service worker yet, so offline play isn't wired up despite the PWA
  manifest scaffold being present.
- No save/load (IndexedDB) yet — refreshing the page loses your game.
