# Cradle's Conquest (working title)

A turn-based 4X strategy game inspired by the geography and kingdoms of Africa
from antiquity through the medieval period — in the spirit of *Battle of
Polytopia*, built for the web with hex tiles, hand-drawn inline-SVG art, and
mobile-first touch controls.

## Status: Stage 5 of 5 complete, plus a visual overhaul pass

Stage 1 delivered the **world & exploration foundation**. Stage 2 added
**cities, production, and combat**. Stage 3 added **technology and
progression**. Stage 4 made the AI actually play the game and added
**diplomacy**. Stage 5 closes the loop: **all six victory conditions**
(Domination, Economic, Cultural, Religious, Scientific, Wonder) are now
checked every turn, with a real victory/defeat screen; **save/load via
IndexedDB** (an auto-save after every turn, a manual Save button, and a
"Continue" option on the start screen); **offline play** via a service
worker that precaches the entire app shell, plus a proper PNG icon set
(192/512, including maskable variants) so the game installs cleanly as a
home-screen app; **animation** (units slide between tiles, combat flashes
red on the units involved); and **procedural sound** — every effect
(movement, combat, city founding, research, construction, diplomacy,
victory/defeat) is synthesized live via the WebAudio API, so there are no
licensed audio assets to worry about, with a mute toggle in the HUD.

*Cradle's Conquest is now a complete, playable game from kingdom selection
through to a win condition.* See "Known limitations" below for the honest
list of what a real production launch would still want on top of this.

## How to run

No build step, no dependencies. It's plain ES modules.

1. Serve the folder over HTTP (ES modules require a server, not `file://`).
   Any static server works, e.g.:
   ```bash
   cd cradles-conquest
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in a browser (desktop or mobile).
3. If you've played before, a **Continue** button appears at the top of
   the start screen (loaded from the last auto-save). Otherwise pick a
   difficulty (Easy/Normal/Hard — this scales your AI rivals, not you) and
   a kingdom, then pan (drag), zoom (scroll/pinch), and click tiles/units.
   - Click a tile inside the gold highlight to move your selected unit there
     (movement costs biome-specific points, not just a flat tile count).
   - Click an adjacent/in-range enemy unit while yours is selected to attack
     it. If you're currently at peace with them, you'll be asked to confirm
     the war declaration first.
   - Select your Villager and click **Found City** in the tile panel to settle.
   - Click your own city to open its panel: watch growth, queue units/buildings/
     Wonders via **Add to Queue**, and pick a free improvement whenever it
     levels up.
   - Click the **Research** pill (top bar) to open the tech tree and pick
     what to research next; production and growth-choice menus grey out
     anything you haven't unlocked yet.
   - Click the **Diplomacy** pill to see every rival's relationship with you
     and propose Peace, Alliance, Marriage Alliance, Trade, Tribute, or
     just declare War outright.
   - Click **Progress** to see your standing toward each non-domination
     victory condition, and how many rival kingdoms are still alive.
   - Click **Save** anytime, or just trust the auto-save that runs after
     every full round of turns. The **♪** button mutes/unmutes sound.
   - Click "End Turn" to resolve your city economy and research, then watch
     the AI take real turns — settling, building, teching, and fighting —
     before control returns to you. Reach a victory condition (or lose all
     your cities and units) and a victory/defeat screen appears.

## Architecture

```
index.html          Kingdom-select screen + in-game HUD shell
css/style.css        Design system: palette, type, HUD, responsive rules
js/
  hex.js              Flat-top axial hex math (pixel<->hex, neighbors, range, edges, distance)
  noise.js            Seeded PRNG + fractal value noise (no external deps)
  worldgen.js         Procedural continent gen (biomes, edge-connected rivers, resources, spawns)
  biomes.js           11 biomes x 3 art variants + inline-SVG generators (African-art motifs)
  facetedArt.js       Shared medium-poly faceted-shading toolkit (canopy/rock/gem/peak facets)
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
  difficulty.js       Easy/Normal/Hard AI production & gold multipliers
  diplomacy.js        War/Peace/Alliance relationships, proposals, tribute, trade income
  ai.js               AI turn logic: settling, city production priorities, unit movement/combat
  victory.js          All six victory conditions + elimination tracking + progress snapshot
  save.js             GameState <-> plain JSON (de)serialization + IndexedDB persistence
  audio.js            Procedural WebAudio sound effects (no audio files/licensing)
  state.js            Players, units, cities, research, diplomacy, turn/economy orchestration
  camera.js           Pan/zoom camera, screen<->world transforms
  renderer.js         Canvas 2D renderer (variant art, dynamic rivers, fertile banks, animation)
  main.js             App bootstrap: kingdom/difficulty select, all UI panels, save/victory
sw.js                 Service worker: cache-first app shell for offline play
assets/
  icon.svg            Source app icon (baobab emblem)
  icon-192.png         192x192 PNG icon (generated from icon.svg via rsvg-convert)
  icon-512.png         512x512 PNG icon (generated from icon.svg via rsvg-convert)
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

## Visual overhaul (post-Stage-5 art pass)

After finishing the five-stage build, the tile art was reworked with three specific goals:
legibility (a player should classify terrain by color/shape alone, at a glance), authentic
and varied African art influence (not a single pattern reused everywhere), and rivers that
actually look like water flowing through the landscape instead of a decorative squiggle.

**Per-tile variation instead of one stamped image per biome.** Every biome now has 3
hand-authored art variants (different tree/rock/pattern placement and a subtle palette
shift), and `worldgen.js` assigns each tile a deterministic `artVariant` (0-2) and
`artFlip` (boolean) at generation time. The renderer picks the matching cached image and
mirrors it when flipped. On a 1,000+ tile map this breaks up the "obviously tessellated"
look a single image would create, without the performance cost of actually regenerating
unique art per tile every frame — true per-frame procedural painting at this tile count
isn't practical in a browser at 60fps, so this deterministic-variation approach is the
practical middle ground between "one static image" and "everything is unique."

**African art influences, deliberately varied by biome** rather than one motif everywhere:
bogolanfini/mudcloth-style triangle rows (Mali) for the arid west (Sahara, Sahel, savanna),
a Kuba-cloth-inspired diamond lattice (Kuba Kingdom, Congo Basin) for the rainforest floor,
an Ndebele-inspired color-blocked terrace band (South Africa) as one of the highland
variants, small Adinkra-style waymarker stamps (Akan, Ghana) scattered sparingly across
grassland, and San-rock-art-style ochre dot clusters in the desert. New flora silhouettes
were added too: candelabra euphorbia (a highland/savanna icon distinct from acacia),
papyrus reed clusters for riverbanks, and termite mounds as a small savanna landmark detail.

**Color psychology tuning.** Coast was reworked from "mostly sand" to "mostly turquoise
water with a sandy fringe" (it's a water tile — it should read as one). Rift Highlands
got a cooler, more dramatic slate-green gradient. Nile Valley got a richer, more saturated
fertile gradient. Every biome's palette was checked for enough hue/lightness separation
from its likely neighbors to stay readable at a glance — the closest thing this project
does to applying "game theory" to art: the map is a shared-information surface both the
player and the AI reason over, so misreadable terrain is a usability bug, not just an
aesthetic one.

**Rivers now flow continuously across tile edges.** Previously each Nile Valley tile drew
an isolated decorative S-curve; there was no relationship between a river tile's water
and its neighbor's. Now `worldgen.js` records, for every river tile, which hex edge(s) its
river connects through (`riverDirs`), using the same directional math as the hex grid
itself (`hex.js` gained `directionToEdgeIndex`/`edgeMidpoint`/`directionBetween` helpers,
numerically verified against the actual neighbor-tile geometry). The renderer draws a
layered shallow-water ribbon (wide bed + soft depth edge + a brighter foam centerline)
from edge-midpoint to edge-midpoint through each river tile, so a river visibly winds
across the whole map instead of looking like separate puddles. I validated this with a
headless canvas render of an actual generated river network before shipping it — screenshots
below the fold in the repo history, but the short version is: it connects correctly,
including at confluence points where two river branches merge.

**Fertile riverbanks.** Any tile — regardless of biome — that's adjacent to a river now
gets `isRiverBank = true` and a translucent green "fertile" overlay with small crop
sprouts, drawn under the river itself. This means a desert tile next to the Nile actually
looks like it's benefiting from the water, the way the real Nile Valley's fertile strip
looks against the surrounding Sahara.

### Honest note on "fully dynamic" map drawing

You asked whether the map could be drawn dynamically for a more realistic look. True
per-frame procedural generation (repainting every tile uniquely on the fly, every frame)
isn't practical here — at 1,000+ tiles and 60fps, that's a different performance budget
than a cached-image approach can give you, and would likely require moving off Canvas2D
entirely (WebGL with instanced/shader-based terrain, similar to what a AAA strategy game
would do). What's implemented instead — 3 variants + flip per biome, chosen deterministically
per tile, plus genuinely dynamic (not pre-baked) river rendering — gets most of the visual
benefit (no obvious tiling/stamping, rivers that respond to actual world geometry) while
staying comfortably within a static-file, dependency-free web app's performance envelope.
If true per-tile uniqueness ever becomes a priority, the next step up would be WebGL
instanced rendering with per-instance random attributes fed to a fragment shader — a
substantial rendering-engine rewrite, not a tweak.

## Visual overhaul, part 2 (units, cities, UI chrome)

Following the biome/river pass, the same treatment was applied to the two other things
on screen constantly — units and cities — plus a general UI polish pass.

**Units** went from flat single-color glyph outlines to a proper tiered system:
every token now sits on a medallion frame that escalates with tier (plain wood for basic,
bronze for advanced, gold with corner studs for elite, a radiant gold sunburst for
legendary) — independent from the kingdom-colored ring the renderer draws around it, so
ownership and power level are two separate, simultaneously-readable signals rather than
one channel overloaded with two meanings. Mounted/beast units (horse, camel, elephant)
were rebuilt as bold single-silhouette "pictogram" shapes after an early version with
separately-layered body parts didn't read clearly at the size units actually render at —
worth noting since it's a good example of the size-appropriate-silhouette principle
mattering more than surface detail for a strategy game's unit tokens.

**Cities** gained a fourth tier (capital metropolis, population 10+, with monumental
gold-trimmed stone architecture) and now visually reflect two pieces of city state that
used to be invisible on the map: a stone wall ring appears once a city has built Walls,
and capitals get a small gold finial. Architecture escalates the same way unit gear does —
thatch and wood at the low end, mud-brick next, then dressed stone with a market street,
then monumental capital stonework.

**UI chrome** got a depth pass: HUD panels, modals, and cards previously sat flat against
the background; they now carry real drop shadows and a woven mudcloth-triangle trim strip
along their top edge, consistent with the pattern language already used in the tile art.

I validated the unit art specifically by rendering every token to PNG and reviewing them
in a grid before and after — the horse/camel/elephant redesign in particular went through
two visible iterations because the first pass didn't read clearly at a glance, which is
the actual bar for a strategy game's unit icons (recognizable in under a second, not
beautiful under inspection).

## Visual overhaul, part 3 (resources, crests, and a contrast bug fix)

**Bug fix:** the Zulu kingdom's card color (`#2A1B10`) was identical to the kingdom-select
card's own background color, making the name "Zulu" literally invisible — not just low
contrast, the exact same color. This is now fixed as part of a broader palette pass: all
12 kingdoms previously shared some colors (three used the same red, two used the same
green, two used the same gold), which hurt both the start screen and in-game territory
borders, since the same `color` field drives the card's name/accent, the kingdom badge,
and the on-map territory border and unit ring. All 12 now use genuinely distinct hues
(gold, terracotta-red, emerald, amber-orange, steel-blue, burgundy, grey-blue, true red,
magenta, teal, olive, and Tyrian purple for Carthage — a nod to the historical Phoenician
dye trade) chosen to stay legible as text against a near-black card background.

**Kingdom crests** got more detail and, where it fit, sharper historical grounding: Carthage's
emblem is now the Sign of Tanit (the actual Phoenician/Punic symbol), Aksum's is a stepped
obelisk referencing the real Aksumite stelae, and Zulu's is a black-and-white cowhide-pattern
shield reflecting real Zulu shield design instead of an abstract diamond.

**Resource icons** were redone with the same "encode a second signal in the frame" idea as
units: the ring around each icon now tells you its category before you even look at the
symbol inside — plain gold ring for basic resources, a steel double-ring for strategic
resources (the ones that unlock specific units), gold ring with small corner sparkles for
luxury resources (the ones that unlock wonders/bonuses).

**Territory borders and the movement-range highlight** were both increased in visibility
per feedback that they were hard to spot against busy terrain art: borders now draw a dark
contrast pass underneath the kingdom color (so they read against any biome, not just dark
ones) and are noticeably thicker; the reachable-tiles highlight when a unit is selected
switched from a dim gold wash to a vivid, gently pulsing green (chosen deliberately — green
reads universally as "you can go here" rather than reusing gold, which is already doing
double duty as the UI's accent color elsewhere), and the selected-tile ring got a soft glow
behind a brighter core stroke.

## Visual overhaul, part 4 (tree realism, unit scale)

Two more rounds of feedback: the trees were hard to identify without already knowing what
they were meant to be, and units were too small on the tile to make out their details.

**Trees were rebuilt around each species' actual defining silhouette** instead of generic
blob-and-ellipse shapes. The baobab is the clearest example — it previously used the same
"trunk + round canopy" template as any other tree, which is exactly backwards, since a
baobab's whole visual identity is that it does *not* look like a normal tree: a massive
bulbous barrel trunk topped by sparse, gnarly, almost root-like branches (hence "the
upside-down tree"). It's rebuilt that way now, with a gradient down the trunk for volume
and small sparse leaf-tufts rather than a full canopy. The acacia was rebuilt around its
own defining feature — a wide, flat-topped umbrella canopy with a lit top and shadowed
underside — instead of a rounded blob. Euphorbia (candelabra tree) and palm both got
gradient shading for the same reason: a flat silhouette reads as a generic "tree-shaped
blob" regardless of species, while volume and a species-correct outline is what actually
makes each one identifiable without a caption.

**Units are now ~45% larger** on the tile (the on-screen token size factor went from 0.62
to 0.9 of the hex's effective size). I checked the geometry before shipping it: at this
size a unit token is about half the hex's flat-to-flat width and comfortably inside the
hex's corner radius, so tokens don't visually collide with units standing on adjacent
tiles even at the largest zoom level — bigger without creating a new legibility problem
in the process.

## Visual overhaul, part 5 (units: silhouette to sprite)

The previous unit pass fixed proportions and tiering but kept every unit as a flat,
single-color silhouette — which was the actual root cause of "I can't tell the horse
from the camel from the elephant": with no internal shading, three different animals in
the same brown was fundamentally a color-matching problem, not a shape one.

Units now use a small "sprite" toolkit applied consistently across all 20: a dark outline
on every major shape (the single highest-impact change — crisp edges separate adjacent
similarly-colored forms in a way flat silhouettes can't), skin tone kept visually distinct
from cloth/armor color, a light/shadow two-tone pass on rounded forms for volume, and a
small eye dot on every face and animal head so it reads as a character rather than a
paper cutout.

The animals were rebuilt around this directly: horse (warm brown, dark mane strokes at
the neck), camel (sandy tan — a completely different hue from horse, plus a visible hump
silhouette), and elephant (grey, with a large ear and visible curled trunk) no longer
share a palette or a silhouette template. Human units got the same treatment — cloth
tunic color is now separate from skin tone, with a small role-colored sash (red for
melee, green for ranged, indigo for defensive/elite) adding another at-a-glance signal
on top of the existing tier-frame and weapon-material system.

## Visual overhaul, part 6 (cities and walls: same sprite toolkit)

The sprite toolkit from the unit pass (dark outlines on every shape, buildings split into
a lit half and a shadowed half instead of one flat fill) is now applied to city art and
building icons too, for the same reason: flat single-tone shapes read as silhouettes, not
structures.

**City tiles** (huts, stone buildings, the capital's monumental core) all now have
two-tone roofs and walls for real volume. The **fortified wall ring** got the most
substantial rework — it was a plain grey ellipse before, which didn't read as a
fortification at all. It's now built from individually placed crenellations (battlements)
sampled around the front-facing arc, plus a small two-tower gatehouse with a dark gate
opening, so a walled city is now visually unmistakable from an unwalled one at a glance,
not just "the ellipse is present or absent."

**The 8 building improvement icons** (Granary, Market, Temple, Walls, Forge, Harbor,
University, and the capital's Palace) got the same treatment — outlined, two-tone roofs
and facades, and small material details (the Forge's furnace now actually glows, the
Walls icon shows crenellations along the top instead of a flat bar).

## Visual overhaul, part 7 (tree clipping fix, mountains, resources, crests, coast)

**Trees were being cut off at hex edges** — confirmed by rendering every biome variant at
high resolution and looking closely, several baobabs were losing their branch tips against
the hex boundary. Root cause: the baobab's branch reach (49 units from its anchor point at
scale 1) was large relative to the hex's own radius (50 units), so any placement that
wasn't dead-center could clip. Fixed two ways: the baobab and acacia silhouettes are now
meaningfully more compact (baobab's branch reach dropped from 49 to 33 units), and I wrote
a small point-in-polygon checker that tests every tree placement's bounding box against the
actual hex clip path — it caught 10 remaining risky placements across the savanna, sahel,
baobab forest, and rift highlands variants, which are now repositioned with safe margins.
Zero flagged placements remain.

**Mountains, resource icons, and kingdom crests** all received the same sprite treatment
as units/cities/buildings: a dark outline on every shape, plus (for mountains specifically)
each peak split into a lit face and a shadowed face instead of one flat triangle, so ranges
have real form instead of reading as a flat paper cutout silhouette.

**Coast tiles no longer show sand.** They previously rendered a sandy beach fill across
the bottom third of the tile, which visually implied "you can walk here" even though coast
is a water tile that land units can't enter — a genuine information/art mismatch, not just
a style preference. Coast is now entirely water-toned (turquoise, brighter than deep ocean)
with faint pale patches suggesting a visible sandy seafloor through clear shallow water,
rather than dry land above the waterline.

## Visual overhaul, part 8 (mounted units rebuilt: rider actually rides the mount)

Direct feedback: the horseman looked like a man standing next to a horse, the camel
rider's body blended into the camel's, the elephant rider's elephant was hard to make
out, and the war chariot showed the cart in front of the horse instead of behind it.
All four were rebuilt from scratch, each iterated against actual renders (not just code)
until the composition read correctly:

- **Horseman** — the horse got a straighter, wedge-profiled head (the previous curved
  neck read more like a goose than a horse) and a clear back/withers line; the rider now
  sits astride it with legs visibly draping down both flanks, rather than standing beside it.
- **Camel rider** — first attempt gave the rider dangling legs like the horseman, but on
  a camel those legs visually collided with the hump into a confusing blob. Fixed by
  seating the rider on a saddle blanket draped *over* the hump with no dangling legs
  (consistent with how camel riders are actually depicted) — hump and rider read as two
  distinct things again.
- **Elephant rider** — the elephant itself was rebuilt with an unmistakable fan ear,
  curled trunk, and tusk (previously just a grey blob), topped with a small canopy
  howdah the rider stands in, clearly above the elephant's shoulders.
- **War chariot** — completely reordered. The horse is harnessed at the front (right
    side, facing forward), connected by a visible pole/yoke to the cart trailing behind it
  (left side) with two wheels and a charioteer standing inside holding the reins and a
  raised spear — horse pulls, chariot follows, exactly as requested.

All of these (plus Siege Tower and Catapult, per the request to consider scale) now
render at 12-18% larger scale than other units — `token()` gained an optional `scale`
parameter that enlarges both the medallion frame and the artwork together, so the extra
detail these compositions need actually has room to be legible rather than being
squeezed into the same footprint as a single standing archer.

## Visual overhaul, part 9 (medium-poly faceted art direction)

After several rounds of flat-vector polish, the art direction shifted toward a
**faceted, medium-poly look** — the same visual language used in premium isometric
strategy-game art (distinct flat polygon facets under one consistent light source,
rather than smooth gradients or flat silhouettes). The engine and camera are
**unchanged** — this was explicitly scoped as an art-layer swap, not a rendering
rewrite (an earlier true-isometric-extruded-tile prototype was built and then set
aside once it was clear that wasn't actually what was wanted; it would have required
real changes to `renderer.js`'s draw order and `hex.js`'s tile math, which flat
faceted art does not).

**New shared module: `facetedArt.js`.** A small reusable toolkit — `facetedCanopy`,
`facetedTrunk`, `facetedRock`, `facetedGem`, `facetedPeak`, `facetedTuft`,
`facetedWaterGleam`, `facetedCrop`, `contactShadow` — used by every other art file so
the faceting language (light facet upper-left, base facet center, dark facet
lower-right, one consistent "light source") stays consistent across biomes, resources,
crests, and units instead of each file inventing its own shading convention.

**Biomes**: baobabs, acacias, euphorbia, and palms were rebuilt as genuine faceted
3D-looking forms (a baobab trunk is now three vertical color facets suggesting a round
barrel, not a flat gradient silhouette; an acacia's umbrella canopy is a fan of
alternating light/dark triangular facets). Mountains and the volcanic cone got the
same treatment — each peak is a real 3-facet form (lit slope / ridge / shadowed slope)
instead of one flat triangle. Water ripple strokes were replaced with faceted diamond
gleam highlights for consistency.

Rebuilding the trees larger surfaced a real regression risk: the new faceted baobab's
branches initially reached further than the previous (already clip-tested) version,
which would have reintroduced the tree-clipping bug fixed earlier. Caught this with
the same point-in-polygon boundary checker built for that earlier fix, re-ran it
against the new geometry, found 9 of 30 placements newly at risk, compacted the
faceted baobab/acacia back down, and confirmed zero clipping risk before shipping.

**Resources**: gold, gems, salt, iron, and copper are now real faceted crystal/gem/
ore forms (`facetedGem`, built from 7 triangular facets around a peak) instead of
flat layered ellipses/polygons — these read as *objects* now, not icons standing in
for objects.

**Kingdom crests**: the shield backing switched from a smooth two-color gradient to
three flat faceted panels (matching the same light-source convention as everything
else), computed from each kingdom's two brand colors via small new `liftColor`/
`mixColor` hex-math helpers (also added to `units.js` for the same purpose).

**Units**: rather than re-deriving all 20 hand-tuned compositions from scratch (risking
the mount-clarity fixes from the previous round), the shared body-part functions
(`head`, `torso`, `roundShield`, `towerShield`) and the horse/camel/elephant bodies
were upgraded in place to true 3-facet shading — this cascades the faceted look across
every unit that reuses them without touching each unit's individually-tuned pose.

**Buildings & city art**: building icons already had 2-tone shading from an earlier
pass; city huts and stone buildings gained a thin ridge-cap highlight line at the roof
apex for a touch more dimensionality, consistent with the same light-source direction.

Every category was verified after the change: full syntax + AST-parse scan across all
files (this workflow has previously caught a swallowed-function-inside-unterminated-
comment bug from a bad find-and-replace — same class of bug recurred once during this
pass and was caught the same way), plus a 100-turn full-game regression (world gen,
founding, research, production, combat, AI turns) to confirm the art swap didn't touch
game logic.

## Visual overhaul, part 10 (buildings, code cleanup)

**Code cleanup**: `kingdoms.js` and `units.js` each had their own copy of identical
hex-color-math helpers (`hexToRgb`/`rgbToHex`/`liftColor`/`mixColor`), introduced
independently in the last two rounds. Moved the single implementation into
`facetedArt.js` (which both files already depended on) and had both import it —
real duplication risk removed, not just a style nit: two copies of the same logic
drifting apart over future edits was the actual failure mode being avoided.

**Buildings**: the 8 improvement icons (Granary, Market, Temple, Walls, Forge,
Harbor, University, Palace) gained the same third-facet ridge-highlight treatment
already used on city roofs and mountain peaks. The Forge's furnace glow was rebuilt
using the shared `facetedGem` helper (matching the game's other ember/lava/gem
moments) instead of a flat circle-in-circle. The Walls icon's stone blocks and
crenellations now alternate light/dark facets instead of a uniform fill, consistent
with the fortification treatment on the map's city art.

**City art**: the small palm-tree accent used in coastal/riverside city tiles now
reuses the faceted-frond language from the biome palm tree instead of a separate,
older flat-silhouette version — one fewer inconsistent tree style in the game.

Verified with the full syntax + AST-parse scan, the tree-clipping boundary checker
(re-confirmed zero risk — this pass didn't touch tree geometry, but re-running a
cheap check costs nothing and catches regressions from unrelated edits), and a
100-turn game regression exercising the newly-faceted Walls and Forge buildings
specifically.

## Visual overhaul, part 11 (tech tree and wonders — the last flat-style holdouts)

Auditing every art file against the faceted style turned up a real gap: `tech.js`
(18 technology icons) and `wonders.js` (8 wonder icons) had never been touched by
any of the previous art passes — they were still in their original single-flat-
shape-per-icon style from Stage 3, predating even the "sprite" round. Since these
are prominent, frequently-viewed progression UI (the tech tree modal, the wonder
picker in every city's production menu), that's a real inconsistency worth closing
rather than a minor gap.

**All 18 tech icons** were rebuilt: the wheat sheaf, ram's horn, bronze/iron ingots,
gear, monument, spear, shield, horse head, catapult, trade amphorae, market stall,
coin (now a real `facetedGem`), caravan, fish, sail, compass star, and ship hull are
all now faceted 2-4-facet forms instead of one flat shape each, with the hex badge
frame gaining a subtle faceted highlight panel to match the same convention used on
resource/wonder badges.

**All 8 wonder icons** were rebuilt with real faceted monumental architecture: the
Great Pyramid is a proper two-facet (lit-left/shadowed-right) pyramid instead of a
flat triangle, the Great Mosque has a faceted dome and twin minarets, Stone Circles
are individual two-facet monoliths instead of flat circles, the Obelisk has a
faceted gold capstone gem, and the Royal Mint's icon changed from a circle with
literal "Au" text to a faceted coin stack topped with a gem — more in keeping with
an icon-based UI than a text abbreviation.

Verified with the same three-part check used throughout this art pass: full syntax
+ AST-parse scan (still zero issues), the tree-clipping boundary checker (still
zero risk — confirms unrelated files weren't touched), and a dedicated 300-turn
regression that plays through the real tech tree and constructs three different
wonders end-to-end to confirm research completion and wonder-uniqueness-locking
still work correctly after the icon swap.

## What's deliberately not included

The original concept doc mentioned two explicitly optional items which this
build does not attempt, since they require infrastructure (a live backend,
licensed/composed music) outside the scope of a static, dependency-free
web app:

- **Firebase multiplayer.** The architecture doesn't preclude it — `state.js`
  is a plain, serializable object graph, and `save.js` already proves the
  round-trip — but real-time sync, matchmaking, and a hosted backend are a
  separate project.
- **A fictional-kingdoms campaign mode.** The engine supports it structurally
  (a campaign would just be a sequence of pre-seeded `GameState`s with
  scripted victory conditions), but no campaign content has been written.
- **Music.** Sound effects are procedural (see `audio.js`), but ambient
  /theme music would need either composed audio assets or a much more
  elaborate WebAudio synthesis system than fits here.

## Known limitations of this build

- AI is heuristic, not lookahead/minimax — it makes locally sensible
  decisions each turn (defend first, expand opportunistically, attack
  weaker/nearby targets at a difficulty-scaled rate) rather than pursuing
  a long-term grand strategy. It also doesn't yet coordinate multiple units
  into a single attack, or specifically target the human over other AIs.
- AI never proposes diplomacy to the human proactively except a small
  chance of seeking peace when it's losing badly a war — it won't offer
  alliances or trade unprompted. All AI-initiated proposals are evaluated
  reactively when *you* propose to *them*.
- No espionage yet (listed in the concept doc's Diplomacy section but not
  implemented — spying, sabotage, and intel-gathering are a good candidate
  for Stage 5 polish or a future update).
- No happiness/security mechanical effects yet (tracked on `City`, and
  Yoruba/Benin's happiness-related bonuses feed the number, but nothing
  consumes it) — unrest and rebellion would be a natural next addition.
- Unit stacking is disallowed (one unit per tile) and there's no unit
  "advance after kill" — the attacker stays put even if the defender dies.
- Victory thresholds (1500 gold, 600 culture, 5 temples, all 18 techs, 5
  of 8 wonders) are tuned by playtesting feel rather than rigorous balance
  — they're all in one place (`victory.js`) if they need adjusting.
- There's a single auto-save slot plus one manual "Save" button that writes
  to that same slot; there's no multiple-save-slot UI yet, and no delete-save
  button in the Continue flow (only `deleteSave()` exists in `save.js`).
- The service worker precaches the app shell for offline *play*, but the
  Google Fonts request is still network-first with a cache fallback, so the
  very first load needs connectivity to fetch the display typeface.
