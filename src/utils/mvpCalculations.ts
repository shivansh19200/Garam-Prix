import {
  TournamentState,
  Player,
  MvpPointConfig,
  MvpAwardItem,
} from '../types/tournament';

export const DEFAULT_MVP_CONFIG: MvpPointConfig = {
  cricketGamePoints: 3,
  stumbleGuysGamePoints: 1,
  smashKartsTdmPoints: 2,
  smashKartsCtfPoints: 2,
  basketballGamePoints: 3,
  tableTennisGamePoints: 2,
  badmintonGamePoints: 2,
  footvolleyGamePoints: 2,
  teamBonusPoints: 6,
  applyTeamBonusToStandings: true,
};

export interface PlayerMvpStats {
  player: Player;
  totalPoints: number;
  awardsCount: number;
  awards: MvpAwardItem[];
  rank: number;
  sportBreakdown: Record<string, { count: number; points: number }>;
}

export interface TeamMvpSummary {
  team1MvpPoints: number;
  team2MvpPoints: number;
  team1AwardsCount: number;
  team2AwardsCount: number;
  leadingTeamId: 'team1' | 'team2' | 'tied';
  bonusPoints: number;
  bonusWinnerTeamId: 'team1' | 'team2' | null;
  leaderGap: number;
}

/**
 * Extracts every single MVP award awarded across all sports/matches in the tournament.
 */
export function getAllMvpAwards(state: TournamentState): MvpAwardItem[] {
  const config = state.mvpConfig || DEFAULT_MVP_CONFIG;
  const awards: MvpAwardItem[] = [];

  const playerMap = new Map<string, Player>();
  state.players.forEach((p) => {
    playerMap.set(p.id, p);
    playerMap.set(p.name.toLowerCase(), p);
  });

  const getPlayer = (idOrName?: string): Player | undefined => {
    if (!idOrName) return undefined;
    return playerMap.get(idOrName) || playerMap.get(idOrName.toLowerCase());
  };

  for (const match of state.matches) {
    // 1. Cricket series tests
    if (match.gameKey === 'cricket' && match.detailedScore?.type === 'cricket_series') {
      const series = match.detailedScore.data;
      series.tests.forEach((test) => {
        const mvpId = test.mvpPlayerId || test.mvp;
        const player = getPlayer(mvpId);
        if (player) {
          awards.push({
            id: `award-cricket-${test.id}`,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
            matchId: match.id,
            gameKey: 'cricket',
            gameName: 'Cricket',
            gameEmoji: '🏏',
            gameDetailTitle: `${test.title} (${test.venue})`,
            subGameIdentifier: test.id,
            date: test.date || match.scheduledTime,
            points: config.cricketGamePoints,
            resultSummary:
              test.resultSummary ||
              (test.winnerTeamId
                ? `${test.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Win`
                : undefined),
          });
        }
      });
    }

    // 2. Smash Karts series games (TDM vs CTF)
    else if (match.gameKey === 'smash_karts' && match.detailedScore?.type === 'smash_karts_series') {
      const series = match.detailedScore.data;
      series.games.forEach((game) => {
        const player = getPlayer(game.mvpPlayerId);
        if (player) {
          const isTdm = game.type === 'TDM';
          const pts = isTdm ? config.smashKartsTdmPoints : config.smashKartsCtfPoints;
          awards.push({
            id: `award-smash-${game.id}`,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
            matchId: match.id,
            gameKey: 'smash_karts',
            gameName: 'Smash Karts',
            gameEmoji: '🏎️',
            gameDetailTitle: `Game ${game.gameNumber}: ${game.type}${game.arena ? ` (${game.arena})` : ''}`,
            subGameIdentifier: game.id,
            date: match.scheduledTime,
            points: pts,
            resultSummary: game.winnerTeamId
              ? `${game.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Won (${game.team1Score}-${game.team2Score})`
              : undefined,
          });
        }
      });
    }

    // 3. Stumble Guys series games
    else if (match.gameKey === 'stumble_guys' && match.detailedScore?.type === 'stumble_guys_series') {
      const series = match.detailedScore.data;
      series.games.forEach((game) => {
        const player = getPlayer(game.mvpPlayerId);
        if (player) {
          awards.push({
            id: `award-stumble-${game.id}`,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
            matchId: match.id,
            gameKey: 'stumble_guys',
            gameName: 'Stumble Guys',
            gameEmoji: '🎮',
            gameDetailTitle: `Game ${game.gameNumber}: ${game.mapName}`,
            subGameIdentifier: game.id,
            date: match.scheduledTime,
            points: config.stumbleGuysGamePoints,
            resultSummary: game.winnerTeamId
              ? `${game.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Win`
              : undefined,
          });
        }
      });
    }

    // 4. Basketball (single race to 30 game)
    else if (match.gameKey === 'basketball') {
      const player = getPlayer(match.mvpPlayerId || match.mvpPlayerName);
      if (player) {
        awards.push({
          id: `award-basketball-${match.id}`,
          playerId: player.id,
          playerName: player.name,
          teamId: player.teamId,
          matchId: match.id,
          gameKey: 'basketball',
          gameName: 'Basketball',
          gameEmoji: '🏀',
          gameDetailTitle: 'First to 30 Championship Race',
          subGameIdentifier: 'main',
          date: match.scheduledTime,
          points: config.basketballGamePoints,
          resultSummary: match.winnerTeamId
            ? `${match.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Won`
            : undefined,
        });
      }
    }

    // 5. Badminton series games
    else if (match.gameKey === 'badminton' && match.detailedScore?.type === 'badminton_series') {
      const series = match.detailedScore.data;
      series.games.forEach((game) => {
        const player = getPlayer(game.mvpPlayerId);
        if (player) {
          awards.push({
            id: `award-badminton-${game.id}`,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
            matchId: match.id,
            gameKey: 'badminton',
            gameName: 'Badminton',
            gameEmoji: '🏸',
            gameDetailTitle: `Game ${game.gameNumber}: ${game.matchType}`,
            subGameIdentifier: game.id,
            date: match.scheduledTime,
            points: config.badmintonGamePoints,
            resultSummary: game.winnerTeamId
              ? `${game.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Won`
              : undefined,
          });
        }
      });
    }

    // 6. Table Tennis series games
    else if (match.gameKey === 'table_tennis' && match.detailedScore?.type === 'table_tennis_series') {
      const series = match.detailedScore.data;
      series.games.forEach((game) => {
        const player = getPlayer(game.mvpPlayerId);
        if (player) {
          awards.push({
            id: `award-tt-${game.id}`,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
            matchId: match.id,
            gameKey: 'table_tennis',
            gameName: 'Table Tennis',
            gameEmoji: '🏓',
            gameDetailTitle: `Game ${game.gameNumber}: ${game.matchType}`,
            subGameIdentifier: game.id,
            date: match.scheduledTime,
            points: config.tableTennisGamePoints,
            resultSummary: game.winnerTeamId
              ? `${game.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Won`
              : undefined,
          });
        }
      });
    }

    // 7. Footvolley series games
    else if (match.gameKey === 'footvolley' && match.detailedScore?.type === 'footvolley_series') {
      const series = match.detailedScore.data;
      series.games.forEach((game) => {
        const player = getPlayer(game.mvpPlayerId);
        if (player) {
          awards.push({
            id: `award-fv-${game.id}`,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
            matchId: match.id,
            gameKey: 'footvolley',
            gameName: 'Footvolley',
            gameEmoji: '🏐',
            gameDetailTitle: `Game ${game.gameNumber} (25 PTS)`,
            subGameIdentifier: game.id,
            date: match.scheduledTime,
            points: config.footvolleyGamePoints,
            resultSummary: game.winnerTeamId
              ? `${game.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Won`
              : undefined,
          });
        }
      });
    }
  }

  return awards;
}

/**
 * Calculates MVP Leaderboard ranked list for all tournament players.
 */
export function getPlayerMvpLeaderboard(state: TournamentState): PlayerMvpStats[] {
  const allAwards = getAllMvpAwards(state);

  const awardsByPlayer = new Map<string, MvpAwardItem[]>();
  allAwards.forEach((a) => {
    const list = awardsByPlayer.get(a.playerId) || [];
    list.push(a);
    awardsByPlayer.set(a.playerId, list);
  });

  const list: PlayerMvpStats[] = state.players.map((player) => {
    const playerAwards = awardsByPlayer.get(player.id) || [];
    const totalPoints = playerAwards.reduce((acc, a) => acc + a.points, 0);

    const sportBreakdown: Record<string, { count: number; points: number }> = {};
    playerAwards.forEach((a) => {
      if (!sportBreakdown[a.gameKey]) {
        sportBreakdown[a.gameKey] = { count: 0, points: 0 };
      }
      sportBreakdown[a.gameKey].count += 1;
      sportBreakdown[a.gameKey].points += a.points;
    });

    return {
      player,
      totalPoints,
      awardsCount: playerAwards.length,
      awards: playerAwards,
      rank: 1,
      sportBreakdown,
    };
  });

  // Sort descending by points, then awards count, then name
  list.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.awardsCount !== a.awardsCount) return b.awardsCount - a.awardsCount;
    return a.player.name.localeCompare(b.player.name);
  });

  // Assign ranks (handles ties gracefully)
  let currentRank = 1;
  list.forEach((entry, idx) => {
    if (idx > 0) {
      const prev = list[idx - 1];
      if (entry.totalPoints < prev.totalPoints) {
        currentRank = idx + 1;
      }
    }
    entry.rank = currentRank;
  });

  return list;
}

/**
 * Calculates aggregate Team MVP points and identifies the team that qualifies for the Grand Champion bonus points.
 */
export function getTeamMvpSummary(state: TournamentState): TeamMvpSummary {
  const config = state.mvpConfig || DEFAULT_MVP_CONFIG;
  const awards = getAllMvpAwards(state);

  let team1MvpPoints = 0;
  let team2MvpPoints = 0;
  let team1AwardsCount = 0;
  let team2AwardsCount = 0;

  awards.forEach((a) => {
    if (a.teamId === 'team1') {
      team1MvpPoints += a.points;
      team1AwardsCount += 1;
    } else if (a.teamId === 'team2') {
      team2MvpPoints += a.points;
      team2AwardsCount += 1;
    }
  });

  let leadingTeamId: 'team1' | 'team2' | 'tied' = 'tied';
  let bonusWinnerTeamId: 'team1' | 'team2' | null = null;

  if (team1MvpPoints > team2MvpPoints) {
    leadingTeamId = 'team1';
    bonusWinnerTeamId = 'team1';
  } else if (team2MvpPoints > team1MvpPoints) {
    leadingTeamId = 'team2';
    bonusWinnerTeamId = 'team2';
  }

  const leaderGap = Math.abs(team1MvpPoints - team2MvpPoints);

  return {
    team1MvpPoints,
    team2MvpPoints,
    team1AwardsCount,
    team2AwardsCount,
    leadingTeamId,
    bonusPoints: config.teamBonusPoints,
    bonusWinnerTeamId,
    leaderGap,
  };
}
