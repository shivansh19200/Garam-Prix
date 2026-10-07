import React, { useState, useEffect } from 'react';
import {
  Match,
  MatchStatus,
  Team,
  Player,
  MatchUpdate,
  CricketTestMatch,
  DetailedCricketSeries,
  DetailedBasketballRace30,
  DetailedSmashKartsSeries,
  SmashKartsGame,
  DetailedBadmintonSeries,
  BadmintonGame,
  DetailedFootvolleySeries,
  FootvolleyGame,
  DetailedTableTennisSeries,
  TableTennisGame,
  DetailedStumbleGuysSeries,
  StumbleGuysGame,
} from '../types/tournament';
import { formatMatchScoreDisplay } from '../utils/cricketFormat';
import { recalculateMatchOutcome } from '../utils/seriesCalculations';
import { X, ExternalLink, Plus, Edit2, Trash2, Send, RotateCcw, Award } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface GameScoreDetailModalProps {
  match: Match | null;
  team1: Team;
  team2: Team;
  players?: Player[];
  isAdmin: boolean;
  onClose: () => void;
  onUpdateMatch: (updated: Match) => void;
  onDeleteMatch?: (matchId: string) => void;
  onOpenAdminLogin: () => void;
}

export const GameScoreDetailModal: React.FC<GameScoreDetailModalProps> = ({
  match,
  team1,
  team2,
  players = [],
  isAdmin,
  onClose,
  onUpdateMatch,
  onDeleteMatch,
  onOpenAdminLogin,
}) => {
  if (!match) return null;

  // Custom in-app confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  // Generic score / status
  const [t1ScoreInput, setT1ScoreInput] = useState(match.team1ScoreDisplay || '');
  const [t2ScoreInput, setT2ScoreInput] = useState(match.team2ScoreDisplay || '');
  const [matchStatusInput, setMatchStatusInput] = useState(match.status);
  const [winnerTeamInput, setWinnerTeamInput] = useState<'team1' | 'team2' | ''>(
    match.winnerTeamId || ''
  );
  const [newUpdateText, setNewUpdateText] = useState('');

  useEffect(() => {
    setMatchStatusInput(match.status);
    setT1ScoreInput(match.team1ScoreDisplay || '');
    setT2ScoreInput(match.team2ScoreDisplay || '');
    setWinnerTeamInput(match.winnerTeamId || '');
  }, [match.status, match.team1ScoreDisplay, match.team2ScoreDisplay, match.winnerTeamId]);

  // Series helpers
  const cricketSeries: DetailedCricketSeries | null =
    match.detailedScore?.type === 'cricket_series' ? match.detailedScore.data : null;

  const bballRace: DetailedBasketballRace30 | null =
    match.detailedScore?.type === 'basketball_race30' ? match.detailedScore.data : null;

  const smashSeries: DetailedSmashKartsSeries | null =
    match.detailedScore?.type === 'smash_karts_series' ? match.detailedScore.data : null;

  const badmintonSeries: DetailedBadmintonSeries | null =
    match.detailedScore?.type === 'badminton_series' ? match.detailedScore.data : null;

  const footvolleySeries: DetailedFootvolleySeries | null =
    match.detailedScore?.type === 'footvolley_series' ? match.detailedScore.data : null;

  const tableTennisSeries: DetailedTableTennisSeries | null =
    match.detailedScore?.type === 'table_tennis_series' ? match.detailedScore.data : null;

  const stumbleGuysSeries: DetailedStumbleGuysSeries | null =
    match.detailedScore?.type === 'stumble_guys_series' ? match.detailedScore.data : null;

  // Modals and editing state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Cricket Add Form
  const [newCricketTitle, setNewCricketTitle] = useState('');
  const [newCricketVenue, setNewCricketVenue] = useState('');
  const [newCricketDate, setNewCricketDate] = useState('');

  // Smash Karts Add Form
  const [newSmashType, setNewSmashType] = useState<'TDM' | 'CTF'>('TDM');
  const [newSmashArena, setNewSmashArena] = useState('');
  const [newSmashT1Score, setNewSmashT1Score] = useState(0);
  const [newSmashT2Score, setNewSmashT2Score] = useState(0);

  // Badminton Add Form
  const [newBadMatchType, setNewBadMatchType] = useState<'1st Singles' | 'Doubles' | '2nd Singles'>('1st Singles');

  // Footvolley Add Form
  const [newFvT1Score, setNewFvT1Score] = useState(0);
  const [newFvT2Score, setNewFvT2Score] = useState(0);

  // Scorecard photo redirection (does NOT display photo, redirects directly to external link)
  const handleScorecardClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Derive series duel scores matching image.png
  let seriesT1Score = '0';
  let seriesT2Score = '0';
  let seriesRuleTitle = match.subtitleTag;
  let seriesStatusDesc = '';

  if (cricketSeries) {
    seriesT1Score = String(cricketSeries.team1SeriesWins);
    seriesT2Score = String(cricketSeries.team2SeriesWins);
    seriesRuleTitle = '5-Match Test Series';
    seriesStatusDesc =
      cricketSeries.team1SeriesWins > cricketSeries.team2SeriesWins
        ? `${team1.name} leads ${seriesT1Score}-${seriesT2Score}`
        : cricketSeries.team2SeriesWins > cricketSeries.team1SeriesWins
        ? `${team2.name} leads ${seriesT2Score}-${seriesT1Score}`
        : 'Series level 0-0';
  } else if (bballRace) {
    seriesT1Score = String(bballRace.team1Points);
    seriesT2Score = String(bballRace.team2Points);
    seriesRuleTitle = 'First to 30 Points';
    seriesStatusDesc = bballRace.winnerTeamId
      ? `${bballRace.winnerTeamId === 'team1' ? team1.name : team2.name} won race`
      : 'In progress · Target 30';
  } else if (smashSeries) {
    seriesT1Score = String(smashSeries.team1SeriesWins);
    seriesT2Score = String(smashSeries.team2SeriesWins);
    seriesRuleTitle = '7-Game Series (First to 4)';
    seriesStatusDesc =
      smashSeries.team1SeriesWins >= 4
        ? `${team1.name} won series 4-${smashSeries.team2SeriesWins}`
        : smashSeries.team2SeriesWins >= 4
        ? `${team2.name} won series 4-${smashSeries.team1SeriesWins}`
        : `${team1.name} ${seriesT1Score} - ${seriesT2Score} ${team2.name}`;
  } else if (badmintonSeries) {
    seriesT1Score = String(badmintonSeries.team1SeriesWins);
    seriesT2Score = String(badmintonSeries.team2SeriesWins);
    seriesRuleTitle = '3-Game Series (First to 2)';
    seriesStatusDesc =
      badmintonSeries.team1SeriesWins >= 2
        ? `${team1.name} won series`
        : badmintonSeries.team2SeriesWins >= 2
        ? `${team2.name} won series`
        : `${team1.name} ${seriesT1Score} - ${seriesT2Score} ${team2.name}`;
  } else if (footvolleySeries) {
    seriesT1Score = String(footvolleySeries.team1SeriesWins);
    seriesT2Score = String(footvolleySeries.team2SeriesWins);
    seriesRuleTitle = '3-Game Series (25 Pts Each)';
    seriesStatusDesc =
      footvolleySeries.team1SeriesWins >= 2
        ? `${team1.name} won series`
        : footvolleySeries.team2SeriesWins >= 2
        ? `${team2.name} won series`
        : `${team1.name} ${seriesT1Score} - ${seriesT2Score} ${team2.name}`;
  } else if (tableTennisSeries) {
    seriesT1Score = String(tableTennisSeries.team1SeriesWins);
    seriesT2Score = String(tableTennisSeries.team2SeriesWins);
    seriesRuleTitle = '3-Game Series (21 Pts Sets)';
    seriesStatusDesc =
      tableTennisSeries.team1SeriesWins >= 2
        ? `${team1.name} won series ${seriesT1Score}-${seriesT2Score}`
        : tableTennisSeries.team2SeriesWins >= 2
        ? `${team2.name} won series ${seriesT2Score}-${seriesT1Score}`
        : `${team1.name} ${seriesT1Score} - ${seriesT2Score} ${team2.name}`;
  } else if (stumbleGuysSeries) {
    seriesT1Score = String(stumbleGuysSeries.team1SeriesWins);
    seriesT2Score = String(stumbleGuysSeries.team2SeriesWins);
    seriesRuleTitle = '5-Game Series (First to 3)';
    seriesStatusDesc =
      stumbleGuysSeries.team1SeriesWins >= 3
        ? `${team1.name} won series ${seriesT1Score}-${seriesT2Score}`
        : stumbleGuysSeries.team2SeriesWins >= 3
        ? `${team2.name} won series ${seriesT2Score}-${seriesT1Score}`
        : `${team1.name} ${seriesT1Score} - ${seriesT2Score} ${team2.name}`;
  } else {
    seriesT1Score = match.team1ScoreDisplay || '0';
    seriesT2Score = match.team2ScoreDisplay || '0';
    seriesRuleTitle = match.subtitleTag;
    seriesStatusDesc = match.status === 'completed' ? 'Final Score' : 'Score';
  }

  // -------------------------------------------------------------
  // CRICKET HANDLERS (Add, Update, Delete)
  // -------------------------------------------------------------
  const handleAddCricketTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !cricketSeries) return;

    const nextNum = cricketSeries.tests.length + 1;
    const newTest: CricketTestMatch = {
      id: 'test_' + Date.now(),
      testNumber: nextNum,
      title: newCricketTitle.trim() || `Test ${nextNum} of ${Math.max(5, nextNum)}`,
      venue: newCricketVenue.trim() || 'Championship Turf',
      date: newCricketDate.trim() || 'TBD',
      status: 'upcoming',
      team1Innings1: { runs: 0, wickets: 0 },
      team2Innings1: { runs: 0, wickets: 0 },
      team1Innings2: { runs: 0, wickets: 0 },
      team2Innings2: { runs: 0, wickets: 0 },
    };

    const updatedTests = [...cricketSeries.tests, newTest];
    const updatedSeries: DetailedCricketSeries = {
      ...cricketSeries,
      totalTests: Math.max(cricketSeries.totalTests, updatedTests.length),
      tests: updatedTests,
    };

    onUpdateMatch({
      ...match,
      detailedScore: { type: 'cricket_series', data: updatedSeries },
    });
    setShowAddModal(false);
    setNewCricketTitle('');
    setNewCricketVenue('');
    setNewCricketDate('');
  };

  const handleDeleteCricketTest = (testId: string) => {
    if (!isAdmin || !cricketSeries) return;
    const test = cricketSeries.tests.find((t) => t.id === testId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Test Match?',
      message: `Delete ${test?.title || 'this test match'} from the Cricket series? Series scores and standings will recalculate automatically.`,
      confirmLabel: 'Delete Test',
      onConfirm: () => {
        const updatedTests = cricketSeries.tests.filter((t) => t.id !== testId);
        let t1Wins = 0;
        let t2Wins = 0;
        let draws = 0;
        updatedTests.forEach((t) => {
          if (t.winnerTeamId === 'team1') t1Wins++;
          else if (t.winnerTeamId === 'team2') t2Wins++;
          else if (t.winnerTeamId === 'draw') draws++;
        });

        const updatedSeries: DetailedCricketSeries = {
          ...cricketSeries,
          tests: updatedTests,
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          draws,
        };

        onUpdateMatch({
          ...match,
          team1ScoreDisplay: String(t1Wins),
          team2ScoreDisplay: String(t2Wins),
          detailedScore: { type: 'cricket_series', data: updatedSeries },
        });
      },
    });
  };

  const handleUpdateCricketTest = (testId: string, partial: Partial<CricketTestMatch>) => {
    if (!isAdmin || !cricketSeries) return;

    let t1Wins = 0;
    let t2Wins = 0;
    let draws = 0;

    const updatedTests = cricketSeries.tests.map((t) => {
      let updated = t.id === testId ? { ...t, ...partial } : t;
      if (updated.status === 'upcoming') {
        updated = { ...updated, winnerTeamId: null };
      }
      if (updated.status === 'completed') {
        if (updated.winnerTeamId === 'team1') t1Wins++;
        else if (updated.winnerTeamId === 'team2') t2Wins++;
        else if (updated.winnerTeamId === 'draw') draws++;
      }
      return updated;
    });

    const isSeriesDecided =
      t1Wins >= 3 || t2Wins >= 3 || updatedTests.every((t) => t.status === 'completed');
    let overallWinner: 'team1' | 'team2' | null = match.winnerTeamId || null;

    if (t1Wins > t2Wins && isSeriesDecided) {
      overallWinner = 'team1';
    } else if (t2Wins > t1Wins && isSeriesDecided) {
      overallWinner = 'team2';
    }

    const updatedSeries: DetailedCricketSeries = {
      ...cricketSeries,
      tests: updatedTests,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      draws,
    };

    onUpdateMatch({
      ...match,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      detailedScore: { type: 'cricket_series', data: updatedSeries },
    });
  };

  // -------------------------------------------------------------
  // SMASH KARTS HANDLERS (7 games, TDM/CTF alternate)
  // -------------------------------------------------------------
  const handleAddSmashGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !smashSeries) return;

    const nextNum = smashSeries.games.length + 1;
    const winner: 'team1' | 'team2' | null =
      newSmashT1Score > newSmashT2Score && (newSmashT1Score > 0 || newSmashT2Score > 0)
        ? 'team1'
        : newSmashT2Score > newSmashT1Score && (newSmashT1Score > 0 || newSmashT2Score > 0)
        ? 'team2'
        : null;

    const newGame: SmashKartsGame = {
      id: 'sk_' + Date.now(),
      gameNumber: nextNum,
      type: newSmashType,
      arena: newSmashArena.trim() || undefined,
      team1Score: newSmashT1Score,
      team2Score: newSmashT2Score,
      status: winner ? 'completed' : 'upcoming',
      winnerTeamId: winner,
    };

    const updatedGames = [...smashSeries.games, newGame];
    const updatedSeries: DetailedSmashKartsSeries = {
      ...smashSeries,
      totalGames: Math.max(smashSeries.totalGames, updatedGames.length),
      games: updatedGames,
    };

    const updatedMatch: Match = {
      ...match,
      detailedScore: { type: 'smash_karts_series', data: updatedSeries },
    };

    onUpdateMatch(recalculateMatchOutcome(updatedMatch));

    setShowAddModal(false);
    setNewSmashArena('');
    setNewSmashT1Score(0);
    setNewSmashT2Score(0);
    // Alternate next default type
    setNewSmashType(newSmashType === 'TDM' ? 'CTF' : 'TDM');
  };

  const handleDeleteSmashGame = (gameId: string) => {
    if (!isAdmin || !smashSeries) return;
    const g = smashSeries.games.find((item) => item.id === gameId);
    setConfirmDialog({
      isOpen: true,
      title: `Delete Smash Karts Game ${g?.gameNumber || ''}?`,
      message: `Delete this game from Smash Karts series? Series scores will update automatically.`,
      confirmLabel: 'Delete Game',
      onConfirm: () => {
        const updatedGames = smashSeries.games.filter((item) => item.id !== gameId);
        const updatedSeries: DetailedSmashKartsSeries = {
          ...smashSeries,
          games: updatedGames,
        };

        const updatedMatch: Match = {
          ...match,
          detailedScore: { type: 'smash_karts_series', data: updatedSeries },
        };

        onUpdateMatch(recalculateMatchOutcome(updatedMatch));
      },
    });
  };

  const handleUpdateSmashGame = (gameId: string, partial: Partial<SmashKartsGame>) => {
    if (!isAdmin || !smashSeries) return;

    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = smashSeries.games.map((g) => {
      if (g.id !== gameId) {
        if (g.status === 'completed') {
          if (g.winnerTeamId === 'team1') t1Wins++;
          else if (g.winnerTeamId === 'team2') t2Wins++;
        }
        return g;
      }
      const updated = { ...g, ...partial };
      if (!partial.status) {
        if (updated.team1Score > updated.team2Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
          updated.winnerTeamId = 'team1';
          updated.status = 'completed';
        } else if (updated.team2Score > updated.team1Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
          updated.winnerTeamId = 'team2';
          updated.status = 'completed';
        }
      }
      if (updated.status === 'upcoming') {
        updated.winnerTeamId = null;
      }
      if (updated.status === 'completed') {
        if (updated.winnerTeamId === 'team1') t1Wins++;
        else if (updated.winnerTeamId === 'team2') t2Wins++;
      }
      return updated;
    });

    const seriesWinner = t1Wins >= smashSeries.targetWins ? 'team1' : t2Wins >= smashSeries.targetWins ? 'team2' : match.winnerTeamId || null;

    const updatedSeries: DetailedSmashKartsSeries = {
      ...smashSeries,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    const updatedMatch: Match = {
      ...match,
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      detailedScore: { type: 'smash_karts_series', data: updatedSeries },
    };

    onUpdateMatch(recalculateMatchOutcome(updatedMatch));
  };

  // -------------------------------------------------------------
  // BADMINTON HANDLERS (1st Singles, Doubles, 2nd Singles; 11-11-21)
  // -------------------------------------------------------------
  const handleUpdateBadmintonGame = (gameId: string, partial: Partial<BadmintonGame>) => {
    if (!isAdmin || !badmintonSeries) return;

    let t1Wins = 0;
    let t2Wins = 0;
    const updatedGames = badmintonSeries.games.map((g) => {
      let updated = g.id === gameId ? { ...g, ...partial } : g;
      if (updated.status === 'upcoming') {
        updated = { ...updated, winnerTeamId: null };
      }
      if (updated.status === 'completed') {
        if (updated.winnerTeamId === 'team1') t1Wins++;
        else if (updated.winnerTeamId === 'team2') t2Wins++;
      }
      return updated;
    });

    const seriesWinner = t1Wins >= badmintonSeries.targetWins ? 'team1' : t2Wins >= badmintonSeries.targetWins ? 'team2' : match.winnerTeamId || null;

    const updatedSeries: DetailedBadmintonSeries = {
      ...badmintonSeries,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    const updatedMatch: Match = {
      ...match,
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      detailedScore: { type: 'badminton_series', data: updatedSeries },
    };

    onUpdateMatch(recalculateMatchOutcome(updatedMatch));
  };

  // -------------------------------------------------------------
  // FOOTVOLLEY HANDLERS (3-game series, 25 points each)
  // -------------------------------------------------------------
  const handleUpdateFootvolleyGame = (gameId: string, partial: Partial<FootvolleyGame>) => {
    if (!isAdmin || !footvolleySeries) return;

    let t1Wins = 0;
    let t2Wins = 0;
    const updatedGames = footvolleySeries.games.map((g) => {
      let updated = g.id === gameId ? { ...g, ...partial } : g;
      if (updated.status === 'upcoming') {
        updated = { ...updated, winnerTeamId: null };
      }
      if (updated.status === 'completed') {
        if (updated.winnerTeamId === 'team1') t1Wins++;
        else if (updated.winnerTeamId === 'team2') t2Wins++;
      }
      return updated;
    });

    const seriesWinner = t1Wins >= footvolleySeries.targetWins ? 'team1' : t2Wins >= footvolleySeries.targetWins ? 'team2' : match.winnerTeamId || null;

    const updatedSeries: DetailedFootvolleySeries = {
      ...footvolleySeries,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    const updatedMatch: Match = {
      ...match,
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      detailedScore: { type: 'footvolley_series', data: updatedSeries },
    };

    onUpdateMatch(recalculateMatchOutcome(updatedMatch));
  };

  // -------------------------------------------------------------
  // BASKETBALL RACE TO 30
  // -------------------------------------------------------------
  const handleAddBasketballPoints = (teamId: 'team1' | 'team2', delta: number) => {
    if (!isAdmin || !bballRace) return;

    const currentT1 = bballRace.team1Points;
    const currentT2 = bballRace.team2Points;

    const newT1 = teamId === 'team1' ? Math.max(0, currentT1 + delta) : currentT1;
    const newT2 = teamId === 'team2' ? Math.max(0, currentT2 + delta) : currentT2;

    const isT1Winner = newT1 >= 30;
    const isT2Winner = newT2 >= 30;
    const winner: 'team1' | 'team2' | null = isT1Winner ? 'team1' : isT2Winner ? 'team2' : match.winnerTeamId || null;

    const updatedBball: DetailedBasketballRace30 = {
      ...bballRace,
      team1Points: newT1,
      team2Points: newT2,
      winnerTeamId: winner,
    };

    const updatedMatch: Match = {
      ...match,
      winnerTeamId: winner,
      team1ScoreDisplay: String(newT1),
      team2ScoreDisplay: String(newT2),
      detailedScore: { type: 'basketball_race30', data: updatedBball },
    };

    onUpdateMatch(recalculateMatchOutcome(updatedMatch));
  };

  // -------------------------------------------------------------
  // TABLE TENNIS HANDLERS (3-game series, 21-pt sets, first to 2)
  // -------------------------------------------------------------
  const handleUpdateTableTennisGame = (gameId: string, partial: Partial<TableTennisGame>) => {
    if (!isAdmin || !tableTennisSeries) return;

    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = tableTennisSeries.games.map((g) => {
      if (g.id !== gameId) {
        if (g.status === 'completed') {
          if (g.winnerTeamId === 'team1') t1Wins++;
          else if (g.winnerTeamId === 'team2') t2Wins++;
        }
        return g;
      }
      const updated = { ...g, ...partial };
      let t1Sets = 0;
      let t2Sets = 0;
      if (updated.set1.team1 > updated.set1.team2 && (updated.set1.team1 > 0 || updated.set1.team2 > 0)) t1Sets++;
      else if (updated.set1.team2 > updated.set1.team1 && (updated.set1.team1 > 0 || updated.set1.team2 > 0)) t2Sets++;

      if (updated.set2.team1 > updated.set2.team2 && (updated.set2.team1 > 0 || updated.set2.team2 > 0)) t1Sets++;
      else if (updated.set2.team2 > updated.set2.team1 && (updated.set2.team1 > 0 || updated.set2.team2 > 0)) t2Sets++;

      if (updated.set3.team1 > updated.set3.team2 && (updated.set3.team1 > 0 || updated.set3.team2 > 0)) t1Sets++;
      else if (updated.set3.team2 > updated.set3.team1 && (updated.set3.team1 > 0 || updated.set3.team2 > 0)) t2Sets++;

      updated.team1SetsWon = t1Sets;
      updated.team2SetsWon = t2Sets;

      if (!partial.status && !partial.winnerTeamId) {
        if (t1Sets >= 2) {
          updated.winnerTeamId = 'team1';
          updated.status = 'completed';
        } else if (t2Sets >= 2) {
          updated.winnerTeamId = 'team2';
          updated.status = 'completed';
        } else if (t1Sets > 0 || t2Sets > 0) {
          updated.status = 'live';
        }
      }

      if (updated.status === 'upcoming') {
        updated.winnerTeamId = null;
      }

      if (updated.status === 'completed') {
        if (updated.winnerTeamId === 'team1') t1Wins++;
        else if (updated.winnerTeamId === 'team2') t2Wins++;
      }

      return updated;
    });

    const seriesWinner = t1Wins >= tableTennisSeries.targetWins ? 'team1' : t2Wins >= tableTennisSeries.targetWins ? 'team2' : match.winnerTeamId || null;

    const updatedSeries: DetailedTableTennisSeries = {
      ...tableTennisSeries,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    const updatedMatch: Match = {
      ...match,
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      detailedScore: { type: 'table_tennis_series', data: updatedSeries },
    };

    onUpdateMatch(recalculateMatchOutcome(updatedMatch));
  };

  // -------------------------------------------------------------
  // STUMBLE GUYS HANDLERS (5-game series, first to 3 wins)
  // -------------------------------------------------------------
  const handleUpdateStumbleGuysGame = (gameId: string, partial: Partial<StumbleGuysGame>) => {
    if (!isAdmin || !stumbleGuysSeries) return;

    let t1Wins = 0;
    let t2Wins = 0;

    const updatedGames = stumbleGuysSeries.games.map((g) => {
      if (g.id !== gameId) {
        if (g.status === 'completed') {
          if (g.winnerTeamId === 'team1') t1Wins++;
          else if (g.winnerTeamId === 'team2') t2Wins++;
        }
        return g;
      }
      const updated = { ...g, ...partial };
      if (!partial.status && !partial.winnerTeamId) {
        if (updated.team1Score > updated.team2Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
          updated.winnerTeamId = 'team1';
          updated.status = 'completed';
        } else if (updated.team2Score > updated.team1Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
          updated.winnerTeamId = 'team2';
          updated.status = 'completed';
        }
      }

      if (updated.status === 'upcoming') {
        updated.winnerTeamId = null;
      }

      if (updated.status === 'completed') {
        if (updated.winnerTeamId === 'team1') t1Wins++;
        else if (updated.winnerTeamId === 'team2') t2Wins++;
      }

      return updated;
    });

    const seriesWinner = t1Wins >= stumbleGuysSeries.targetWins ? 'team1' : t2Wins >= stumbleGuysSeries.targetWins ? 'team2' : match.winnerTeamId || null;

    const updatedSeries: DetailedStumbleGuysSeries = {
      ...stumbleGuysSeries,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    const updatedMatch: Match = {
      ...match,
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      detailedScore: { type: 'stumble_guys_series', data: updatedSeries },
    };

    onUpdateMatch(recalculateMatchOutcome(updatedMatch));
  };

  const handleDeleteStumbleGuysGame = (gameId: string) => {
    if (!isAdmin || !stumbleGuysSeries) return;
    const g = stumbleGuysSeries.games.find((item) => item.id === gameId);
    setConfirmDialog({
      isOpen: true,
      title: `Delete Stumble Guys Game ${g?.gameNumber || ''}?`,
      message: `Delete this game (${g?.mapName || ''}) from the series? Series scores will update automatically.`,
      confirmLabel: 'Delete Game',
      onConfirm: () => {
        const updatedGames = stumbleGuysSeries.games.filter((item) => item.id !== gameId);
        let t1Wins = 0;
        let t2Wins = 0;
        updatedGames.forEach((item) => {
          if (item.winnerTeamId === 'team1') t1Wins++;
          else if (item.winnerTeamId === 'team2') t2Wins++;
        });

        const isWinner = t1Wins >= stumbleGuysSeries.targetWins || t2Wins >= stumbleGuysSeries.targetWins;
        const seriesWinner = t1Wins >= stumbleGuysSeries.targetWins ? 'team1' : t2Wins >= stumbleGuysSeries.targetWins ? 'team2' : null;

        const updatedSeries: DetailedStumbleGuysSeries = {
          ...stumbleGuysSeries,
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
          games: updatedGames,
        };

        onUpdateMatch({
          ...match,
          status: isWinner ? 'completed' : (t1Wins > 0 || t2Wins > 0 ? 'live' : match.status),
          winnerTeamId: seriesWinner,
          team1ScoreDisplay: String(t1Wins),
          team2ScoreDisplay: String(t2Wins),
          team1PointsAwarded: seriesWinner === 'team1' ? match.basePoints : seriesWinner === 'team2' ? match.consolationPoints : undefined,
          team2PointsAwarded: seriesWinner === 'team2' ? match.basePoints : seriesWinner === 'team1' ? match.consolationPoints : undefined,
          detailedScore: { type: 'stumble_guys_series', data: updatedSeries },
        });
      },
    });
  };

  const handleDeleteMatchClick = () => {
    if (!isAdmin || !onDeleteMatch) return;
    setConfirmDialog({
      isOpen: true,
      title: `Delete Match: ${match.gameName}?`,
      message: `Permanently delete ${match.gameName} from the championship schedule? Standings and points will recalculate immediately.`,
      confirmLabel: 'Delete Match',
      onConfirm: () => {
        onDeleteMatch(match.id);
        onClose();
      },
    });
  };

  // -------------------------------------------------------------
  // GENERIC SCORE HANDLER
  // -------------------------------------------------------------
  const handleSaveGenericScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const isCompleted = matchStatusInput === 'completed';
    let t1Pts = match.team1PointsAwarded;
    let t2Pts = match.team2PointsAwarded;

    if (isCompleted || winnerTeamInput) {
      if (winnerTeamInput === 'team1') {
        t1Pts = match.basePoints;
        t2Pts = match.consolationPoints;
      } else if (winnerTeamInput === 'team2') {
        t1Pts = match.consolationPoints;
        t2Pts = match.basePoints;
      }
    }

    onUpdateMatch({
      ...match,
      team1ScoreDisplay: t1ScoreInput.trim(),
      team2ScoreDisplay: t2ScoreInput.trim(),
      status: matchStatusInput,
      winnerTeamId: (winnerTeamInput as 'team1' | 'team2') || null,
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
    });
  };

  const handleAddCommentary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newUpdateText.trim()) return;

    const newUpdate: MatchUpdate = {
      id: 'up_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'general',
      text: newUpdateText.trim(),
    };

    onUpdateMatch({
      ...match,
      updates: [newUpdate, ...match.updates],
    });
    setNewUpdateText('');
  };

  const handleDeleteCommentary = (updateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    onUpdateMatch({
      ...match,
      updates: match.updates.filter((u) => u.id !== updateId),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e1216] border border-white/[0.1] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{match.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-white">{match.gameName}</h3>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {match.tier} · {match.basePoints} PTS
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-[#141824] border border-white/10 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
                <select
                  value={match.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as MatchStatus;
                    setMatchStatusInput(newStatus);
                    onUpdateMatch({
                      ...match,
                      status: newStatus,
                    });
                  }}
                  className="bg-transparent font-semibold text-white outline-none cursor-pointer"
                >
                  <option value="upcoming" className="bg-[#141824] text-white">Upcoming</option>
                  <option value="live" className="bg-[#141824] text-amber-300">🔴 Live</option>
                  <option value="completed" className="bg-[#141824] text-emerald-400">✓ Completed</option>
                </select>
              </div>
            ) : (
              <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                match.status === 'live'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                  : match.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}>
                {match.status === 'live' ? '🔴 Live' : match.status === 'completed' ? '✓ Completed' : 'Upcoming'}
              </span>
            )}

            {isAdmin && onDeleteMatch && (
              <button
                type="button"
                onClick={handleDeleteMatchClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Delete this match from tournament"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Match</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* ======================================================== */}
          {/* DUEL CARD HEADER (EXACT REPLICA OF image.png)            */}
          {/* ======================================================== */}
          <div className="p-6 bg-[#141824] border border-white/[0.06] rounded-2xl text-center space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-medium">
              CURRENT STANDING
            </span>

            {/* The 2-column duel score as shown in image.png */}
            <div className="grid grid-cols-2 items-center text-center max-w-[260px] mx-auto py-2">
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-normal">{team1.name}</div>
                <div className="text-5xl sm:text-6xl font-light text-[#ff5c5c] leading-none">
                  {seriesT1Score}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-normal">{team2.name}</div>
                <div className="text-5xl sm:text-6xl font-light text-[#00b4d8] leading-none">
                  {seriesT2Score}
                </div>
              </div>
            </div>

            {seriesStatusDesc && (
              <div className="text-xs text-slate-400 font-light pt-1">{seriesStatusDesc}</div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 🏏 CRICKET 5-MATCH TEST SERIES                          */}
          {/* ======================================================== */}
          {cricketSeries && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">Test Matches</h4>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Test Match</span>
                  </button>
                )}
              </div>

              {/* Add Test Form */}
              {showAddModal && isAdmin && (
                <form
                  onSubmit={handleAddCricketTest}
                  className="p-4 bg-[#1a202f] border border-white/10 rounded-xl space-y-3 text-xs"
                >
                  <span className="font-semibold text-white block">Schedule New Test Match</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newCricketTitle}
                      onChange={(e) => setNewCricketTitle(e.target.value)}
                      placeholder={`Test ${cricketSeries.tests.length + 1} of 5`}
                      className="bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      value={newCricketVenue}
                      onChange={(e) => setNewCricketVenue(e.target.value)}
                      placeholder="Venue"
                      className="bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      value={newCricketDate}
                      onChange={(e) => setNewCricketDate(e.target.value)}
                      placeholder="Date (e.g. 15–19 Aug)"
                      className="bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3 py-1 bg-white/10 text-white rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-white text-black font-semibold rounded hover:bg-slate-200 cursor-pointer"
                    >
                      Add Match
                    </button>
                  </div>
                </form>
              )}

              {/* Matches List */}
              <div className="space-y-3">
                {cricketSeries.tests.map((test) => {
                  const isLive = test.status === 'live';
                  const t1Scores = formatMatchScoreDisplay(test.team1Innings1, test.team1Innings2, isLive);
                  const t2Scores = formatMatchScoreDisplay(test.team2Innings1, test.team2Innings2, isLive);

                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-[#141824] border border-white/[0.06] rounded-xl space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.04]">
                        <span className="font-semibold text-white">{test.title} · {test.venue}</span>
                        <div className="flex items-center gap-2">
                          <span className={isLive ? 'text-red-400 font-bold uppercase' : 'capitalize'}>
                            {test.status}
                          </span>
                          <span>·</span>
                          <span>{test.date}</span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCricketTest(test.id)}
                              className="text-slate-500 hover:text-red-400 ml-1 cursor-pointer"
                              title="Delete Test Match"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="space-y-1.5 text-sm py-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="font-medium text-white">{team1.name}</span>
                          </div>
                          <span className="font-normal text-white">{t1Scores}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                            <span className="font-medium text-white">{team2.name}</span>
                          </div>
                          <span className="font-normal text-white">{t2Scores}</span>
                        </div>
                      </div>

                      {/* MVP Badge if chosen */}
                      {Boolean(test.mvp || test.mvpPlayerId) && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-semibold text-amber-400">Test MVP:</span>
                          <span className="text-white font-medium">
                            {test.mvp || players.find((p) => p.id === test.mvpPlayerId)?.name}
                          </span>
                        </div>
                      )}

                      {/* Result line & Scorecard link */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                        <span className="text-slate-300 font-medium">
                          {test.resultSummary || (isLive ? 'In progress' : 'Scheduled')}
                        </span>
                        <div className="flex items-center gap-3">
                          {test.scorecardImageUrl && (
                            <button
                              type="button"
                              onClick={(e) => handleScorecardClick(test.scorecardImageUrl!, e)}
                              className="text-white hover:text-slate-300 underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Scorecard</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setEditingItemId(editingItemId === test.id ? null : test.id)}
                              className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>{editingItemId === test.id ? 'Close' : 'Edit Innings & MVP'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Editing form for test innings */}
                      {editingItemId === test.id && isAdmin && (
                        <div className="p-4 bg-[#0a0c10] border border-white/10 rounded-xl space-y-3 mt-3">
                          <span className="font-semibold text-white block uppercase text-[11px]">
                            Edit Innings, MVP & Scorecard Link
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2 p-2.5 bg-[#141824] rounded-lg border border-red-500/20">
                              <span className="text-red-400 font-semibold block">{team1.name}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block">1st Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team1Innings1.runs}
                                    onChange={(e) => handleUpdateCricketTest(test.id, {
                                      team1Innings1: { ...test.team1Innings1, runs: Number(e.target.value) || 0 }
                                    })}
                                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block">2nd Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team1Innings2?.runs ?? 0}
                                    onChange={(e) => handleUpdateCricketTest(test.id, {
                                      team1Innings2: { runs: Number(e.target.value) || 0, wickets: test.team1Innings2?.wickets ?? 0 }
                                    })}
                                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 p-2.5 bg-[#141824] rounded-lg border border-sky-500/20">
                              <span className="text-sky-400 font-semibold block">{team2.name}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block">1st Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team2Innings1.runs}
                                    onChange={(e) => handleUpdateCricketTest(test.id, {
                                      team2Innings1: { ...test.team2Innings1, runs: Number(e.target.value) || 0 }
                                    })}
                                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block">2nd Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team2Innings2?.runs ?? 0}
                                    onChange={(e) => handleUpdateCricketTest(test.id, {
                                      team2Innings2: { runs: Number(e.target.value) || 0, wickets: test.team2Innings2?.wickets ?? 0 }
                                    })}
                                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={test.resultSummary || ''}
                              onChange={(e) => handleUpdateCricketTest(test.id, { resultSummary: e.target.value })}
                              placeholder="Result Summary (e.g. Team 1 won by 42 runs)"
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            />
                            <input
                              type="url"
                              value={test.scorecardImageUrl || ''}
                              onChange={(e) => handleUpdateCricketTest(test.id, { scorecardImageUrl: e.target.value.trim() })}
                              placeholder="Scorecard Photo URL (redirects to image)"
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={test.status}
                              onChange={(e) => handleUpdateCricketTest(test.id, { status: e.target.value as any })}
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="live">Live</option>
                              <option value="completed">Completed</option>
                            </select>
                            <select
                              value={test.winnerTeamId || ''}
                              onChange={(e) => handleUpdateCricketTest(test.id, {
                                winnerTeamId: (e.target.value as any) || null,
                                status: e.target.value ? 'completed' : test.status,
                              })}
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            >
                              <option value="">Victor: In Progress</option>
                              <option value="team1">{team1.name} Win</option>
                              <option value="team2">{team2.name} Win</option>
                              <option value="draw">Draw</option>
                            </select>
                          </div>

                          {/* Choose Test MVP */}
                          <div className="pt-2 border-t border-white/[0.06]">
                            <label className="text-[10px] text-amber-300 font-semibold block mb-1 flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-400" />
                              <span>Award Test Match MVP (+3 pts to MVP board)</span>
                            </label>
                            <select
                              value={test.mvpPlayerId || ''}
                              onChange={(e) => {
                                const pId = e.target.value;
                                const p = players.find((pl) => pl.id === pId);
                                handleUpdateCricketTest(test.id, {
                                  mvpPlayerId: pId || undefined,
                                  mvp: p ? p.name : undefined,
                                });
                              }}
                              className="w-full bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            >
                              <option value="">No MVP Assigned</option>
                              {players.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.teamId === 'team1' ? team1.name : team2.name})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🏎️ SMASH KARTS: 7-GAME SERIES (FIRST TO 4 WINS)          */}
          {/* ======================================================== */}
          {smashSeries && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">7-Game Series</h4>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Game</span>
                  </button>
                )}
              </div>

              {/* Add Smash Game Form */}
              {showAddModal && isAdmin && (
                <form
                  onSubmit={handleAddSmashGame}
                  className="p-4 bg-[#1a202f] border border-white/10 rounded-xl space-y-3 text-xs"
                >
                  <span className="font-semibold text-white block">Add Game to Smash Karts Series</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Type</label>
                      <select
                        value={newSmashType}
                        onChange={(e) => setNewSmashType(e.target.value as any)}
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                      >
                        <option value="TDM">TDM</option>
                        <option value="CTF">CTF</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Arena (Optional)</label>
                      <input
                        type="text"
                        value={newSmashArena}
                        onChange={(e) => setNewSmashArena(e.target.value)}
                        placeholder="e.g. Neon Speedway"
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{team1.name} Score</label>
                      <input
                        type="number"
                        value={newSmashT1Score}
                        onChange={(e) => setNewSmashT1Score(Number(e.target.value) || 0)}
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{team2.name} Score</label>
                      <input
                        type="number"
                        value={newSmashT2Score}
                        onChange={(e) => setNewSmashT2Score(Number(e.target.value) || 0)}
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3 py-1 bg-white/10 text-white rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-white text-black font-semibold rounded hover:bg-slate-200 cursor-pointer"
                    >
                      Save Game
                    </button>
                  </div>
                </form>
              )}

              {/* Games List */}
              <div className="space-y-2.5">
                {smashSeries.games.map((g) => (
                  <div
                    key={g.id}
                    className="p-3.5 bg-[#141824] border border-white/[0.04] rounded-xl flex flex-col gap-2 text-xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-white/10 font-semibold text-white flex items-center justify-center text-[11px]">
                          {g.gameNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${g.type === 'TDM' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'}`}>
                              {g.type}
                            </span>
                            <span className="text-slate-300">{g.arena || 'Custom Lobby'}</span>
                            {g.mvpPlayerId && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>MVP: {players.find((p) => p.id === g.mvpPlayerId)?.name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Game Score */}
                      <div className="flex items-center gap-4">
                        <div className="font-semibold text-sm">
                          <span className="text-red-400">{g.team1Score}</span>
                          <span className="text-slate-500 mx-1.5">-</span>
                          <span className="text-sky-400">{g.team2Score}</span>
                        </div>

                        {g.winnerTeamId && (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            {g.winnerTeamId === 'team1' ? team1.name : team2.name} Win
                          </span>
                        )}

                        {g.scorecardImageUrl && (
                          <button
                            type="button"
                            onClick={(e) => handleScorecardClick(g.scorecardImageUrl!, e)}
                            className="text-white hover:text-slate-300 underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {isAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingItemId(editingItemId === g.id ? null : g.id)}
                              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                              title="Edit Score"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSmashGame(g.id)}
                              className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer"
                              title="Delete Game"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin quick edit for this game */}
                    {editingItemId === g.id && isAdmin && (
                      <div className="w-full mt-2 pt-2 border-t border-white/10 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block">Type</label>
                            <select
                              value={g.type}
                              onChange={(e) => handleUpdateSmashGame(g.id, { type: e.target.value as any })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            >
                              <option value="TDM">TDM</option>
                              <option value="CTF">CTF</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">Status</label>
                            <select
                              value={g.status || 'upcoming'}
                              onChange={(e) => handleUpdateSmashGame(g.id, {
                                status: e.target.value as MatchStatus,
                                ...(e.target.value === 'upcoming' ? { winnerTeamId: null } : {})
                              })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="live">Live</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">{team1.name}</label>
                            <input
                              type="number"
                              value={g.team1Score}
                              onChange={(e) => handleUpdateSmashGame(g.id, {
                                team1Score: Number(e.target.value) || 0,
                                winnerTeamId: Number(e.target.value) > g.team2Score ? 'team1' : g.team2Score > Number(e.target.value) ? 'team2' : null,
                              })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">{team2.name}</label>
                            <input
                              type="number"
                              value={g.team2Score}
                              onChange={(e) => handleUpdateSmashGame(g.id, {
                                team2Score: Number(e.target.value) || 0,
                                winnerTeamId: g.team1Score > Number(e.target.value) ? 'team1' : Number(e.target.value) > g.team1Score ? 'team2' : null,
                              })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] text-slate-400 block">Scorecard URL</label>
                            <input
                              type="url"
                              value={g.scorecardImageUrl || ''}
                              onChange={(e) => handleUpdateSmashGame(g.id, { scorecardImageUrl: e.target.value.trim() })}
                              placeholder="https://..."
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-amber-300 font-semibold block mb-0.5 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>Award Smash Karts Game MVP ({g.type === 'TDM' ? '+2 pts TDM' : '+2 pts CTF'})</span>
                          </label>
                          <select
                            value={g.mvpPlayerId || ''}
                            onChange={(e) => handleUpdateSmashGame(g.id, { mvpPlayerId: e.target.value || undefined })}
                            className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                          >
                            <option value="">No MVP Assigned</option>
                            {players.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.teamId === 'team1' ? team1.name : team2.name})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🏸 BADMINTON: 3-GAME SERIES (11-11-21 SETS)              */}
          {/* ======================================================== */}
          {badmintonSeries && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">3-Game Series (First to 2)</h4>
                </div>
              </div>

              <div className="space-y-3">
                {badmintonSeries.games.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 bg-[#141824] border border-white/[0.06] rounded-xl space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <span className="font-semibold text-white">
                        Game {g.gameNumber}: {g.matchType}
                      </span>
                      <div className="flex items-center gap-2">
                        {g.winnerTeamId && (
                          <span className="text-emerald-400 font-medium">
                            {g.winnerTeamId === 'team1' ? team1.name : team2.name} Win
                          </span>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setEditingItemId(editingItemId === g.id ? null : g.id)}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sets display: Set 1 (11), Set 2 (11), Set 3 (21) */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-[#0e1216] rounded-lg">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Set 1 (11 pts)</span>
                        <span className="font-medium text-white">
                          <span className="text-red-400">{g.set1.team1}</span> - <span className="text-sky-400">{g.set1.team2}</span>
                        </span>
                      </div>
                      <div className="p-2 bg-[#0e1216] rounded-lg">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Set 2 (11 pts)</span>
                        <span className="font-medium text-white">
                          <span className="text-red-400">{g.set2.team1}</span> - <span className="text-sky-400">{g.set2.team2}</span>
                        </span>
                      </div>
                      <div className="p-2 bg-[#0e1216] rounded-lg">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Set 3 (21 pts)</span>
                        <span className="font-medium text-white">
                          <span className="text-red-400">{g.set3.team1}</span> - <span className="text-sky-400">{g.set3.team2}</span>
                        </span>
                      </div>
                    </div>

                    {/* Admin set editor */}
                    {editingItemId === g.id && isAdmin && (
                      <div className="p-3 bg-[#0a0c10] border border-white/10 rounded-lg space-y-2 mt-2">
                        <span className="font-semibold text-white block text-[11px]">Edit Set Scores & Winner</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block">Set 1 (T1 - T2)</label>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={g.set1.team1}
                                onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                  set1: { team1: Number(e.target.value) || 0, team2: g.set1.team2 }
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                              <input
                                type="number"
                                value={g.set1.team2}
                                onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                  set1: { team1: g.set1.team1, team2: Number(e.target.value) || 0 }
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block">Set 2 (T1 - T2)</label>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={g.set2.team1}
                                onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                  set2: { team1: Number(e.target.value) || 0, team2: g.set2.team2 }
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                              <input
                                type="number"
                                value={g.set2.team2}
                                onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                  set2: { team1: g.set2.team1, team2: Number(e.target.value) || 0 }
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block">Set 3 (T1 - T2)</label>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={g.set3.team1}
                                onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                  set3: { team1: Number(e.target.value) || 0, team2: g.set3.team2 }
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                              <input
                                type="number"
                                value={g.set3.team2}
                                onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                  set3: { team1: g.set3.team1, team2: Number(e.target.value) || 0 }
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <select
                            value={g.status || 'upcoming'}
                            onChange={(e) => handleUpdateBadmintonGame(g.id, {
                              status: e.target.value as MatchStatus,
                              ...(e.target.value === 'upcoming' ? { winnerTeamId: null } : {})
                            })}
                            className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                          </select>
                          <select
                            value={g.winnerTeamId || ''}
                            onChange={(e) => handleUpdateBadmintonGame(g.id, {
                              winnerTeamId: (e.target.value as any) || null,
                              status: e.target.value ? 'completed' : g.status,
                            })}
                            className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                          >
                            <option value="">Winner: In Progress</option>
                            <option value="team1">{team1.name} Win</option>
                            <option value="team2">{team2.name} Win</option>
                          </select>
                          <input
                            type="url"
                            value={g.scorecardImageUrl || ''}
                            onChange={(e) => handleUpdateBadmintonGame(g.id, { scorecardImageUrl: e.target.value.trim() })}
                            placeholder="Scorecard Photo Link"
                            className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🏐 FOOTVOLLEY: 3-GAME SERIES (25 POINTS EACH)             */}
          {/* ======================================================== */}
          {footvolleySeries && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">3-Game Series (First to 2)</h4>
                </div>
              </div>

              <div className="space-y-3">
                {footvolleySeries.games.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 bg-[#141824] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">Game {g.gameNumber} (25 PTS)</span>
                      <span className="text-[11px] text-slate-400">
                        {g.winnerTeamId ? `Winner: ${g.winnerTeamId === 'team1' ? team1.name : team2.name}` : 'Target 25'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-base font-semibold">
                        <span className="text-red-400">{g.team1Score}</span>
                        <span className="text-slate-500 mx-1.5">-</span>
                        <span className="text-sky-400">{g.team2Score}</span>
                      </div>

                      {g.scorecardImageUrl && (
                        <button
                          type="button"
                          onClick={(e) => handleScorecardClick(g.scorecardImageUrl!, e)}
                          className="text-white hover:text-slate-300 underline cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setEditingItemId(editingItemId === g.id ? null : g.id)}
                          className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Admin quick edit for footvolley */}
                    {editingItemId === g.id && isAdmin && (
                      <div className="w-full mt-2 pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Status</label>
                          <select
                            value={g.status || 'upcoming'}
                            onChange={(e) => handleUpdateFootvolleyGame(g.id, {
                              status: e.target.value as MatchStatus,
                              ...(e.target.value === 'upcoming' ? { winnerTeamId: null } : {})
                            })}
                            className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">{team1.name}</label>
                          <input
                            type="number"
                            value={g.team1Score}
                            onChange={(e) => handleUpdateFootvolleyGame(g.id, {
                              team1Score: Number(e.target.value) || 0,
                              winnerTeamId: Number(e.target.value) >= 25 ? 'team1' : g.team2Score >= 25 ? 'team2' : null,
                            })}
                            className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">{team2.name}</label>
                          <input
                            type="number"
                            value={g.team2Score}
                            onChange={(e) => handleUpdateFootvolleyGame(g.id, {
                              team2Score: Number(e.target.value) || 0,
                              winnerTeamId: g.team1Score >= 25 ? 'team1' : Number(e.target.value) >= 25 ? 'team2' : null,
                            })}
                            className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Scorecard URL</label>
                          <input
                            type="url"
                            value={g.scorecardImageUrl || ''}
                            onChange={(e) => handleUpdateFootvolleyGame(g.id, { scorecardImageUrl: e.target.value.trim() })}
                            placeholder="https://..."
                            className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🏀 BASKETBALL: FIRST TO 30 WINS                          */}
          {/* ======================================================== */}
          {bballRace && (
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block text-center">
                First team to 30 points wins
              </span>

              {/* Admin Point Controls */}
              {isAdmin && (
                <div className="p-4 bg-[#141824] border border-white/10 rounded-xl space-y-3 text-xs">
                  <span className="font-semibold text-white block uppercase tracking-wider">
                    Quick Score Tally
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#0e1216] rounded-lg border border-red-500/20 space-y-2">
                      <span className="text-red-400 font-semibold block">{team1.name}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team1', 1)}
                          className="flex-1 py-1 bg-red-600 text-white font-semibold rounded cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team1', 2)}
                          className="flex-1 py-1 bg-red-600 text-white font-semibold rounded cursor-pointer"
                        >
                          +2
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team1', 3)}
                          className="flex-1 py-1 bg-red-600 text-white font-semibold rounded cursor-pointer"
                        >
                          +3
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team1', -1)}
                          className="px-2 py-1 bg-white/10 text-white rounded cursor-pointer"
                        >
                          -1
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0e1216] rounded-lg border border-sky-500/20 space-y-2">
                      <span className="text-sky-400 font-semibold block">{team2.name}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team2', 1)}
                          className="flex-1 py-1 bg-sky-600 text-white font-semibold rounded cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team2', 2)}
                          className="flex-1 py-1 bg-sky-600 text-white font-semibold rounded cursor-pointer"
                        >
                          +2
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team2', 3)}
                          className="flex-1 py-1 bg-sky-600 text-white font-semibold rounded cursor-pointer"
                        >
                          +3
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBasketballPoints('team2', -1)}
                          className="px-2 py-1 bg-white/10 text-white rounded cursor-pointer"
                        >
                          -1
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 🏓 TABLE TENNIS: 3-GAME SERIES (21-PT SETS)               */}
          {/* ======================================================== */}
          {tableTennisSeries && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">3-Game Series (First to 2)</h4>
                  <span className="text-[11px] text-slate-400">All sets 21 points · 1st Singles, Doubles, 2nd Singles</span>
                </div>
              </div>

              <div className="space-y-3">
                {tableTennisSeries.games.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 bg-[#141824] border border-white/[0.06] rounded-xl space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <span className="font-semibold text-white">
                        Game {g.gameNumber}: {g.matchType}
                      </span>
                      <div className="flex items-center gap-2">
                        {g.winnerTeamId && (
                          <span className="text-emerald-400 font-medium">
                            {g.winnerTeamId === 'team1' ? team1.name : team2.name} Win
                          </span>
                        )}
                        {g.scorecardImageUrl && (
                          <button
                            type="button"
                            onClick={(e) => handleScorecardClick(g.scorecardImageUrl!, e)}
                            className="text-white hover:text-slate-300 underline cursor-pointer"
                            title="View Scorecard"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setEditingItemId(editingItemId === g.id ? null : g.id)}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sets display: Set 1 (21), Set 2 (21), Set 3 (21) */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-[#0e1216] rounded-lg">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Set 1 (21 pts)</span>
                        <span className="font-medium text-white">
                          <span className="text-red-400">{g.set1.team1}</span> - <span className="text-sky-400">{g.set1.team2}</span>
                        </span>
                      </div>
                      <div className="p-2 bg-[#0e1216] rounded-lg">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Set 2 (21 pts)</span>
                        <span className="font-medium text-white">
                          <span className="text-red-400">{g.set2.team1}</span> - <span className="text-sky-400">{g.set2.team2}</span>
                        </span>
                      </div>
                      <div className="p-2 bg-[#0e1216] rounded-lg">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Set 3 (21 pts)</span>
                        <span className="font-medium text-white">
                          <span className="text-red-400">{g.set3.team1}</span> - <span className="text-sky-400">{g.set3.team2}</span>
                        </span>
                      </div>
                    </div>

                    {/* Admin set editor */}
                    {editingItemId === g.id && isAdmin && (
                      <div className="p-3 bg-[#0a0c10] border border-white/10 rounded-lg space-y-2 mt-2">
                        <span className="font-semibold text-white block text-[11px]">Edit Set Scores & Winner (21 PTS)</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Set 1 (21)</span>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={g.set1.team1}
                                onChange={(e) => handleUpdateTableTennisGame(g.id, {
                                  set1: { ...g.set1, team1: Number(e.target.value) || 0 },
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                              <input
                                type="number"
                                value={g.set1.team2}
                                onChange={(e) => handleUpdateTableTennisGame(g.id, {
                                  set1: { ...g.set1, team2: Number(e.target.value) || 0 },
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Set 2 (21)</span>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={g.set2.team1}
                                onChange={(e) => handleUpdateTableTennisGame(g.id, {
                                  set2: { ...g.set2, team1: Number(e.target.value) || 0 },
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                              <input
                                type="number"
                                value={g.set2.team2}
                                onChange={(e) => handleUpdateTableTennisGame(g.id, {
                                  set2: { ...g.set2, team2: Number(e.target.value) || 0 },
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1">Set 3 (21)</span>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={g.set3.team1}
                                onChange={(e) => handleUpdateTableTennisGame(g.id, {
                                  set3: { ...g.set3, team1: Number(e.target.value) || 0 },
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                              <input
                                type="number"
                                value={g.set3.team2}
                                onChange={(e) => handleUpdateTableTennisGame(g.id, {
                                  set3: { ...g.set3, team2: Number(e.target.value) || 0 },
                                })}
                                className="w-1/2 bg-[#141824] border border-white/10 rounded px-1.5 py-1 text-white text-center"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <select
                            value={g.status || 'upcoming'}
                            onChange={(e) => handleUpdateTableTennisGame(g.id, {
                              status: e.target.value as MatchStatus,
                              ...(e.target.value === 'upcoming' ? { winnerTeamId: null } : {})
                            })}
                            className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                          </select>
                          <select
                            value={g.winnerTeamId || ''}
                            onChange={(e) => handleUpdateTableTennisGame(g.id, {
                              winnerTeamId: (e.target.value as any) || null,
                              status: e.target.value ? 'completed' : g.status,
                            })}
                            className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                          >
                            <option value="">Winner: Auto / In Progress</option>
                            <option value="team1">{team1.name} Win</option>
                            <option value="team2">{team2.name} Win</option>
                          </select>
                          <input
                            type="url"
                            value={g.scorecardImageUrl || ''}
                            onChange={(e) => handleUpdateTableTennisGame(g.id, { scorecardImageUrl: e.target.value.trim() })}
                            placeholder="Scorecard Photo Link"
                            className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🎮 STUMBLE GUYS: 5-GAME SERIES (FIRST TO 3 WINS)          */}
          {/* ======================================================== */}
          {stumbleGuysSeries && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">5-Game Series (First to 3 Wins)</h4>
                  <span className="text-[11px] text-slate-400">Team with 3 round victories takes the series</span>
                </div>
              </div>

              <div className="space-y-3">
                {stumbleGuysSeries.games.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 bg-[#141824] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white block">
                          Game {g.gameNumber}: {g.mapName}
                        </span>
                        {g.mvpPlayerId && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>MVP: {players.find((p) => p.id === g.mvpPlayerId)?.name}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {g.winnerTeamId ? `Winner: ${g.winnerTeamId === 'team1' ? team1.name : team2.name}` : 'First to 3 series'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-base font-semibold">
                        <span className="text-red-400">{g.team1Score}</span>
                        <span className="text-slate-500 mx-1.5">-</span>
                        <span className="text-sky-400">{g.team2Score}</span>
                      </div>

                      {g.scorecardImageUrl && (
                        <button
                          type="button"
                          onClick={(e) => handleScorecardClick(g.scorecardImageUrl!, e)}
                          className="text-white hover:text-slate-300 underline cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItemId(editingItemId === g.id ? null : g.id)}
                            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                            title="Edit Score"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStumbleGuysGame(g.id)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer"
                            title="Delete Game"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Admin quick edit for stumble guys */}
                    {editingItemId === g.id && isAdmin && (
                      <div className="w-full mt-2 pt-2 border-t border-white/10 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block">Map Name</label>
                            <input
                              type="text"
                              value={g.mapName}
                              onChange={(e) => handleUpdateStumbleGuysGame(g.id, { mapName: e.target.value })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">Status</label>
                            <select
                              value={g.status || 'upcoming'}
                              onChange={(e) => handleUpdateStumbleGuysGame(g.id, {
                                status: e.target.value as MatchStatus,
                                ...(e.target.value === 'upcoming' ? { winnerTeamId: null } : {})
                              })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="live">Live</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">{team1.name} Score</label>
                            <input
                              type="number"
                              value={g.team1Score}
                              onChange={(e) => handleUpdateStumbleGuysGame(g.id, {
                                team1Score: Number(e.target.value) || 0,
                                winnerTeamId: Number(e.target.value) > g.team2Score ? 'team1' : g.team2Score > Number(e.target.value) ? 'team2' : null,
                              })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">{team2.name} Score</label>
                            <input
                              type="number"
                              value={g.team2Score}
                              onChange={(e) => handleUpdateStumbleGuysGame(g.id, {
                                team2Score: Number(e.target.value) || 0,
                                winnerTeamId: g.team1Score > Number(e.target.value) ? 'team1' : Number(e.target.value) > g.team1Score ? 'team2' : null,
                              })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] text-slate-400 block">Winner</label>
                            <select
                              value={g.winnerTeamId || ''}
                              onChange={(e) => handleUpdateStumbleGuysGame(g.id, {
                                winnerTeamId: (e.target.value as any) || null,
                                status: e.target.value ? 'completed' : g.status,
                              })}
                              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                            >
                              <option value="">Auto / In Progress</option>
                              <option value="team1">{team1.name}</option>
                              <option value="team2">{team2.name}</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-amber-300 font-semibold block mb-0.5 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span>Award Stumble Guys Game MVP (+1 pt default)</span>
                          </label>
                          <select
                            value={g.mvpPlayerId || ''}
                            onChange={(e) => handleUpdateStumbleGuysGame(g.id, { mvpPlayerId: e.target.value || undefined })}
                            className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                          >
                            <option value="">No MVP Assigned</option>
                            {players.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.teamId === 'team1' ? team1.name : team2.name})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* GENERAL SCORE DISPLAY (Fallback for other sports)        */}
          {/* ======================================================== */}
          {!cricketSeries && !bballRace && !smashSeries && !badmintonSeries && !footvolleySeries && !tableTennisSeries && !stumbleGuysSeries && (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-[#141824] border border-white/[0.04] rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">{team1.name}</span>
                <span className="text-3xl font-light text-red-400">
                  {match.team1ScoreDisplay || '—'}
                </span>
              </div>
              <div className="p-4 bg-[#141824] border border-white/[0.04] rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">{team2.name}</span>
                <span className="text-3xl font-light text-sky-400">
                  {match.team2ScoreDisplay || '—'}
                </span>
              </div>
            </div>
          )}

          {/* Admin Generic Score Form */}
          {isAdmin && !cricketSeries && !bballRace && !smashSeries && !badmintonSeries && !footvolleySeries && !tableTennisSeries && !stumbleGuysSeries && (
            <form
              onSubmit={handleSaveGenericScore}
              className="p-4 bg-[#141824] border border-white/[0.06] rounded-xl space-y-3 text-xs"
            >
              <span className="font-semibold text-white block uppercase tracking-wider">
                Admin Score Controller
              </span>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={t1ScoreInput}
                  onChange={(e) => setT1ScoreInput(e.target.value)}
                  placeholder={`${team1.name} Score`}
                  className="bg-[#0c0e15] border border-white/10 rounded px-3 py-2 text-white"
                />
                <input
                  type="text"
                  value={t2ScoreInput}
                  onChange={(e) => setT2ScoreInput(e.target.value)}
                  placeholder={`${team2.name} Score`}
                  className="bg-[#0c0e15] border border-white/10 rounded px-3 py-2 text-white"
                />
              </div>

              {/* Match MVP Display */}
              {Boolean(match.mvpPlayerName || match.mvpPlayerId) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-amber-400">Match MVP:</span>
                  <span className="text-white font-medium">
                    {match.mvpPlayerName || players.find((p) => p.id === match.mvpPlayerId)?.name}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={matchStatusInput}
                  onChange={(e) => setMatchStatusInput(e.target.value as any)}
                  className="bg-[#0c0e15] border border-white/10 rounded px-3 py-2 text-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={winnerTeamInput}
                  onChange={(e) => setWinnerTeamInput(e.target.value as any)}
                  className="bg-[#0c0e15] border border-white/10 rounded px-3 py-2 text-white"
                >
                  <option value="">No Winner Yet</option>
                  <option value="team1">{team1.name} (Winner)</option>
                  <option value="team2">{team2.name} (Winner)</option>
                </select>
              </div>

              {/* Award Match MVP */}
              <div>
                <label className="text-[10px] text-amber-300 font-semibold block mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>Award Match MVP (Adds to MVP Leaderboard)</span>
                </label>
                <select
                  value={match.mvpPlayerId || ''}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const p = players.find((pl) => pl.id === pId);
                    onUpdateMatch({
                      ...match,
                      mvpPlayerId: pId || undefined,
                      mvpPlayerName: p ? p.name : undefined,
                    });
                  }}
                  className="w-full bg-[#0c0e15] border border-white/10 rounded px-3 py-2 text-white"
                >
                  <option value="">No MVP Assigned</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.teamId === 'team1' ? team1.name : team2.name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-white text-black font-semibold rounded-lg transition-colors hover:bg-slate-200 cursor-pointer"
              >
                Apply Score & Winner
              </button>
            </form>
          )}

          {!isAdmin && (
            <div className="p-3 bg-[#141824] border border-white/[0.04] rounded-xl flex items-center justify-between text-xs text-slate-400">
              <span>Score editing restricted to tournament directors.</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="text-white hover:underline text-[11px] cursor-pointer"
              >
                Admin Login
              </button>
            </div>
          )}

          {/* Live Updates Log */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider block">
              Match Updates
            </span>

            {isAdmin && (
              <form onSubmit={handleAddCommentary} className="flex gap-2">
                <input
                  type="text"
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                  placeholder="Post live update..."
                  className="flex-1 bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Log</span>
                </button>
              </form>
            )}

            <div className="space-y-2 pt-1">
              {match.updates.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-3 bg-[#141824] rounded-lg">
                  No live updates logged yet.
                </div>
              ) : (
                match.updates.map((up) => (
                  <div
                    key={up.id}
                    className="p-3 bg-[#141824] border border-white/[0.04] rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <div className="flex items-center gap-2">
                        <span>{up.timestamp}</span>
                        {up.phase && (
                          <span className="bg-white/5 px-1.5 py-0.5 rounded">{up.phase}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCommentary(up.id, e)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Delete live update"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-200 leading-relaxed">{up.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDialog?.isOpen)}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        confirmLabel={confirmDialog?.confirmLabel || 'Delete'}
        variant="danger"
        onConfirm={() => {
          if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog(null);
        }}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
};
