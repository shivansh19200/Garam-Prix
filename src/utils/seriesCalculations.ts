import {
  Match,
  DetailedCricketSeries,
  CricketTestMatch,
  DetailedSmashKartsSeries,
  SmashKartsGame,
  DetailedBadmintonSeries,
  BadmintonGame,
  DetailedFootvolleySeries,
  FootvolleyGame,
  DetailedBasketballRace30,
  DetailedTableTennisSeries,
  TableTennisGame,
  DetailedStumbleGuysSeries,
  StumbleGuysGame,
} from '../types/tournament';

/**
 * Universal recalculator for any Garam Prix match.
 * Guarantees:
 * 1. Winning individual matches/games increments the team's series points (++).
 * 2. Winning the series (reaching target wins) marks the event as completed,
 *    assigns base & consolation points, and updates the standings table.
 */
export function recalculateMatchOutcome(match: Match): Match {
  // -------------------------------------------------------------
  // 🏏 CRICKET (5-Match Test Series)
  // -------------------------------------------------------------
  if (match.detailedScore?.type === 'cricket_series') {
    const series = match.detailedScore.data;
    let t1Wins = 0;
    let t2Wins = 0;
    let draws = 0;

    const updatedTests = series.tests.map((t) => {
      let winner = t.winnerTeamId;
      const t1TotalRuns =
        (t.team1Innings1?.runs || 0) + (t.team1Innings2?.runs || 0);
      const t2TotalRuns =
        (t.team2Innings1?.runs || 0) + (t.team2Innings2?.runs || 0);

      // Auto deduce winner if test is completed and winner not manually selected
      if (!winner && t.status === 'completed' && (t1TotalRuns > 0 || t2TotalRuns > 0)) {
        if (t1TotalRuns > t2TotalRuns) winner = 'team1';
        else if (t2TotalRuns > t1TotalRuns) winner = 'team2';
        else winner = 'draw';
      }

      if (winner === 'team1') t1Wins++;
      else if (winner === 'team2') t2Wins++;
      else if (winner === 'draw') draws++;

      return {
        ...t,
        winnerTeamId: winner,
      };
    });

    const isTargetReached = t1Wins >= 3 || t2Wins >= 3;
    const isAllCompleted =
      updatedTests.length > 0 && updatedTests.every((t) => t.status === 'completed');

    let overallWinner: 'team1' | 'team2' | null = null;
    let status = match.status;

    if (t1Wins > t2Wins && (isTargetReached || isAllCompleted)) {
      overallWinner = 'team1';
      status = 'completed';
    } else if (t2Wins > t1Wins && (isTargetReached || isAllCompleted)) {
      overallWinner = 'team2';
      status = 'completed';
    } else if (t1Wins > 0 || t2Wins > 0 || updatedTests.some((t) => t.status === 'live')) {
      status = 'live';
    }

    const t1Pts =
      overallWinner === 'team1'
        ? match.basePoints
        : overallWinner === 'team2'
        ? match.consolationPoints
        : undefined;

    const t2Pts =
      overallWinner === 'team2'
        ? match.basePoints
        : overallWinner === 'team1'
        ? match.consolationPoints
        : undefined;

    return {
      ...match,
      status,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      detailedScore: {
        type: 'cricket_series',
        data: {
          ...series,
          totalTests: Math.max(series.totalTests, updatedTests.length),
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          draws,
          tests: updatedTests,
        },
      },
    };
  }

  // -------------------------------------------------------------
  // 🏎️ SMASH KARTS (7-Game Series, First to 4 Wins, TDM + CTF)
  // -------------------------------------------------------------
  if (match.detailedScore?.type === 'smash_karts_series') {
    const series = match.detailedScore.data;
    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = series.games.map((g) => {
      let winner = g.winnerTeamId;
      let status = g.status;

      // Deduce winner if scores entered
      if (g.team1Score > g.team2Score && (g.team1Score > 0 || g.team2Score > 0)) {
        winner = 'team1';
        status = 'completed';
      } else if (g.team2Score > g.team1Score && (g.team1Score > 0 || g.team2Score > 0)) {
        winner = 'team2';
        status = 'completed';
      }

      if (winner === 'team1') t1Wins++;
      else if (winner === 'team2') t2Wins++;

      return {
        ...g,
        winnerTeamId: winner,
        status,
      };
    });

    const targetWins = series.targetWins || 4;
    const isTargetReached = t1Wins >= targetWins || t2Wins >= targetWins;
    const isAllCompleted =
      updatedGames.length > 0 && updatedGames.every((g) => g.status === 'completed');

    let overallWinner: 'team1' | 'team2' | null = null;
    let status = match.status;

    if (t1Wins >= targetWins || (isAllCompleted && t1Wins > t2Wins)) {
      overallWinner = 'team1';
      status = 'completed';
    } else if (t2Wins >= targetWins || (isAllCompleted && t2Wins > t1Wins)) {
      overallWinner = 'team2';
      status = 'completed';
    } else if (t1Wins > 0 || t2Wins > 0 || updatedGames.some((g) => g.status === 'live')) {
      status = 'live';
    }

    const t1Pts =
      overallWinner === 'team1'
        ? match.basePoints
        : overallWinner === 'team2'
        ? match.consolationPoints
        : undefined;

    const t2Pts =
      overallWinner === 'team2'
        ? match.basePoints
        : overallWinner === 'team1'
        ? match.consolationPoints
        : undefined;

    return {
      ...match,
      status,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      detailedScore: {
        type: 'smash_karts_series',
        data: {
          ...series,
          totalGames: Math.max(series.totalGames, updatedGames.length),
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          games: updatedGames,
        },
      },
    };
  }

  // -------------------------------------------------------------
  // 🏸 BADMINTON (3-Game Series, First to 2 Wins, Sets: 11, 11, 21)
  // -------------------------------------------------------------
  if (match.detailedScore?.type === 'badminton_series') {
    const series = match.detailedScore.data;
    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = series.games.map((g) => {
      let t1Sets = 0;
      let t2Sets = 0;

      if (g.set1.team1 > g.set1.team2 && (g.set1.team1 > 0 || g.set1.team2 > 0)) t1Sets++;
      else if (g.set1.team2 > g.set1.team1 && (g.set1.team1 > 0 || g.set1.team2 > 0)) t2Sets++;

      if (g.set2.team1 > g.set2.team2 && (g.set2.team1 > 0 || g.set2.team2 > 0)) t1Sets++;
      else if (g.set2.team2 > g.set2.team1 && (g.set2.team1 > 0 || g.set2.team2 > 0)) t2Sets++;

      if (g.set3.team1 > g.set3.team2 && (g.set3.team1 > 0 || g.set3.team2 > 0)) t1Sets++;
      else if (g.set3.team2 > g.set3.team1 && (g.set3.team1 > 0 || g.set3.team2 > 0)) t2Sets++;

      let winner = g.winnerTeamId;
      let status = g.status;

      if (t1Sets >= 2) {
        winner = 'team1';
        status = 'completed';
      } else if (t2Sets >= 2) {
        winner = 'team2';
        status = 'completed';
      } else if (t1Sets > 0 || t2Sets > 0) {
        status = 'live';
      }

      if (winner === 'team1') t1Wins++;
      else if (winner === 'team2') t2Wins++;

      return {
        ...g,
        team1SetsWon: t1Sets,
        team2SetsWon: t2Sets,
        winnerTeamId: winner,
        status,
      };
    });

    const targetWins = series.targetWins || 2;
    const isTargetReached = t1Wins >= targetWins || t2Wins >= targetWins;
    const isAllCompleted =
      updatedGames.length > 0 && updatedGames.every((g) => g.status === 'completed');

    let overallWinner: 'team1' | 'team2' | null = null;
    let status = match.status;

    if (t1Wins >= targetWins || (isAllCompleted && t1Wins > t2Wins)) {
      overallWinner = 'team1';
      status = 'completed';
    } else if (t2Wins >= targetWins || (isAllCompleted && t2Wins > t1Wins)) {
      overallWinner = 'team2';
      status = 'completed';
    } else if (t1Wins > 0 || t2Wins > 0 || updatedGames.some((g) => g.status === 'live')) {
      status = 'live';
    }

    const t1Pts =
      overallWinner === 'team1'
        ? match.basePoints
        : overallWinner === 'team2'
        ? match.consolationPoints
        : undefined;

    const t2Pts =
      overallWinner === 'team2'
        ? match.basePoints
        : overallWinner === 'team1'
        ? match.consolationPoints
        : undefined;

    return {
      ...match,
      status,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      detailedScore: {
        type: 'badminton_series',
        data: {
          ...series,
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          games: updatedGames,
        },
      },
    };
  }

  // -------------------------------------------------------------
  // 🏐 FOOTVOLLEY (3-Game Series, 25 Points Each, First to 2 Wins)
  // -------------------------------------------------------------
  if (match.detailedScore?.type === 'footvolley_series') {
    const series = match.detailedScore.data;
    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = series.games.map((g) => {
      let winner = g.winnerTeamId;
      let status = g.status;

      if (g.team1Score >= 25 && g.team1Score > g.team2Score) {
        winner = 'team1';
        status = 'completed';
      } else if (g.team2Score >= 25 && g.team2Score > g.team1Score) {
        winner = 'team2';
        status = 'completed';
      } else if (g.team1Score > 0 || g.team2Score > 0) {
        status = 'live';
      }

      if (winner === 'team1') t1Wins++;
      else if (winner === 'team2') t2Wins++;

      return {
        ...g,
        winnerTeamId: winner,
        status,
      };
    });

    const targetWins = series.targetWins || 2;
    const isTargetReached = t1Wins >= targetWins || t2Wins >= targetWins;
    const isAllCompleted =
      updatedGames.length > 0 && updatedGames.every((g) => g.status === 'completed');

    let overallWinner: 'team1' | 'team2' | null = null;
    let status = match.status;

    if (t1Wins >= targetWins || (isAllCompleted && t1Wins > t2Wins)) {
      overallWinner = 'team1';
      status = 'completed';
    } else if (t2Wins >= targetWins || (isAllCompleted && t2Wins > t1Wins)) {
      overallWinner = 'team2';
      status = 'completed';
    } else if (t1Wins > 0 || t2Wins > 0 || updatedGames.some((g) => g.status === 'live')) {
      status = 'live';
    }

    const t1Pts =
      overallWinner === 'team1'
        ? match.basePoints
        : overallWinner === 'team2'
        ? match.consolationPoints
        : undefined;

    const t2Pts =
      overallWinner === 'team2'
        ? match.basePoints
        : overallWinner === 'team1'
        ? match.consolationPoints
        : undefined;

    return {
      ...match,
      status,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      detailedScore: {
        type: 'footvolley_series',
        data: {
          ...series,
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          games: updatedGames,
        },
      },
    };
  }

  // -------------------------------------------------------------
  // 🏀 BASKETBALL (First to 30 Wins)
  // -------------------------------------------------------------
  if (match.detailedScore?.type === 'basketball_race30') {
    const bball = match.detailedScore.data;
    const t1 = bball.team1Points;
    const t2 = bball.team2Points;

    let winner = bball.winnerTeamId;
    let status = match.status;

    if (t1 >= 30) {
      winner = 'team1';
      status = 'completed';
    } else if (t2 >= 30) {
      winner = 'team2';
      status = 'completed';
    } else if (t1 > 0 || t2 > 0) {
      status = 'live';
      winner = null;
    }

    const t1Pts =
      winner === 'team1'
        ? match.basePoints
        : winner === 'team2'
        ? match.consolationPoints
        : undefined;

    const t2Pts =
      winner === 'team2'
        ? match.basePoints
        : winner === 'team1'
        ? match.consolationPoints
        : undefined;

    return {
      ...match,
      status,
      winnerTeamId: winner,
      team1ScoreDisplay: String(t1),
      team2ScoreDisplay: String(t2),
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      detailedScore: {
        type: 'basketball_race30',
        data: {
          ...bball,
          winnerTeamId: winner,
        },
      },
    };
  }

  // -------------------------------------------------------------
  // 🏓 TABLE TENNIS (3-Game Series, First to 2 Wins, Sets: 21, 21, 21)
  // -------------------------------------------------------------
  if (match.detailedScore?.type === 'table_tennis_series') {
    const series = match.detailedScore.data;
    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = series.games.map((g) => {
      let t1Sets = 0;
      let t2Sets = 0;

      if (g.set1.team1 > g.set1.team2 && (g.set1.team1 > 0 || g.set1.team2 > 0)) t1Sets++;
      else if (g.set1.team2 > g.set1.team1 && (g.set1.team1 > 0 || g.set1.team2 > 0)) t2Sets++;

      if (g.set2.team1 > g.set2.team2 && (g.set2.team1 > 0 || g.set2.team2 > 0)) t1Sets++;
      else if (g.set2.team2 > g.set2.team1 && (g.set2.team1 > 0 || g.set2.team2 > 0)) t2Sets++;

      if (g.set3.team1 > g.set3.team2 && (g.set3.team1 > 0 || g.set3.team2 > 0)) t1Sets++;
      else if (g.set3.team2 > g.set3.team1 && (g.set3.team1 > 0 || g.set3.team2 > 0)) t2Sets++;

      let winner = g.winnerTeamId;
      let status = g.status;

      if (t1Sets >= 2) {
        winner = 'team1';
        status = 'completed';
      } else if (t2Sets >= 2) {
        winner = 'team2';
        status = 'completed';
      } else if (t1Sets > 0 || t2Sets > 0) {
        status = 'live';
      }

      if (winner === 'team1') t1Wins++;
      else if (winner === 'team2') t2Wins++;

      return {
        ...g,
        team1SetsWon: t1Sets,
        team2SetsWon: t2Sets,
        winnerTeamId: winner,
        status,
      };
    });

    const targetWins = series.targetWins || 2;
    const isAllCompleted =
      updatedGames.length > 0 && updatedGames.every((g) => g.status === 'completed');

    let overallWinner: 'team1' | 'team2' | null = null;
    let status = match.status;

    if (t1Wins >= targetWins || (isAllCompleted && t1Wins > t2Wins)) {
      overallWinner = 'team1';
      status = 'completed';
    } else if (t2Wins >= targetWins || (isAllCompleted && t2Wins > t1Wins)) {
      overallWinner = 'team2';
      status = 'completed';
    } else if (t1Wins > 0 || t2Wins > 0 || updatedGames.some((g) => g.status === 'live')) {
      status = 'live';
    }

    const t1Pts =
      overallWinner === 'team1'
        ? match.basePoints
        : overallWinner === 'team2'
        ? match.consolationPoints
        : undefined;

    const t2Pts =
      overallWinner === 'team2'
        ? match.basePoints
        : overallWinner === 'team1'
        ? match.consolationPoints
        : undefined;

    return {
      ...match,
      status,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      detailedScore: {
        type: 'table_tennis_series',
        data: {
          ...series,
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          games: updatedGames,
        },
      },
    };
  }

  // -------------------------------------------------------------
  // 🎮 STUMBLE GUYS (5-Game Series, First to 3 Wins)
  // -------------------------------------------------------------
  if (match.detailedScore?.type === 'stumble_guys_series') {
    const series = match.detailedScore.data;
    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = series.games.map((g) => {
      let winner = g.winnerTeamId;
      let status = g.status;

      if (g.team1Score > g.team2Score && (g.team1Score > 0 || g.team2Score > 0)) {
        winner = 'team1';
        status = 'completed';
      } else if (g.team2Score > g.team1Score && (g.team1Score > 0 || g.team2Score > 0)) {
        winner = 'team2';
        status = 'completed';
      }

      if (winner === 'team1') t1Wins++;
      else if (winner === 'team2') t2Wins++;

      return {
        ...g,
        winnerTeamId: winner,
        status,
      };
    });

    const targetWins = series.targetWins || 3;
    const isAllCompleted =
      updatedGames.length > 0 && updatedGames.every((g) => g.status === 'completed');

    let overallWinner: 'team1' | 'team2' | null = null;
    let status = match.status;

    if (t1Wins >= targetWins || (isAllCompleted && t1Wins > t2Wins)) {
      overallWinner = 'team1';
      status = 'completed';
    } else if (t2Wins >= targetWins || (isAllCompleted && t2Wins > t1Wins)) {
      overallWinner = 'team2';
      status = 'completed';
    } else if (t1Wins > 0 || t2Wins > 0 || updatedGames.some((g) => g.status === 'live')) {
      status = 'live';
    }

    const t1Pts =
      overallWinner === 'team1'
        ? match.basePoints
        : overallWinner === 'team2'
        ? match.consolationPoints
        : undefined;

    const t2Pts =
      overallWinner === 'team2'
        ? match.basePoints
        : overallWinner === 'team1'
        ? match.consolationPoints
        : undefined;

    return {
      ...match,
      status,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      detailedScore: {
        type: 'stumble_guys_series',
        data: {
          ...series,
          totalGames: Math.max(series.totalGames, updatedGames.length),
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          games: updatedGames,
        },
      },
    };
  }

  // -------------------------------------------------------------
  // GENERIC MATCH
  // -------------------------------------------------------------
  const winner = match.winnerTeamId;
  const isCompleted = match.status === 'completed' || !!winner;

  let t1Pts = match.team1PointsAwarded;
  let t2Pts = match.team2PointsAwarded;

  if (winner === 'team1') {
    t1Pts = match.basePoints;
    t2Pts = match.consolationPoints;
  } else if (winner === 'team2') {
    t1Pts = match.consolationPoints;
    t2Pts = match.basePoints;
  } else if (!isCompleted) {
    t1Pts = undefined;
    t2Pts = undefined;
  }

  return {
    ...match,
    winnerTeamId: winner,
    team1PointsAwarded: t1Pts,
    team2PointsAwarded: t2Pts,
  };
}
