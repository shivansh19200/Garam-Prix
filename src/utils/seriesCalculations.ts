import {
  Match,
  MatchStatus,
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
 * 1. Changing the match status dropdown (Upcoming, Live, Completed) is strictly
 *    respected and never forcibly overridden.
 * 2. Series game wins (++), scores, and winners are recalculated dynamically.
 * 3. Base & consolation points are awarded to standings when match is completed.
 */
export function recalculateMatchOutcome(match: Match): Match {
  const currentStatus: MatchStatus = match.status || 'upcoming';

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
      const testStatus: MatchStatus = t.status || 'upcoming';
      const t1TotalRuns =
        (t.team1Innings1?.runs || 0) + (t.team1Innings2?.runs || 0);
      const t2TotalRuns =
        (t.team2Innings1?.runs || 0) + (t.team2Innings2?.runs || 0);

      // Auto deduce winner if test is completed and winner not manually selected
      if (!winner && testStatus === 'completed' && (t1TotalRuns > 0 || t2TotalRuns > 0)) {
        if (t1TotalRuns > t2TotalRuns) winner = 'team1';
        else if (t2TotalRuns > t1TotalRuns) winner = 'team2';
        else winner = 'draw';
      }

      // If test is upcoming, winner should not be assigned
      if (testStatus === 'upcoming') {
        winner = null;
      }

      // Only count towards series wins if test is completed
      if (testStatus === 'completed') {
        if (winner === 'team1') t1Wins++;
        else if (winner === 'team2') t2Wins++;
        else if (winner === 'draw') draws++;
      }

      return {
        ...t,
        status: testStatus,
        winnerTeamId: winner,
      };
    });

    let overallWinner: 'team1' | 'team2' | null = match.winnerTeamId || null;
    if (t1Wins > t2Wins) overallWinner = 'team1';
    else if (t2Wins > t1Wins) overallWinner = 'team2';

    // Strictly preserve user/admin status
    const isCompleted = currentStatus === 'completed';

    const t1Pts = isCompleted
      ? (overallWinner === 'team1'
          ? match.basePoints
          : overallWinner === 'team2'
          ? match.consolationPoints
          : undefined)
      : undefined;

    const t2Pts = isCompleted
      ? (overallWinner === 'team2'
          ? match.basePoints
          : overallWinner === 'team1'
          ? match.consolationPoints
          : undefined)
      : undefined;

    return {
      ...match,
      status: currentStatus,
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
      const gameStatus: MatchStatus = g.status || 'upcoming';

      // Deduce winner if scores entered and not upcoming
      if (!winner && gameStatus === 'completed' && (g.team1Score > 0 || g.team2Score > 0)) {
        if (g.team1Score > g.team2Score) winner = 'team1';
        else if (g.team2Score > g.team1Score) winner = 'team2';
      }

      if (gameStatus === 'upcoming') {
        winner = null;
      }

      // Only count completed games towards series wins
      if (gameStatus === 'completed') {
        if (winner === 'team1') t1Wins++;
        else if (winner === 'team2') t2Wins++;
      }

      return {
        ...g,
        status: gameStatus,
        winnerTeamId: winner,
      };
    });

    let overallWinner: 'team1' | 'team2' | null = match.winnerTeamId || null;
    if (t1Wins > t2Wins) overallWinner = 'team1';
    else if (t2Wins > t1Wins) overallWinner = 'team2';

    const isCompleted = currentStatus === 'completed';

    const t1Pts = isCompleted
      ? (overallWinner === 'team1'
          ? match.basePoints
          : overallWinner === 'team2'
          ? match.consolationPoints
          : undefined)
      : undefined;

    const t2Pts = isCompleted
      ? (overallWinner === 'team2'
          ? match.basePoints
          : overallWinner === 'team1'
          ? match.consolationPoints
          : undefined)
      : undefined;

    return {
      ...match,
      status: currentStatus,
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
      const gameStatus: MatchStatus = g.status || 'upcoming';

      if (!winner && gameStatus === 'completed' && (t1Sets > 0 || t2Sets > 0)) {
        if (t1Sets > t2Sets) winner = 'team1';
        else if (t2Sets > t1Sets) winner = 'team2';
      }

      if (gameStatus === 'upcoming') {
        winner = null;
      }

      // Only count completed games towards series wins
      if (gameStatus === 'completed') {
        if (winner === 'team1') t1Wins++;
        else if (winner === 'team2') t2Wins++;
      }

      return {
        ...g,
        status: gameStatus,
        team1SetsWon: t1Sets,
        team2SetsWon: t2Sets,
        winnerTeamId: winner,
      };
    });

    let overallWinner: 'team1' | 'team2' | null = match.winnerTeamId || null;
    if (t1Wins > t2Wins) overallWinner = 'team1';
    else if (t2Wins > t1Wins) overallWinner = 'team2';

    const isCompleted = currentStatus === 'completed';

    const t1Pts = isCompleted
      ? (overallWinner === 'team1'
          ? match.basePoints
          : overallWinner === 'team2'
          ? match.consolationPoints
          : undefined)
      : undefined;

    const t2Pts = isCompleted
      ? (overallWinner === 'team2'
          ? match.basePoints
          : overallWinner === 'team1'
          ? match.consolationPoints
          : undefined)
      : undefined;

    return {
      ...match,
      status: currentStatus,
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
      const gameStatus: MatchStatus = g.status || 'upcoming';

      if (!winner && gameStatus === 'completed' && (g.team1Score > 0 || g.team2Score > 0)) {
        if (g.team1Score > g.team2Score) winner = 'team1';
        else if (g.team2Score > g.team1Score) winner = 'team2';
      }

      if (gameStatus === 'upcoming') {
        winner = null;
      }

      if (gameStatus === 'completed') {
        if (winner === 'team1') t1Wins++;
        else if (winner === 'team2') t2Wins++;
      }

      return {
        ...g,
        status: gameStatus,
        winnerTeamId: winner,
      };
    });

    let overallWinner: 'team1' | 'team2' | null = match.winnerTeamId || null;
    if (t1Wins > t2Wins) overallWinner = 'team1';
    else if (t2Wins > t1Wins) overallWinner = 'team2';

    const isCompleted = currentStatus === 'completed';

    const t1Pts = isCompleted
      ? (overallWinner === 'team1'
          ? match.basePoints
          : overallWinner === 'team2'
          ? match.consolationPoints
          : undefined)
      : undefined;

    const t2Pts = isCompleted
      ? (overallWinner === 'team2'
          ? match.basePoints
          : overallWinner === 'team1'
          ? match.consolationPoints
          : undefined)
      : undefined;

    return {
      ...match,
      status: currentStatus,
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
    if (!winner && (t1 > 0 || t2 > 0)) {
      if (t1 >= 30 || (currentStatus === 'completed' && t1 > t2)) winner = 'team1';
      else if (t2 >= 30 || (currentStatus === 'completed' && t2 > t1)) winner = 'team2';
    }

    if (currentStatus === 'upcoming') {
      winner = null;
    }

    const isCompleted = currentStatus === 'completed';

    const t1Pts = isCompleted
      ? (winner === 'team1'
          ? match.basePoints
          : winner === 'team2'
          ? match.consolationPoints
          : undefined)
      : undefined;

    const t2Pts = isCompleted
      ? (winner === 'team2'
          ? match.basePoints
          : winner === 'team1'
          ? match.consolationPoints
          : undefined)
      : undefined;

    return {
      ...match,
      status: currentStatus,
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
      const gameStatus: MatchStatus = g.status || 'upcoming';

      if (!winner && gameStatus === 'completed' && (t1Sets > 0 || t2Sets > 0)) {
        if (t1Sets > t2Sets) winner = 'team1';
        else if (t2Sets > t1Sets) winner = 'team2';
      }

      if (gameStatus === 'upcoming') {
        winner = null;
      }

      if (gameStatus === 'completed') {
        if (winner === 'team1') t1Wins++;
        else if (winner === 'team2') t2Wins++;
      }

      return {
        ...g,
        status: gameStatus,
        team1SetsWon: t1Sets,
        team2SetsWon: t2Sets,
        winnerTeamId: winner,
      };
    });

    let overallWinner: 'team1' | 'team2' | null = match.winnerTeamId || null;
    if (t1Wins > t2Wins) overallWinner = 'team1';
    else if (t2Wins > t1Wins) overallWinner = 'team2';

    const isCompleted = currentStatus === 'completed';

    const t1Pts = isCompleted
      ? (overallWinner === 'team1'
          ? match.basePoints
          : overallWinner === 'team2'
          ? match.consolationPoints
          : undefined)
      : undefined;

    const t2Pts = isCompleted
      ? (overallWinner === 'team2'
          ? match.basePoints
          : overallWinner === 'team1'
          ? match.consolationPoints
          : undefined)
      : undefined;

    return {
      ...match,
      status: currentStatus,
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
      const gameStatus: MatchStatus = g.status || 'upcoming';

      if (!winner && gameStatus === 'completed' && (g.team1Score > 0 || g.team2Score > 0)) {
        if (g.team1Score > g.team2Score) winner = 'team1';
        else if (g.team2Score > g.team1Score) winner = 'team2';
      }

      if (gameStatus === 'upcoming') {
        winner = null;
      }

      if (gameStatus === 'completed') {
        if (winner === 'team1') t1Wins++;
        else if (winner === 'team2') t2Wins++;
      }

      return {
        ...g,
        status: gameStatus,
        winnerTeamId: winner,
      };
    });

    let overallWinner: 'team1' | 'team2' | null = match.winnerTeamId || null;
    if (t1Wins > t2Wins) overallWinner = 'team1';
    else if (t2Wins > t1Wins) overallWinner = 'team2';

    const isCompleted = currentStatus === 'completed';

    const t1Pts = isCompleted
      ? (overallWinner === 'team1'
          ? match.basePoints
          : overallWinner === 'team2'
          ? match.consolationPoints
          : undefined)
      : undefined;

    const t2Pts = isCompleted
      ? (overallWinner === 'team2'
          ? match.basePoints
          : overallWinner === 'team1'
          ? match.consolationPoints
          : undefined)
      : undefined;

    return {
      ...match,
      status: currentStatus,
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
  const isCompleted = currentStatus === 'completed';

  let t1Pts: number | undefined = undefined;
  let t2Pts: number | undefined = undefined;

  if (isCompleted) {
    if (winner === 'team1') {
      t1Pts = match.basePoints;
      t2Pts = match.consolationPoints;
    } else if (winner === 'team2') {
      t1Pts = match.consolationPoints;
      t2Pts = match.basePoints;
    }
  }

  return {
    ...match,
    status: currentStatus,
    winnerTeamId: winner,
    team1PointsAwarded: t1Pts,
    team2PointsAwarded: t2Pts,
  };
}
