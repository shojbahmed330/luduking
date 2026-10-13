// Player Ranking: position-based points.
// Points: 1st = 4, 2nd = 3, 3rd = 2, 4th = 1
// Score = total points / matches played (average points per match)
// A player must play at least MIN_MATCH_RATIO (30%) of all matches in the
// period to earn a score; otherwise their name stays at the bottom of the list.
// Players marked irregular (isIrregular) are always pinned at the very bottom.

export const POSITION_POINTS: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };

export const MIN_MATCH_RATIO = 0.3;

/** Minimum matches a player must have played to be eligible, given total matches in the period. */
export function getRequiredMatches(totalMatches: number): number {
  if (totalMatches <= 0) return 0;
  return Math.ceil(totalMatches * MIN_MATCH_RATIO);
}

export type RankingPlayer = { id: string; name: string; is_irregular?: boolean | null };
export type RankingMatchResult = { player_id: string; position: number };

export type PlayerRanking = {
  id: string;
  name: string;
  matches: number;
  first: number;
  second: number;
  third: number;
  fourth: number;
  totalPoints: number;
  avgPoints: number;
  eligible: boolean;
  requiredMatches: number;
  isIrregular: boolean;
  rank: number;
};

export function computeRanking(
  players: RankingPlayer[],
  matchResults: RankingMatchResult[],
  totalMatches: number,
): PlayerRanking[] {
  const requiredMatches = getRequiredMatches(totalMatches);

  const stats: PlayerRanking[] = players.map((player) => {
    const results = matchResults.filter((mr) => mr.player_id === player.id);
    const first = results.filter((r) => r.position === 1).length;
    const second = results.filter((r) => r.position === 2).length;
    const third = results.filter((r) => r.position === 3).length;
    const fourth = results.filter((r) => r.position === 4).length;
    const matches = results.length;
    const totalPoints = results.reduce(
      (acc, r) => acc + (POSITION_POINTS[r.position] ?? 1),
      0,
    );
    return {
      id: player.id,
      name: player.name,
      matches,
      first,
      second,
      third,
      fourth,
      totalPoints,
      avgPoints: matches > 0 ? totalPoints / matches : 0,
      eligible:
        totalMatches > 0 && matches >= requiredMatches && !player.is_irregular,
      requiredMatches,
      isIrregular: !!player.is_irregular,
      rank: 0,
    };
  });

  // Sort: eligible players (enough matches) first by avgPoints desc,
  // then 1st places, then matches, then fewer 4th places.
  // Ineligible players stay at the bottom of the list; irregular players
  // are always pinned at the very bottom.
  stats.sort((a, b) => {
    if (a.isIrregular !== b.isIrregular) return a.isIrregular ? 1 : -1;
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    if (b.avgPoints !== a.avgPoints) return b.avgPoints - a.avgPoints;
    if (b.first !== a.first) return b.first - a.first;
    if (b.matches !== a.matches) return b.matches - a.matches;
    return a.fourth - b.fourth;
  });

  stats.forEach((s, i) => {
    s.rank = i + 1;
  });

  return stats;
}

/** Best player = highest ranked eligible player (enough matches). */
export function getBestPlayer(rankings: PlayerRanking[]): PlayerRanking | null {
  return rankings.find((r) => r.eligible && r.matches > 0) ?? null;
}
