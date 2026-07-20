// tech.js — Technology tree: four branches (Core, Military, Economic, Naval),
// each tech unlocking units/buildings/wonders. Cost is in accumulated Science points.

import { facetedGem } from './facetedArt.js';

const OUT = '#1C1208';

function icon(inner, bg = '#2E6B4F') {
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="${bg}" stroke="${OUT}" stroke-width="1.5"/>
    <polygon points="20,2 37,11 20,20 3,11" fill="#fff" opacity="0.08"/>
    ${inner}
  </svg>`;
}

const glyphs = {
  // wheat sheaf: faceted blade pairs instead of one flat teardrop
  agriculture: `<polygon points="20,28 17,16 20,10 20,28" fill="#F1CE73" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,28 23,16 20,10 20,28" fill="#D8A93A" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,22 14,17 17,13 20,18" fill="#E8C266" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="20,22 26,17 23,13 20,18" fill="#C29A4C" stroke="${OUT}" stroke-width="0.6"/>
    <rect x="19" y="24" width="2" height="8" fill="#4A3427"/>`,
  // faceted ram's-horn/animal head instead of two flat ellipses
  animal_husbandry: `<polygon points="10,26 12,20 20,19 22,24 18,29" fill="#F6EFDD" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,19 28,18 30,23 22,24" fill="#D8CBA8" stroke="${OUT}" stroke-width="0.7"/>
    <circle cx="27" cy="17" r="4" fill="#F6EFDD" stroke="${OUT}" stroke-width="0.6"/>
    <path d="M25,15 Q23,12 25,10" stroke="#D8CBA8" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  // faceted bronze ingot: 3 visible facets instead of one flat polygon
  bronze_working: `<polygon points="20,10 28,16 26,22 20,19" fill="#EDB05C" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,19 26,22 25,28 20,26" fill="#D8A93A" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,10 12,16 14,22 20,19" fill="#B5822A" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,19 14,22 15,28 20,26" fill="#8C6A1F" stroke="${OUT}" stroke-width="0.7"/>`,
  // faceted iron ingot block, matching the resources.js iron icon language
  iron_working: `<polygon points="20,12 28,16 28,24 20,28 12,24 12,16" fill="#AEB4BA" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,12 28,16 20,20 12,16" fill="#D4D8DC"/>
    <polygon points="20,20 28,16 28,24 20,28" fill="#6B6F75"/>`,
  // faceted gear/cog instead of a plain stroked ring
  engineering: `<polygon points="20,10 24,13 24,19 28,20 28,24 24,25 24,31 20,34 16,31 16,25 12,24 12,20 16,19 16,13" fill="#F1CE73" stroke="${OUT}" stroke-width="0.8"/>
    <circle cx="20" cy="22" r="5" fill="#B5822A" stroke="${OUT}" stroke-width="0.7"/>`,
  // faceted 3-facet monument (light-left/dark-right/base) instead of a stroked triangle outline
  architecture: `<polygon points="20,8 12,32 20,32" fill="#F1CE73" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="20,8 28,32 20,32" fill="#B5822A" stroke="${OUT}" stroke-width="0.8"/>
    <rect x="17" y="26" width="6" height="6" fill="#5A3B12"/>`,
  spears: `<polygon points="18.6,10 21.4,10 21.4,32 18.6,32" fill="#D8CBA8" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="20,6 25,15 20,15 15,15Z" fill="#AEB4BA" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,6 25,15 20,15" fill="#D4D8DC"/>`,
  // faceted kite shield instead of a flat hexagon
  shields: `<polygon points="20,8 30,14 28,26 20,33 20,8" fill="#8C3A1F" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="20,8 10,14 12,26 20,33 20,8" fill="#B5502D" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="20,13 25,16 24,24 20,28" fill="#D97B4F" opacity="0.6"/>`,
  // faceted horse-head silhouette instead of an ellipse+rectangle
  mounted_warfare: `<polygon points="10,28 10,20 16,16 24,15 26,20 20,24 20,28" fill="#8A5A34" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="24,15 30,10 30,15 26,20" fill="#8A5A34" stroke="${OUT}" stroke-width="0.7"/>
    <path d="M18,16 Q15,13 17,10" stroke="#2E2013" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  // faceted catapult arm instead of a flat triangle
  siege_weapons: `<rect x="9" y="26" width="20" height="4" fill="#655E51" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="13,26 24,9 27,13 17,26" fill="#ADA48E" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="24,9 27,13 22,15 20,11" fill="#7A7261"/>
    <circle cx="12" cy="30" r="3" fill="none" stroke="${OUT}" stroke-width="1.2"/><circle cx="26" cy="30" r="3" fill="none" stroke="${OUT}" stroke-width="1.2"/>`,
  // faceted amphora/trade vessels instead of stroked arc
  trade: `<path d="M10,26 Q20,13 30,26" fill="none" stroke="#D8A93A" stroke-width="2.6"/>
    <polygon points="10,22 13,22 13,28 10,30" fill="#EDB05C" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="27,22 30,22 30,30 27,28" fill="#B5822A" stroke="${OUT}" stroke-width="0.6"/>`,
  // faceted market stall roof instead of flat rectangle+triangle
  markets: `<rect x="10" y="18" width="10" height="12" fill="#6B2018" stroke="${OUT}" stroke-width="0.7"/><rect x="20" y="18" width="10" height="12" fill="#8C3A1F" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="8,18 20,9 20,18" fill="#8C3A1F" stroke="${OUT}" stroke-width="0.7"/><polygon points="20,9 32,18 20,18" fill="#B5502D" stroke="${OUT}" stroke-width="0.7"/>`,
  currency: facetedGem(20, 20, 8.5, '#FFE27A', '#E8B93A', '#D8A030', '#A8721F'),
  // faceted camel-caravan silhouette instead of stroked humps
  caravans: `<polygon points="10,26 12,18 16,17 17,21 14,26" fill="#D3B37F" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="17,26 19,15 23,14 24,20 21,26" fill="#C29A5E" stroke="${OUT}" stroke-width="0.6"/>
    <polygon points="24,26 26,19 29,18 30,22 27,26" fill="#D3B37F" stroke="${OUT}" stroke-width="0.6"/>`,
  // faceted fish instead of a flat teardrop
  fishing: `<polygon points="10,20 17,15 26,17 26,23 17,25" fill="#2C7E8C" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="17,15 26,17 21,20 17,18" fill="#4FA6AE"/>
    <polygon points="26,17 30,13 30,27 26,23" fill="#4FA6AE" stroke="${OUT}" stroke-width="0.6"/>`,
  // faceted sail instead of a flat triangle
  sailing: `<rect x="19" y="8" width="2.2" height="24" fill="#D8CBA8" stroke="${OUT}" stroke-width="0.5"/>
    <polygon points="21,10 31,18 21,22" fill="#F1CE73" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="21,10 21,22 25,19" fill="#D8A93A" opacity="0.6"/>
    <path d="M8,30 Q20,36 32,30" fill="none" stroke="#4FA6AE" stroke-width="2.5"/>`,
  // faceted compass/star instead of a stroked circle
  ocean_navigation: `<polygon points="20,9 22,18 31,20 22,22 20,31 18,22 9,20 18,18" fill="#F1CE73" stroke="${OUT}" stroke-width="0.8"/>
    <polygon points="20,9 22,18 20,20 18,18" fill="#D8A93A"/><polygon points="31,20 22,22 20,20 22,18" fill="#B5822A"/>`,
  // faceted merchant-ship hull instead of a flat quadrilateral
  merchant_fleet: `<polygon points="10,26 14,14 20,14 20,26" fill="#3B96A4" stroke="${OUT}" stroke-width="0.7"/>
    <polygon points="20,14 26,14 30,26 20,26" fill="#2C7E8C" stroke="${OUT}" stroke-width="0.7"/>
    <path d="M8,28 Q20,33 32,28" fill="none" stroke="#F1CE73" stroke-width="2"/>`,
};

export const TECHS = {
  // --- core ---
  agriculture: { id: 'agriculture', name: 'Agriculture', branch: 'core', cost: 20, req: [], unlocks: { buildings: ['granary'] }, icon: icon(glyphs.agriculture, '#8FA06B') },
  animal_husbandry: { id: 'animal_husbandry', name: 'Animal Husbandry', branch: 'core', cost: 35, req: ['agriculture'], unlocks: {}, icon: icon(glyphs.animal_husbandry, '#C9A857') },
  bronze_working: { id: 'bronze_working', name: 'Bronze Working', branch: 'core', cost: 50, req: ['animal_husbandry'], unlocks: { buildings: ['walls'] }, icon: icon(glyphs.bronze_working, '#D8A93A') },
  iron_working: { id: 'iron_working', name: 'Iron Working', branch: 'core', cost: 70, req: ['bronze_working'], unlocks: { units: ['axeman'], buildings: ['forge'] }, icon: icon(glyphs.iron_working, '#8D8474') },
  engineering: { id: 'engineering', name: 'Engineering', branch: 'core', cost: 90, req: ['iron_working'], unlocks: { buildings: ['university'], wonders: ['great_dam'] }, icon: icon(glyphs.engineering, '#655E51') },
  architecture: { id: 'architecture', name: 'Architecture', branch: 'core', cost: 120, req: ['engineering'], unlocks: { units: ['royal_guard'], wonders: ['great_pyramid', 'royal_palace', 'stone_circles'] }, icon: icon(glyphs.architecture, '#D8A93A') },

  // --- military ---
  spears: { id: 'spears', name: 'Spears', branch: 'military', cost: 25, req: ['agriculture'], unlocks: { units: ['spearman'] }, icon: icon(glyphs.spears, '#8C2F2F') },
  shields: { id: 'shields', name: 'Shields', branch: 'military', cost: 45, req: ['spears', 'bronze_working'], unlocks: { units: ['shield_bearer'] }, icon: icon(glyphs.shields, '#B5502D') },
  mounted_warfare: { id: 'mounted_warfare', name: 'Mounted Warfare', branch: 'military', cost: 65, req: ['shields', 'animal_husbandry'], unlocks: { units: ['horseman', 'camel_rider'] }, icon: icon(glyphs.mounted_warfare, '#6B4B33') },
  siege_weapons: { id: 'siege_weapons', name: 'Siege Weapons', branch: 'military', cost: 100, req: ['mounted_warfare', 'iron_working'], unlocks: { units: ['war_chariot', 'crossbowman', 'siege_tower', 'catapult'] }, icon: icon(glyphs.siege_weapons, '#3E3E42') },

  // --- economic ---
  trade: { id: 'trade', name: 'Trade', branch: 'economic', cost: 30, req: ['agriculture'], unlocks: { buildings: ['market'] }, icon: icon(glyphs.trade, '#D8A93A') },
  markets: { id: 'markets', name: 'Markets', branch: 'economic', cost: 50, req: ['trade'], unlocks: { wonders: ['great_mosque'] }, icon: icon(glyphs.markets, '#C9A857') },
  currency: { id: 'currency', name: 'Currency', branch: 'economic', cost: 75, req: ['markets', 'bronze_working'], unlocks: { wonders: ['royal_mint'] }, icon: icon(glyphs.currency, '#F1CE73') },
  caravans: { id: 'caravans', name: 'Caravans', branch: 'economic', cost: 95, req: ['currency', 'engineering'], unlocks: { wonders: ['great_library'] }, icon: icon(glyphs.caravans, '#4A3427') },

  // --- naval ---
  fishing: { id: 'fishing', name: 'Fishing', branch: 'naval', cost: 20, req: ['agriculture'], unlocks: {}, icon: icon(glyphs.fishing, '#2C7E8C') },
  sailing: { id: 'sailing', name: 'Sailing', branch: 'naval', cost: 40, req: ['fishing'], unlocks: { buildings: ['harbor'] }, icon: icon(glyphs.sailing, '#1B5661') },
  ocean_navigation: { id: 'ocean_navigation', name: 'Ocean Navigation', branch: 'naval', cost: 65, req: ['sailing', 'iron_working'], unlocks: { wonders: ['obelisk'] }, icon: icon(glyphs.ocean_navigation, '#2C7E8C') },
  merchant_fleet: { id: 'merchant_fleet', name: 'Merchant Fleet', branch: 'naval', cost: 90, req: ['ocean_navigation', 'currency'], unlocks: {}, icon: icon(glyphs.merchant_fleet, '#4FA6AE') },
};

export const BRANCH_LABELS = {
  core: 'Core', military: 'Military', economic: 'Economic', naval: 'Naval',
};

export function isTechAvailable(playerTechs, techId) {
  const tech = TECHS[techId];
  if (!tech) return false;
  if (playerTechs.has(techId)) return false;
  return tech.req.every(r => playerTechs.has(r));
}

export function availableTechs(playerTechs) {
  return Object.values(TECHS).filter(t => isTechAvailable(playerTechs, t.id));
}

export function isUnitUnlocked(unitDef, playerTechs) {
  if (!unitDef.techReq) return true;
  return playerTechs.has(unitDef.techReq);
}

export function isBuildingUnlocked(buildingId, playerTechs) {
  if (buildingId === 'capital_seat') return true;
  for (const tech of Object.values(TECHS)) {
    if (tech.unlocks.buildings && tech.unlocks.buildings.includes(buildingId)) {
      return playerTechs.has(tech.id);
    }
  }
  return true; // buildings with no tech gate (e.g. temple) are available from the start
}

export function isWonderUnlocked(wonderId, playerTechs) {
  for (const tech of Object.values(TECHS)) {
    if (tech.unlocks.wonders && tech.unlocks.wonders.includes(wonderId)) {
      return playerTechs.has(tech.id);
    }
  }
  return false;
}
