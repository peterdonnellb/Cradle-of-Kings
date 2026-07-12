// diplomacy.js — Relationships between kingdoms: war/peace/alliance, trade agreements,
// tribute demands, and simple AI evaluation of incoming proposals.

function relKey(a, b) {
  return [a, b].sort().join('|');
}

export function getRelationship(state, a, b) {
  if (a === b) return { status: 'self', tradeAgreement: false };
  const key = relKey(a, b);
  if (!state.relationships.has(key)) {
    state.relationships.set(key, { status: 'peace', tradeAgreement: false, allianceTurns: 0 });
  }
  return state.relationships.get(key);
}

function militaryStrength(state, playerId) {
  let strength = 0;
  const player = state.players.get(playerId);
  if (!player) return 0;
  for (const uid of player.unitIds) {
    const u = state.units.get(uid);
    if (u) strength += u.def.attack + u.def.defense + u.hp * 0.2;
  }
  strength += player.cityIds.size * 12;
  return strength;
}

export function declareWar(state, a, b) {
  const rel = getRelationship(state, a, b);
  rel.status = 'war';
  rel.tradeAgreement = false;
  rel.allianceTurns = 0;
  return rel;
}

export function canAttackAcrossDiplomacy(state, attackerOwner, defenderOwner) {
  const rel = getRelationship(state, attackerOwner, defenderOwner);
  return rel.status !== 'alliance';
}

/** Called right before combat resolves if the two sides weren't already at war. */
export function ensureWarForAttack(state, attackerOwner, defenderOwner) {
  const rel = getRelationship(state, attackerOwner, defenderOwner);
  if (rel.status === 'peace') declareWar(state, attackerOwner, defenderOwner);
  return rel;
}

/**
 * A proposal from `proposer` to `target`. Returns { accepted, message }.
 * Human-to-AI proposals are evaluated with the same heuristic as AI-to-AI/human.
 */
export function evaluateProposal(state, proposer, target, type, payload = {}) {
  const targetPlayer = state.players.get(target);
  const proposerStrength = militaryStrength(state, proposer);
  const targetStrength = militaryStrength(state, target);
  const rel = getRelationship(state, proposer, target);

  switch (type) {
    case 'peace': {
      if (rel.status !== 'war') return { accepted: false, message: 'Not at war.' };
      // Accept if roughly even, or if target is losing badly (wants out), or 40% base chance.
      const losing = targetStrength < proposerStrength * 0.7;
      const accepted = losing || Math.random() < 0.5;
      if (accepted) { rel.status = 'peace'; rel.allianceTurns = 0; }
      return { accepted, message: accepted ? 'Peace accepted.' : 'Peace rejected — they smell victory.' };
    }
    case 'alliance': {
      if (rel.status !== 'peace') return { accepted: false, message: 'Must be at peace first.' };
      const diff = Math.abs(proposerStrength - targetStrength);
      const threshold = Math.max(proposerStrength, targetStrength) * 0.8 + 1; // +1 epsilon so two weak/empty empires can still ally
      const accepted = Math.random() < 0.4 && diff < threshold;
      if (accepted) { rel.status = 'alliance'; rel.allianceTurns = 0; }
      return { accepted, message: accepted ? 'Alliance formed!' : 'They are not ready to commit to an alliance.' };
    }
    case 'trade': {
      if (rel.status === 'war') return { accepted: false, message: 'Cannot trade while at war.' };
      const accepted = Math.random() < 0.75;
      if (accepted) rel.tradeAgreement = true;
      return { accepted, message: accepted ? 'Trade agreement signed.' : 'Trade proposal declined.' };
    }
    case 'tribute': {
      const amount = payload.amount || 0;
      if (!targetPlayer) return { accepted: false, message: 'Invalid target.' };
      const canPay = targetPlayer.stockpile.gold >= amount;
      const intimidated = proposerStrength > targetStrength * 1.4;
      const accepted = canPay && intimidated;
      if (accepted) {
        targetPlayer.stockpile.gold -= amount;
        state.players.get(proposer).stockpile.gold += amount;
      }
      return { accepted, message: accepted ? `Tribute of ${amount} gold paid.` : 'They refuse to pay tribute.' };
    }
    case 'marriage_alliance': {
      if (rel.status === 'war') return { accepted: false, message: 'Cannot arrange a marriage alliance during war.' };
      const accepted = Math.random() < 0.3;
      if (accepted) { rel.status = 'alliance'; rel.allianceTurns = 0; rel.marriage = true; }
      return { accepted, message: accepted ? 'A marriage alliance is sealed!' : 'The royal court declines the proposal.' };
    }
    default:
      return { accepted: false, message: 'Unknown proposal.' };
  }
}

export function breakAlliance(state, a, b) {
  const rel = getRelationship(state, a, b);
  if (rel.status === 'alliance') {
    rel.status = 'peace';
    rel.marriage = false;
  }
  return rel;
}

/** Flat per-turn gold from any active trade agreements this player holds with others. */
export function tradeIncomeForPlayer(state, playerId) {
  let total = 0;
  for (const otherId of state.playerOrder) {
    if (otherId === playerId) continue;
    const rel = getRelationship(state, playerId, otherId);
    if (rel.tradeAgreement && rel.status !== 'war') total += 3;
  }
  return total;
}

/** Lightweight AI diplomacy pass: occasionally seek peace when losing badly. */
export function runAIDiplomacyTurn(state, aiPlayerId) {
  for (const otherId of state.playerOrder) {
    if (otherId === aiPlayerId) continue;
    const rel = getRelationship(state, aiPlayerId, otherId);
    if (rel.status === 'war' && Math.random() < 0.15) {
      const mine = militaryStrength(state, aiPlayerId);
      const theirs = militaryStrength(state, otherId);
      if (mine < theirs * 0.6) {
        evaluateProposal(state, aiPlayerId, otherId, 'peace');
      }
    }
  }
}

export { militaryStrength };
