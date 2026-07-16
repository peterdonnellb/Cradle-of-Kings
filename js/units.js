// units.js — Volumetric Unit Tokens + Inline SVG Art
//
// Art Direction Update:
// - Tiered medallion frames (wood/bronze/gold) dictate power levels as before[cite: 1].
// - Characters are fully rendered in a low-poly 3D style (full body, limbs, and gear).
// - Base character figures feature female proportions.
// - All sprites default to facing the left side of the frame.
// - Mounts are massively scaled with fully seated, visible riders.

const C = {
  skinLit: '#D09A72', skinMid: '#A6724E', skinShad: '#7A4D30',
  clothLit: '#E8D4A2', clothMid: '#C4AE75', clothShad: '#9C864D',
  woodLit: '#A87A51', woodMid: '#825630', woodShad: '#593618',
  steelLit: '#D2D7DD', steelMid: '#9CA4AC', steelShad: '#68727B',
  goldLit: '#FBE18D', goldMid: '#D4B44A', goldShad: '#9C8128',
  eleLit: '#A1A3A6', eleMid: '#74777A', eleShad: '#4D5054',
  hair: '#1A120D', outline: 'none' // Outlines removed in favor of high-contrast facets
};

// Medallion framework logic remains functionally identical[cite: 1]
function token(tier, figure, scale = 1) {
  const bg = '#2E241A';
  const rim = tier === 'elite' ? C.goldMid : C.woodMid;
  const figureGroup = `<g transform="translate(32,32) scale(${scale}) translate(-32,-32)">${figure}</g>`;
  
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="${bg}" stroke="${rim}" stroke-width="2.5"/>
    <ellipse cx="32" cy="52" rx="14" ry="3" fill="#000" opacity="0.4"/>
    ${figureGroup}
  </svg>`;
}

// --- Low-Poly Character Parts (Facing Left) ---------------------------------

/** Fully rendered female base figure - Volumetric low-poly */
function polyFemaleVillager() {
  return `
    <!-- Back Leg (Left) -->
    <polygon points="26,48 24,56 28,56 30,48" fill="${C.skinShad}"/>
    <!-- Front Leg (Right) -->
    <polygon points="34,48 32,58 37,58 38,48" fill="${C.skinMid}"/>
    
    <!-- Torso/Tunic (Female Proportions) -->
    <polygon points="28,26 23,40 33,48 38,38 35,26" fill="${C.clothMid}"/>
    <polygon points="28,26 23,40 30,44 33,28" fill="${C.clothLit}"/>
    <polygon points="33,28 30,44 33,48 38,38 35,26" fill="${C.clothShad}"/>
    
    <!-- Left Arm (Holding Tool) -->
    <polygon points="26,28 20,38 23,40 28,32" fill="${C.skinMid}"/>
    
    <!-- Head (Facing Left) -->
    <polygon points="30,16 24,18 26,24 32,26 36,20" fill="${C.skinMid}"/>
    <polygon points="30,16 24,18 28,22 32,18" fill="${C.skinLit}"/>
    <!-- Hair -->
    <polygon points="32,14 28,16 30,18 36,18 38,16" fill="${C.hair}"/>
    <polygon points="36,18 34,26 38,24 38,16" fill="${C.hair}"/>
    
    <!-- Wooden Tool/Spear -->
    <polygon points="18,48 20,48 26,22 24,22" fill="${C.woodMid}"/>
  `;
}

/** Massive War Elephant - Full volumetric rendering */
function polyWarElephant() {
  return `
    <!-- Back Legs -->
    <polygon points="18,40 16,54 22,54 24,40" fill="${C.eleShad}"/>
    <polygon points="42,40 40,54 46,54 48,40" fill="${C.eleShad}"/>
    
    <!-- Massive Body -->
    <polygon points="12,24 8,42 48,42 54,26 34,16" fill="${C.eleMid}"/>
    <polygon points="12,24 34,16 40,28 18,34" fill="${C.eleLit}"/>
    <polygon points="18,34 40,28 48,42 8,42" fill="${C.eleShad}"/>
    
    <!-- Head & Trunk (Facing Left) -->
    <polygon points="22,18 8,24 10,36 18,34" fill="${C.eleMid}"/>
    <polygon points="8,24 2,38 6,48 10,36" fill="${C.eleMid}"/>
    <polygon points="2,38 6,48 4,40" fill="${C.eleLit}"/>
    
    <!-- Tusk -->
    <polygon points="10,34 0,30 2,36 10,38" fill="${C.clothLit}"/>
    
    <!-- Giant Ear -->
    <polygon points="24,18 16,28 26,38 32,24" fill="${C.eleShad}"/>
    
    <!-- Front Legs -->
    <polygon points="24,38 22,56 30,56 32,38" fill="${C.eleMid}"/>
    <polygon points="24,38 22,56 26,56 28,38" fill="${C.eleLit}"/>
    
    <polygon points="46,38 44,56 52,56 54,38" fill="${C.eleMid}"/>
  `;
}

/** Howdah Platform with seated full-body rider */
function polyHowdahRider() {
  return `
    <!-- Howdah Base -->
    <polygon points="28,16 22,22 42,22 46,16" fill="${C.woodMid}"/>
    <polygon points="22,22 42,22 42,26 22,26" fill="${C.woodShad}"/>
    <polygon points="28,16 22,22 42,22 46,16" fill="${C.goldMid}" opacity="0.3"/>
    
    <!-- Rider (Female, Facing Left) -->
    <!-- Torso -->
    <polygon points="32,8 28,16 36,16" fill="${C.clothMid}"/>
    <!-- Head -->
    <polygon points="34,4 28,6 30,10 36,8" fill="${C.skinMid}"/>
    <!-- Spear -->
    <polygon points="22,18 24,18 34,-2 32,-2" fill="${C.steelLit}"/>
    
    <!-- Howdah Side Rails -->
    <polygon points="26,12 24,24 28,24 30,12" fill="${C.woodMid}"/>
    <polygon points="42,12 40,24 44,24 46,12" fill="${C.woodMid}"/>
  `;
}

const FIGURES = {
  villager: () => polyFemaleVillager(),
  elephant_rider: () => `${polyWarElephant()}${polyHowdahRider()}`,
};

function svgFor(id, tier, scale = 1) {
  const fig = FIGURES[id];
  return token(tier, fig ? fig() : '', scale);
}

export const UNITS = {
  villager: { id: 'villager', name: 'Villager', tier: 'basic', svg: svgFor('villager', 'basic') },
  elephant_rider: { id: 'elephant_rider', name: 'Elephant Rider', tier: 'elite', svg: svgFor('elephant_rider', 'elite', 1.05) },
  // Additional units follow this volumetric construction model...
};
