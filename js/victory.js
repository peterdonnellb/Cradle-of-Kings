// victory.js — Checks all six victory conditions each turn.
// Returns { winner: playerId, type, label } as soon as one player meets a condition,
// or null if the game continues. Domination is checked first (it can trigger
// immediately once only one kingdom survives); the rest are checked in playerOrder
// so that, on the rare turn two players qualify simultaneously, the earlier player wins.

import { TECHS } from './tech.js';
import { WONDERS } from './wonders.js';

export const VICTORY_THRESHOLDS = {
  economicGold: 1500,
  culturalCulture: 600,
  religiousTemples: 5,
  wonderCount: 5,
  eliminationGraceTurns: 3,
};

export const VICTORY_LABELS = {
  domination: 'Domination Victory',
  economic: 'Economic Victory',
  cultural: 'Cultural Victory',
  religious: 'Religious Victory',
  scientific: 'Scientific Victory',
  wonder: 'Wonder Victory',
};

/** Recomputes each player's `alive` flag (no cities and no units, past the grace period = eliminated). */
export function updateEliminations(state) {
  if (state.turn <= VICTORY_THRESHOLDS.eliminationGraceTurns) return;
  for (const player of state.players.values()) {
    if (player.cityIds.size === 0 && player.unitIds.size === 0) {
      player.alive = false;
    }
  }
}

function countTemples(state, player) {
  let count = 0;
  for (const cid of player.cityIds) {
    const city = state.cities.get(cid);
    if (city && city.improvements.includes('temple')) count++;
  }
  return count;
}

export function checkVictory(state) {
  updateEliminations(state);

  const alivePlayers = state.playerOrder.map(id => state.players.get(id)).filter(p => p && p.alive);

  if (state.playerOrder.length > 1 && alivePlayers.length === 1 && state.turn > VICTORY_THRESHOLDS.eliminationGraceTurns) {
    return { winner: alivePlayers[0].id, type: 'domination', label: VICTORY_LABELS.domination };
  }

  for (const player of alivePlayers) {
    if (player.stockpile.gold >= VICTORY_THRESHOLDS.economicGold) {
      return { winner: player.id, type: 'economic', label: VICTORY_LABELS.economic };
    }
  }
  for (const player of alivePlayers) {
    if (player.culture >= VICTORY_THRESHOLDS.culturalCulture) {
      return { winner: player.id, type: 'cultural', label: VICTORY_LABELS.cultural };
    }
  }
  for (const player of alivePlayers) {
    if (countTemples(state, player) >= VICTORY_THRESHOLDS.religiousTemples) {
      return { winner: player.id, type: 'religious', label: VICTORY_LABELS.religious };
    }
  }
  for (const player of alivePlayers) {
    if (player.technologies.size >= Object.keys(TECHS).length) {
      return { winner: player.id, type: 'scientific', label: VICTORY_LABELS.scientific };
    }
  }
  for (const player of alivePlayers) {
    if ((player.wonders ? player.wonders.size : 0) >= VICTORY_THRESHOLDS.wonderCount) {
      return { winner: player.id, type: 'wonder', label: VICTORY_LABELS.wonder };
    }
  }

  return null;
}

/** Progress snapshot (0..1 for each condition) for the human player, used by a UI progress panel. */
export function victoryProgress(state, player) {
  return {
    economic: Math.min(1, player.stockpile.gold / VICTORY_THRESHOLDS.economicGold),
    cultural: Math.min(1, player.culture / VICTORY_THRESHOLDS.culturalCulture),
    religious: Math.min(1, countTemples(state, player) / VICTORY_THRESHOLDS.religiousTemples),
    scientific: Math.min(1, player.technologies.size / Object.keys(TECHS).length),
    wonder: Math.min(1, (player.wonders ? player.wonders.size : 0) / VICTORY_THRESHOLDS.wonderCount),
  };
}
