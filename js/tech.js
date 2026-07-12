// tech.js — Technology tree: four branches (Core, Military, Economic, Naval),
// each tech unlocking units/buildings/wonders. Cost is in accumulated Science points.

function icon(inner, bg = '#2E6B4F') {
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="${bg}" stroke="#1C1208" stroke-width="1.5"/>
    ${inner}
  </svg>`;
}

const glyphs = {
  agriculture: `<path d="M12,28 Q20,10 28,28Z" fill="#F1CE73"/><rect x="19" y="24" width="2" height="8" fill="#4A3427"/>`,
  animal_husbandry: `<ellipse cx="20" cy="24" rx="10" ry="6" fill="#F6EFDD"/><circle cx="28" cy="19" r="4" fill="#F6EFDD"/>`,
  bronze_working: `<polygon points="20,10 28,16 25,28 15,28 12,16" fill="#D8A93A"/>`,
  iron_working: `<rect x="14" y="16" width="12" height="10" fill="#8D8474"/><rect x="12" y="20" width="16" height="4" fill="#5B5B5F"/>`,
  engineering: `<circle cx="20" cy="20" r="8" fill="none" stroke="#F1CE73" stroke-width="3"/><circle cx="20" cy="20" r="2.5" fill="#F1CE73"/>`,
  architecture: `<polygon points="20,8 32,32 8,32" fill="none" stroke="#F1CE73" stroke-width="2.5"/><rect x="17" y="24" width="6" height="8" fill="#F1CE73"/>`,
  spears: `<rect x="19" y="8" width="2.4" height="26" fill="#F6EFDD"/><polygon points="20,6 25,14 15,14" fill="#F6EFDD"/>`,
  shields: `<polygon points="20,8 30,14 28,26 20,33 12,26 10,14" fill="#B5502D"/>`,
  mounted_warfare: `<ellipse cx="18" cy="24" rx="10" ry="6" fill="#4A3427"/><rect x="26" y="12" width="3" height="14" fill="#4A3427"/>`,
  siege_weapons: `<rect x="10" y="26" width="18" height="4" fill="#655E51"/><path d="M13,26 L24,10 L27,14 L17,26Z" fill="#8D8474"/>`,
  trade: `<path d="M10,26 Q20,14 30,26" fill="none" stroke="#D8A93A" stroke-width="3"/><circle cx="10" cy="26" r="3" fill="#D8A93A"/><circle cx="30" cy="26" r="3" fill="#D8A93A"/>`,
  markets: `<rect x="10" y="18" width="20" height="12" fill="#8C3A1F"/><polygon points="8,18 20,9 32,18" fill="#B5502D"/>`,
  currency: `<circle cx="20" cy="20" r="9" fill="#D8A93A" stroke="#8C3A1F" stroke-width="1.5"/><text x="20" y="24" font-size="10" text-anchor="middle" fill="#5A3B12" font-family="Georgia,serif">Au</text>`,
  caravans: `<path d="M12,26 Q16,12 20,26 Q24,12 28,26" fill="none" stroke="#4A3427" stroke-width="2.5"/>`,
  fishing: `<path d="M12,20 Q20,26 28,20 Q20,15 12,20Z" fill="#4FA6AE"/>`,
  sailing: `<path d="M20,8 L20,30" stroke="#F6EFDD" stroke-width="2"/><polygon points="21,10 31,18 21,22" fill="#F1CE73"/><path d="M8,30 Q20,36 32,30" fill="none" stroke="#4FA6AE" stroke-width="2.5"/>`,
  ocean_navigation: `<circle cx="20" cy="20" r="9" fill="none" stroke="#F1CE73" stroke-width="2"/><line x1="20" y1="20" x2="26" y2="14" stroke="#F1CE73" stroke-width="2"/>`,
  merchant_fleet: `<path d="M10,26 L14,14 L26,14 L30,26Z" fill="#2C7E8C"/><path d="M8,28 Q20,33 32,28" fill="none" stroke="#F1CE73" stroke-width="2"/>`,
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
