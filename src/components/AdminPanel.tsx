import React, { useState } from 'react';
import {
  TournamentState,
  Match,
  MatchUpdate,
  Player,
  MatchStatus,
  CricketTestMatch,
  DetailedCricketSeries,
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
  MvpPointConfig,
} from '../types/tournament';
import { formatMatchScoreDisplay } from '../utils/cricketFormat';
import { recalculateMatchOutcome } from '../utils/seriesCalculations';
import { DEFAULT_MVP_CONFIG } from '../utils/mvpCalculations';
import { sortMatchesBySchedule, formatFriendlyDate } from '../utils/dateCalculations';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Shield,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  Award,
  Crown,
  Sparkles,
  Clock,
  Sliders,
  Check,
} from 'lucide-react';

interface AdminPanelProps {
  state: TournamentState;
  onUpdateState: (newState: TournamentState) => void;
  onResetToDefault: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  state,
  onUpdateState,
  onResetToDefault,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(state.matches[0]?.id || '');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState<'team1' | 'team2'>('team1');
  const [newPlayerRole, setNewPlayerRole] = useState('Player');
  const [newPlayerBio, setNewPlayerBio] = useState('');
  const [newPlayerGame, setNewPlayerGame] = useState('');
  const [flashMsg, setFlashMsg] = useState('');

  // Confirmation modal state (replaces blocked window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Add Match Modal state
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [newMatchName, setNewMatchName] = useState('');
  const [newMatchEmoji, setNewMatchEmoji] = useState('🎮');
  const [newMatchTier, setNewMatchTier] = useState<'platinum' | 'gold' | 'silver'>('gold');
  const [newMatchDate, setNewMatchDate] = useState('');
  const [newMatchTime, setNewMatchTime] = useState('');

  // Cricket admin state
  const [editingCricketTestId, setEditingCricketTestId] = useState<string | null>(null);
  const [showAddCricketModal, setShowAddCricketModal] = useState(false);
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestVenue, setNewTestVenue] = useState('');
  const [newTestDate, setNewTestDate] = useState('');

  // Smash Karts admin state
  const [showAddSmashModal, setShowAddSmashModal] = useState(false);
  const [newSmashType, setNewSmashType] = useState<'TDM' | 'CTF'>('TDM');
  const [newSmashArena, setNewSmashArena] = useState('');
  const [newSmashT1, setNewSmashT1] = useState(0);
  const [newSmashT2, setNewSmashT2] = useState(0);
  const [editingSmashId, setEditingSmashId] = useState<string | null>(null);

  // Badminton admin state
  const [editingBadmintonId, setEditingBadmintonId] = useState<string | null>(null);

  // Footvolley admin state
  const [editingFootvolleyId, setEditingFootvolleyId] = useState<string | null>(null);

  // Table Tennis admin state
  const [editingTTId, setEditingTTId] = useState<string | null>(null);

  // Stumble Guys admin state
  const [editingSGId, setEditingSGId] = useState<string | null>(null);

  // Live updates admin state
  const [newUpdateInput, setNewUpdateInput] = useState('');

  const showFlash = (msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(''), 2500);
  };

  const currentMatch =
    state.matches.find((m) => m.id === selectedMatchId) || state.matches[0] || null;

  const handleUpdateMatch = (partial: Partial<Match>) => {
    if (!currentMatch) return;
    const merged = { ...currentMatch, ...partial };
    const recalculated = recalculateMatchOutcome(merged);
    const updatedMatches = state.matches.map((m) =>
      m.id === currentMatch.id ? recalculated : m
    );
    onUpdateState({ ...state, matches: updatedMatches });
    showFlash('Updated.');
  };

  const mvpConfig = state.mvpConfig || DEFAULT_MVP_CONFIG;

  const handleUpdateMvpConfig = (partial: Partial<MvpPointConfig>) => {
    const updated = { ...mvpConfig, ...partial };
    onUpdateState({
      ...state,
      mvpConfig: updated,
    });
    showFlash('MVP points rules updated.');
  };

  const handleUpdateMatchDate = (matchId: string, newDate: string, newDisplayLabel?: string) => {
    const match = state.matches.find((m) => m.id === matchId);
    if (!match) return;

    const displayTime =
      newDisplayLabel !== undefined && newDisplayLabel.trim() !== ''
        ? newDisplayLabel.trim()
        : formatFriendlyDate(newDate) || match.scheduledTime;

    const updatedMatch: Match = {
      ...match,
      scheduledDate: newDate,
      scheduledTime: displayTime,
    };

    const updatedMatches = state.matches.map((m) => (m.id === matchId ? updatedMatch : m));
    onUpdateState({
      ...state,
      matches: updatedMatches,
    });
    showFlash(`Schedule updated for ${match.gameName}. Timeline auto-reordered!`);
  };

  const handleAssignMvp = (
    matchId: string,
    subGameId: string | null,
    playerId: string | null
  ) => {
    const match = state.matches.find((m) => m.id === matchId);
    if (!match) return;

    const player = playerId ? state.players.find((p) => p.id === playerId) : null;

    if (match.gameKey === 'cricket' && match.detailedScore?.type === 'cricket_series') {
      const series = match.detailedScore.data;
      const updatedTests = series.tests.map((t) =>
        t.id === subGameId
          ? { ...t, mvpPlayerId: playerId || undefined, mvp: player ? player.name : undefined }
          : t
      );
      const updatedMatch: Match = {
        ...match,
        detailedScore: { ...match.detailedScore, data: { ...series, tests: updatedTests } },
      };
      const updatedMatches = state.matches.map((m) => (m.id === match.id ? updatedMatch : m));
      onUpdateState({ ...state, matches: updatedMatches });
    } else if (match.gameKey === 'smash_karts' && match.detailedScore?.type === 'smash_karts_series') {
      const series = match.detailedScore.data;
      const updatedGames = series.games.map((g) =>
        g.id === subGameId ? { ...g, mvpPlayerId: playerId || undefined } : g
      );
      const updatedMatch: Match = {
        ...match,
        detailedScore: { ...match.detailedScore, data: { ...series, games: updatedGames } },
      };
      const updatedMatches = state.matches.map((m) => (m.id === match.id ? updatedMatch : m));
      onUpdateState({ ...state, matches: updatedMatches });
    } else if (match.gameKey === 'stumble_guys' && match.detailedScore?.type === 'stumble_guys_series') {
      const series = match.detailedScore.data;
      const updatedGames = series.games.map((g) =>
        g.id === subGameId ? { ...g, mvpPlayerId: playerId || undefined } : g
      );
      const updatedMatch: Match = {
        ...match,
        detailedScore: { ...match.detailedScore, data: { ...series, games: updatedGames } },
      };
      const updatedMatches = state.matches.map((m) => (m.id === match.id ? updatedMatch : m));
      onUpdateState({ ...state, matches: updatedMatches });
    } else if (match.gameKey === 'basketball') {
      const updatedMatch: Match = {
        ...match,
        mvpPlayerId: playerId || undefined,
        mvpPlayerName: player ? player.name : undefined,
      };
      const updatedMatches = state.matches.map((m) => (m.id === match.id ? updatedMatch : m));
      onUpdateState({ ...state, matches: updatedMatches });
    } else if (match.gameKey === 'badminton' && match.detailedScore?.type === 'badminton_series') {
      const series = match.detailedScore.data;
      const updatedGames = series.games.map((g) =>
        g.id === subGameId ? { ...g, mvpPlayerId: playerId || undefined } : g
      );
      const updatedMatch: Match = {
        ...match,
        detailedScore: { ...match.detailedScore, data: { ...series, games: updatedGames } },
      };
      const updatedMatches = state.matches.map((m) => (m.id === match.id ? updatedMatch : m));
      onUpdateState({ ...state, matches: updatedMatches });
    } else if (match.gameKey === 'table_tennis' && match.detailedScore?.type === 'table_tennis_series') {
      const series = match.detailedScore.data;
      const updatedGames = series.games.map((g) =>
        g.id === subGameId ? { ...g, mvpPlayerId: playerId || undefined } : g
      );
      const updatedMatch: Match = {
        ...match,
        detailedScore: { ...match.detailedScore, data: { ...series, games: updatedGames } },
      };
      const updatedMatches = state.matches.map((m) => (m.id === match.id ? updatedMatch : m));
      onUpdateState({ ...state, matches: updatedMatches });
    } else if (match.gameKey === 'footvolley' && match.detailedScore?.type === 'footvolley_series') {
      const series = match.detailedScore.data;
      const updatedGames = series.games.map((g) =>
        g.id === subGameId ? { ...g, mvpPlayerId: playerId || undefined } : g
      );
      const updatedMatch: Match = {
        ...match,
        detailedScore: { ...match.detailedScore, data: { ...series, games: updatedGames } },
      };
      const updatedMatches = state.matches.map((m) => (m.id === match.id ? updatedMatch : m));
      onUpdateState({ ...state, matches: updatedMatches });
    }

    showFlash(player ? `MVP awarded to ${player.name}!` : 'MVP selection cleared.');
  };

  const handleAddMatchUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || !newUpdateInput.trim()) return;
    const newUp: MatchUpdate = {
      id: 'up_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'general',
      text: newUpdateInput.trim(),
    };
    handleUpdateMatch({
      updates: [newUp, ...currentMatch.updates],
    });
    setNewUpdateInput('');
    showFlash('Live update posted.');
  };

  const handleDeleteMatchUpdate = (updateId: string) => {
    if (!currentMatch) return;
    handleUpdateMatch({
      updates: currentMatch.updates.filter((u) => u.id !== updateId),
    });
    showFlash('Live update deleted.');
  };

  const handleSetWinner = (winnerId: 'team1' | 'team2' | null) => {
    if (!currentMatch) return;
    let t1Pts = currentMatch.team1PointsAwarded;
    let t2Pts = currentMatch.team2PointsAwarded;

    if (winnerId === 'team1') {
      t1Pts = currentMatch.basePoints;
      t2Pts = currentMatch.consolationPoints;
    } else if (winnerId === 'team2') {
      t1Pts = currentMatch.consolationPoints;
      t2Pts = currentMatch.basePoints;
    } else {
      t1Pts = undefined;
      t2Pts = undefined;
    }

    handleUpdateMatch({
      winnerTeamId: winnerId,
      team1PointsAwarded: t1Pts,
      team2PointsAwarded: t2Pts,
      status: winnerId ? 'completed' : currentMatch.status,
    });
  };

  // -------------------------------------------------------------
  // CRICKET ADMIN (Add, Delete, Edit)
  // -------------------------------------------------------------
  const handleUpdateCricketTest = (testId: string, partial: Partial<CricketTestMatch>) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'cricket_series') return;
    const cricketSeries = currentMatch.detailedScore.data;

    let t1Wins = 0;
    let t2Wins = 0;
    let draws = 0;

    const updatedTests = cricketSeries.tests.map((t) => {
      const updated = t.id === testId ? { ...t, ...partial } : t;
      if (updated.winnerTeamId === 'team1') t1Wins++;
      else if (updated.winnerTeamId === 'team2') t2Wins++;
      else if (updated.winnerTeamId === 'draw') draws++;
      return updated;
    });

    const isSeriesDecided =
      t1Wins >= 3 || t2Wins >= 3 || updatedTests.every((t) => t.status === 'completed');
    let overallWinner: 'team1' | 'team2' | null = null;
    let status = currentMatch.status;

    if (t1Wins > t2Wins && isSeriesDecided) {
      overallWinner = 'team1';
      status = 'completed';
    } else if (t2Wins > t1Wins && isSeriesDecided) {
      overallWinner = 'team2';
      status = 'completed';
    }

    const updatedSeries: DetailedCricketSeries = {
      ...cricketSeries,
      tests: updatedTests,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      draws,
    };

    handleUpdateMatch({
      status,
      winnerTeamId: overallWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded:
        overallWinner === 'team1'
          ? currentMatch.basePoints
          : overallWinner === 'team2'
          ? currentMatch.consolationPoints
          : undefined,
      team2PointsAwarded:
        overallWinner === 'team2'
          ? currentMatch.basePoints
          : overallWinner === 'team1'
          ? currentMatch.consolationPoints
          : undefined,
      detailedScore: { type: 'cricket_series', data: updatedSeries },
    });
  };

  const handleAddCricketTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || currentMatch.detailedScore?.type !== 'cricket_series') return;
    const cricketSeries = currentMatch.detailedScore.data;

    const nextNum = cricketSeries.tests.length + 1;
    const newTest: CricketTestMatch = {
      id: 'test_' + Date.now(),
      testNumber: nextNum,
      title: newTestTitle.trim() || `Test ${nextNum} of 5`,
      venue: newTestVenue.trim() || 'Championship Turf',
      date: newTestDate.trim() || 'TBD',
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

    handleUpdateMatch({
      detailedScore: { type: 'cricket_series', data: updatedSeries },
    });

    setShowAddCricketModal(false);
    setNewTestTitle('');
    setNewTestVenue('');
    setNewTestDate('');
    showFlash(`Test ${nextNum} added!`);
  };

  const handleDeleteCricketTest = (testId: string) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'cricket_series') return;
    const cricketSeries = currentMatch.detailedScore.data;
    const test = cricketSeries.tests.find((t) => t.id === testId);

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Test Match?',
      message: `Delete ${test?.title || 'this test match'} from the Cricket series? Series scores will recalculate automatically.`,
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

        handleUpdateMatch({
          team1ScoreDisplay: String(t1Wins),
          team2ScoreDisplay: String(t2Wins),
          detailedScore: { type: 'cricket_series', data: updatedSeries },
        });
        showFlash('Test match deleted.');
      },
    });
  };

  // -------------------------------------------------------------
  // SMASH KARTS ADMIN (Add, Delete, Update)
  // -------------------------------------------------------------
  const handleAddSmashGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch || currentMatch.detailedScore?.type !== 'smash_karts_series') return;
    const smashSeries = currentMatch.detailedScore.data;

    const nextNum = smashSeries.games.length + 1;
    const winner: 'team1' | 'team2' | null =
      newSmashT1 > newSmashT2 && (newSmashT1 > 0 || newSmashT2 > 0)
        ? 'team1'
        : newSmashT2 > newSmashT1 && (newSmashT1 > 0 || newSmashT2 > 0)
        ? 'team2'
        : null;

    const newGame: SmashKartsGame = {
      id: 'sk_' + Date.now(),
      gameNumber: nextNum,
      type: newSmashType,
      arena: newSmashArena.trim() || undefined,
      team1Score: newSmashT1,
      team2Score: newSmashT2,
      status: winner ? 'completed' : 'upcoming',
      winnerTeamId: winner,
    };

    const updatedGames = [...smashSeries.games, newGame];
    const updatedSeries: DetailedSmashKartsSeries = {
      ...smashSeries,
      totalGames: Math.max(smashSeries.totalGames, updatedGames.length),
      games: updatedGames,
    };

    handleUpdateMatch({
      detailedScore: { type: 'smash_karts_series', data: updatedSeries },
    });

    setShowAddSmashModal(false);
    setNewSmashArena('');
    setNewSmashT1(0);
    setNewSmashT2(0);
    setNewSmashType(newSmashType === 'TDM' ? 'CTF' : 'TDM');
    showFlash(`Game ${nextNum} (${newSmashType}) added!`);
  };

  const handleDeleteSmashGame = (gameId: string) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'smash_karts_series') return;
    const smashSeries = currentMatch.detailedScore.data;
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

        handleUpdateMatch({
          detailedScore: { type: 'smash_karts_series', data: updatedSeries },
        });
        showFlash('Smash Karts game deleted.');
      },
    });
  };

  const handleDeleteStumbleGuysGame = (gameId: string) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'stumble_guys_series') return;
    const series = currentMatch.detailedScore.data;
    const g = series.games.find((item) => item.id === gameId);

    setConfirmDialog({
      isOpen: true,
      title: `Delete Stumble Guys Game ${g?.gameNumber || ''}?`,
      message: `Delete this game (${g?.mapName || ''}) from Stumble Guys?`,
      confirmLabel: 'Delete Game',
      onConfirm: () => {
        const updatedGames = series.games.filter((item) => item.id !== gameId);
        let t1Wins = 0;
        let t2Wins = 0;
        updatedGames.forEach((item) => {
          if (item.winnerTeamId === 'team1') t1Wins++;
          else if (item.winnerTeamId === 'team2') t2Wins++;
        });

        const updatedSeries: DetailedStumbleGuysSeries = {
          ...series,
          games: updatedGames,
          team1SeriesWins: t1Wins,
          team2SeriesWins: t2Wins,
        };

        handleUpdateMatch({
          team1ScoreDisplay: String(t1Wins),
          team2ScoreDisplay: String(t2Wins),
          detailedScore: { type: 'stumble_guys_series', data: updatedSeries },
        });
        showFlash('Stumble Guys game deleted.');
      },
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    const targetMatch = state.matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    setConfirmDialog({
      isOpen: true,
      title: `Delete Match: ${targetMatch.gameName}?`,
      message: `Are you sure you want to permanently delete ${targetMatch.gameName} from the championship schedule? Standings and points will be recalculated immediately.`,
      confirmLabel: 'Delete Match',
      variant: 'danger',
      onConfirm: () => {
        const updatedMatches = state.matches.filter((m) => m.id !== matchId);
        const nextId = updatedMatches[0]?.id || '';
        setSelectedMatchId(nextId);
        onUpdateState({
          ...state,
          matches: updatedMatches,
        });
        showFlash(`${targetMatch.gameName} deleted from tournament.`);
      },
    });
  };

  const handleUpdateSmashGame = (gameId: string, partial: Partial<SmashKartsGame>) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'smash_karts_series') return;
    const smashSeries = currentMatch.detailedScore.data;

    const updatedGames = smashSeries.games.map((g) => {
      if (g.id !== gameId) return g;
      const updated = { ...g, ...partial };
      if (updated.team1Score > updated.team2Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
        updated.winnerTeamId = 'team1';
        updated.status = 'completed';
      } else if (updated.team2Score > updated.team1Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
        updated.winnerTeamId = 'team2';
        updated.status = 'completed';
      }
      return updated;
    });

    const updatedSeries: DetailedSmashKartsSeries = {
      ...smashSeries,
      games: updatedGames,
    };

    handleUpdateMatch({
      detailedScore: { type: 'smash_karts_series', data: updatedSeries },
    });
  };

  // -------------------------------------------------------------
  // BADMINTON & FOOTVOLLEY ADMIN
  // -------------------------------------------------------------
  const handleUpdateBadmintonGame = (gameId: string, partial: Partial<BadmintonGame>) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'badminton_series') return;
    const series = currentMatch.detailedScore.data;

    let t1Wins = 0;
    let t2Wins = 0;
    const updatedGames = series.games.map((g) => {
      const updated = g.id === gameId ? { ...g, ...partial } : g;
      if (updated.winnerTeamId === 'team1') t1Wins++;
      else if (updated.winnerTeamId === 'team2') t2Wins++;
      return updated;
    });

    const isWinner = t1Wins >= series.targetWins || t2Wins >= series.targetWins;
    const seriesWinner = t1Wins >= series.targetWins ? 'team1' : t2Wins >= series.targetWins ? 'team2' : null;

    const updatedSeries: DetailedBadmintonSeries = {
      ...series,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    handleUpdateMatch({
      status: isWinner ? 'completed' : currentMatch.status,
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: seriesWinner === 'team1' ? currentMatch.basePoints : seriesWinner === 'team2' ? currentMatch.consolationPoints : undefined,
      team2PointsAwarded: seriesWinner === 'team2' ? currentMatch.basePoints : seriesWinner === 'team1' ? currentMatch.consolationPoints : undefined,
      detailedScore: { type: 'badminton_series', data: updatedSeries },
    });
  };

  const handleUpdateFootvolleyGame = (gameId: string, partial: Partial<FootvolleyGame>) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'footvolley_series') return;
    const series = currentMatch.detailedScore.data;

    let t1Wins = 0;
    let t2Wins = 0;
    const updatedGames = series.games.map((g) => {
      const updated = g.id === gameId ? { ...g, ...partial } : g;
      if (updated.winnerTeamId === 'team1') t1Wins++;
      else if (updated.winnerTeamId === 'team2') t2Wins++;
      return updated;
    });

    const isWinner = t1Wins >= series.targetWins || t2Wins >= series.targetWins;
    const seriesWinner = t1Wins >= series.targetWins ? 'team1' : t2Wins >= series.targetWins ? 'team2' : null;

    const updatedSeries: DetailedFootvolleySeries = {
      ...series,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    handleUpdateMatch({
      status: isWinner ? 'completed' : currentMatch.status,
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: seriesWinner === 'team1' ? currentMatch.basePoints : seriesWinner === 'team2' ? currentMatch.consolationPoints : undefined,
      team2PointsAwarded: seriesWinner === 'team2' ? currentMatch.basePoints : seriesWinner === 'team1' ? currentMatch.consolationPoints : undefined,
      detailedScore: { type: 'footvolley_series', data: updatedSeries },
    });
  };

  const handleUpdateTableTennisGame = (gameId: string, partial: Partial<TableTennisGame>) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'table_tennis_series') return;
    const series = currentMatch.detailedScore.data;

    let t1Wins = 0;
    let t2Wins = 0;
    const updatedGames = series.games.map((g) => {
      if (g.id !== gameId) {
        if (g.winnerTeamId === 'team1') t1Wins++;
        else if (g.winnerTeamId === 'team2') t2Wins++;
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

      if (!partial.winnerTeamId) {
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

      if (updated.winnerTeamId === 'team1') t1Wins++;
      else if (updated.winnerTeamId === 'team2') t2Wins++;

      return updated;
    });

    const isWinner = t1Wins >= series.targetWins || t2Wins >= series.targetWins;
    const seriesWinner = t1Wins >= series.targetWins ? 'team1' : t2Wins >= series.targetWins ? 'team2' : null;

    const updatedSeries: DetailedTableTennisSeries = {
      ...series,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    handleUpdateMatch({
      status: isWinner ? 'completed' : (t1Wins > 0 || t2Wins > 0 ? 'live' : currentMatch.status),
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: seriesWinner === 'team1' ? currentMatch.basePoints : seriesWinner === 'team2' ? currentMatch.consolationPoints : undefined,
      team2PointsAwarded: seriesWinner === 'team2' ? currentMatch.basePoints : seriesWinner === 'team1' ? currentMatch.consolationPoints : undefined,
      detailedScore: { type: 'table_tennis_series', data: updatedSeries },
    });
  };

  const handleUpdateStumbleGuysGame = (gameId: string, partial: Partial<StumbleGuysGame>) => {
    if (!currentMatch || currentMatch.detailedScore?.type !== 'stumble_guys_series') return;
    const series = currentMatch.detailedScore.data;

    let t1Wins = 0;
    let t2Wins = 0;
    const updatedGames = series.games.map((g) => {
      if (g.id !== gameId) {
        if (g.winnerTeamId === 'team1') t1Wins++;
        else if (g.winnerTeamId === 'team2') t2Wins++;
        return g;
      }
      const updated = { ...g, ...partial };
      if (!partial.winnerTeamId) {
        if (updated.team1Score > updated.team2Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
          updated.winnerTeamId = 'team1';
          updated.status = 'completed';
        } else if (updated.team2Score > updated.team1Score && (updated.team1Score > 0 || updated.team2Score > 0)) {
          updated.winnerTeamId = 'team2';
          updated.status = 'completed';
        }
      }

      if (updated.winnerTeamId === 'team1') t1Wins++;
      else if (updated.winnerTeamId === 'team2') t2Wins++;

      return updated;
    });

    const isWinner = t1Wins >= series.targetWins || t2Wins >= series.targetWins;
    const seriesWinner = t1Wins >= series.targetWins ? 'team1' : t2Wins >= series.targetWins ? 'team2' : null;

    const updatedSeries: DetailedStumbleGuysSeries = {
      ...series,
      team1SeriesWins: t1Wins,
      team2SeriesWins: t2Wins,
      games: updatedGames,
    };

    handleUpdateMatch({
      status: isWinner ? 'completed' : (t1Wins > 0 || t2Wins > 0 ? 'live' : currentMatch.status),
      winnerTeamId: seriesWinner,
      team1ScoreDisplay: String(t1Wins),
      team2ScoreDisplay: String(t2Wins),
      team1PointsAwarded: seriesWinner === 'team1' ? currentMatch.basePoints : seriesWinner === 'team2' ? currentMatch.consolationPoints : undefined,
      team2PointsAwarded: seriesWinner === 'team2' ? currentMatch.basePoints : seriesWinner === 'team1' ? currentMatch.consolationPoints : undefined,
      detailedScore: { type: 'stumble_guys_series', data: updatedSeries },
    });
  };

  // Players
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newP: Player = {
      id: 'p_' + Date.now(),
      name: newPlayerName.trim(),
      teamId: newPlayerTeam,
      role: newPlayerRole.trim(),
      bio: newPlayerBio.trim() || 'Contender in the Garam Prix roster.',
      favoriteGame: newPlayerGame.trim() || undefined,
    };

    onUpdateState({
      ...state,
      players: [...state.players, newP],
    });

    setNewPlayerName('');
    setNewPlayerBio('');
    setNewPlayerGame('');
    setShowAddPlayer(false);
    showFlash(`Player ${newP.name} added!`);
  };

  const handleDeletePlayer = (id: string) => {
    const player = state.players.find((p) => p.id === id);
    setConfirmDialog({
      isOpen: true,
      title: `Remove Player: ${player?.name || 'Player'}?`,
      message: `Are you sure you want to remove ${player?.name || 'this player'} from the tournament roster?`,
      confirmLabel: 'Remove Player',
      variant: 'danger',
      onConfirm: () => {
        onUpdateState({
          ...state,
          players: state.players.filter((p) => p.id !== id),
        });
        showFlash('Player removed.');
      },
    });
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', 'garam_prix_backup.json');
    dl.click();
    showFlash('JSON downloaded.');
  };

  const handleCreateNewMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchName.trim()) return;
    const basePts = newMatchTier === 'platinum' ? 10 : newMatchTier === 'gold' ? 7 : 5;
    const consPts = newMatchTier === 'platinum' ? 4 : newMatchTier === 'gold' ? 3 : 2;
    const newId = 'm_' + Date.now();
    const newM: Match = {
      id: newId,
      gameKey: newMatchName.toLowerCase().replace(/\s+/g, '_'),
      gameName: newMatchName.trim(),
      emoji: newMatchEmoji.trim() || '🎮',
      tier: newMatchTier,
      basePoints: basePts,
      consolationPoints: consPts,
      venueOrPlatform: 'Custom Arena',
      status: 'upcoming',
      scheduledTime: newMatchTime.trim() || 'TBD',
      scheduledDate: newMatchDate || undefined,
      matchNotes: `Championship match for ${newMatchName.trim()} in Garam Prix.`,
      subtitleTag: `${newMatchTier.toUpperCase()} · ${basePts} PTS`,
      updates: [],
    };
    const updatedMatches = [...state.matches, newM];
    setSelectedMatchId(newId);
    onUpdateState({
      ...state,
      matches: updatedMatches,
    });
    setShowAddMatchModal(false);
    setNewMatchName('');
    setNewMatchDate('');
    setNewMatchTime('');
    showFlash(`Match "${newM.gameName}" added to tournament!`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-400" />
          <div>
            <h2 className="font-semibold text-lg text-white">Admin Control Room</h2>
          </div>
        </div>

        {flashMsg && (
          <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full">
            {flashMsg}
          </span>
        )}
      </div>

      {/* Match Selector & Series Managers */}
      <div className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Match Score & Series Controller
          </h3>

          {/* Contextual Add Buttons & Match Management */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMatchModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Match</span>
            </button>

            {currentMatch?.gameKey === 'cricket' && (
              <button
                onClick={() => setShowAddCricketModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Match</span>
              </button>
            )}

            {currentMatch?.gameKey === 'smash_karts' && (
              <button
                onClick={() => setShowAddSmashModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Smash Game</span>
              </button>
            )}
          </div>
        </div>

        {/* Match selector pills */}
        {state.matches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl space-y-3">
            <p className="text-sm">No matches currently scheduled in Garam Prix.</p>
            <button
              onClick={() => setShowAddMatchModal(true)}
              className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              + Add First Match
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {state.matches.map((m) => (
              <div key={m.id} className="relative group">
                <button
                  onClick={() => setSelectedMatchId(m.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedMatchId === m.id
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#141824] text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.gameName}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Selected Match Schedule & Date Editor */}
        {currentMatch && (
          <div className="p-4 bg-[#141824] border border-white/[0.08] rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentMatch.emoji}</span>
              <div>
                <span className="font-bold text-white block text-sm">{currentMatch.gameName}</span>
                <span className="text-slate-400 text-[11px]">
                  {currentMatch.subtitleTag} · Tier: <span className="uppercase font-semibold text-slate-300">{currentMatch.tier}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-400" />
                  <span>Calendar Date</span>
                </label>
                <input
                  type="date"
                  value={currentMatch.scheduledDate || ''}
                  onChange={(e) => handleUpdateMatchDate(currentMatch.id, e.target.value)}
                  className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1 text-white text-xs cursor-pointer focus:border-sky-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Timeline Label</span>
                </label>
                <input
                  type="text"
                  value={currentMatch.scheduledTime}
                  onChange={(e) => handleUpdateMatch({ scheduledTime: e.target.value })}
                  placeholder="e.g. Aug 15 · Day 1"
                  className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1 text-white text-xs min-w-[130px] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Status</label>
                <select
                  value={currentMatch.status}
                  onChange={(e) => handleUpdateMatch({ status: e.target.value as MatchStatus })}
                  className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Match-level Delete Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleDeleteMatch(currentMatch.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold transition-colors cursor-pointer"
                  title="Delete this match from tournament"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Match</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Match Modal Form */}
        {showAddMatchModal && (
          <form
            onSubmit={handleCreateNewMatch}
            className="p-5 bg-[#141824] border border-white/10 rounded-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-sm text-white">Add New Match to Garam Prix</span>
              <button
                type="button"
                onClick={() => setShowAddMatchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Game Name</label>
                <input
                  type="text"
                  value={newMatchName}
                  onChange={(e) => setNewMatchName(e.target.value)}
                  placeholder="e.g. Volleyball, Bowling"
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Emoji Icon</label>
                <input
                  type="text"
                  value={newMatchEmoji}
                  onChange={(e) => setNewMatchEmoji(e.target.value)}
                  placeholder="e.g. 🏐"
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Championship Tier</label>
                <select
                  value={newMatchTier}
                  onChange={(e) => setNewMatchTier(e.target.value as any)}
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                >
                  <option value="platinum">Platinum (10 PTS / 4 Consolation)</option>
                  <option value="gold">Gold (7 PTS / 3 Consolation)</option>
                  <option value="silver">Silver (5 PTS / 2 Consolation)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={newMatchDate}
                  onChange={(e) => setNewMatchDate(e.target.value)}
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Timeline Display Label</label>
                <input
                  type="text"
                  value={newMatchTime}
                  onChange={(e) => setNewMatchTime(e.target.value)}
                  placeholder="e.g. Aug 28 · Day 6"
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddMatchModal(false)}
                className="px-3 py-1.5 bg-white/10 text-white rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-white text-black font-semibold rounded hover:bg-slate-200 cursor-pointer"
              >
                Create Match
              </button>
            </div>
          </form>
        )}

        {/* Add Cricket Modal Form */}
        {showAddCricketModal && currentMatch?.gameKey === 'cricket' && (
          <form
            onSubmit={handleAddCricketTest}
            className="p-4 bg-[#141824] border border-white/10 rounded-xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Schedule New Test Match</span>
              <button
                type="button"
                onClick={() => setShowAddCricketModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newTestTitle}
                onChange={(e) => setNewTestTitle(e.target.value)}
                placeholder="Title (e.g. Test 3 of 5)"
                className="bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
              <input
                type="text"
                value={newTestVenue}
                onChange={(e) => setNewTestVenue(e.target.value)}
                placeholder="Venue"
                className="bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
              <input
                type="text"
                value={newTestDate}
                onChange={(e) => setNewTestDate(e.target.value)}
                placeholder="Date (e.g. 29 Aug – 2 Sep)"
                className="bg-[#0e1216] border border-white/10 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCricketModal(false)}
                className="px-3 py-1 bg-white/10 text-white rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-white text-black font-semibold rounded hover:bg-slate-200 cursor-pointer"
              >
                Add Test Match
              </button>
            </div>
          </form>
        )}

        {/* Add Smash Game Modal Form (Asks TDM / CTF) */}
        {showAddSmashModal && currentMatch?.gameKey === 'smash_karts' && (
          <form
            onSubmit={handleAddSmashGame}
            className="p-4 bg-[#141824] border border-white/10 rounded-xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Add Game to Smash Karts (TDM / CTF)</span>
              <button
                type="button"
                onClick={() => setShowAddSmashModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Game Type</label>
                <select
                  value={newSmashType}
                  onChange={(e) => setNewSmashType(e.target.value as any)}
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
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
                  placeholder="Arena name"
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">{state.teams.team1.name} Score</label>
                <input
                  type="number"
                  value={newSmashT1}
                  onChange={(e) => setNewSmashT1(Number(e.target.value) || 0)}
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">{state.teams.team2.name} Score</label>
                <input
                  type="number"
                  value={newSmashT2}
                  onChange={(e) => setNewSmashT2(Number(e.target.value) || 0)}
                  className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSmashModal(false)}
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

        {/* 🏏 CRICKET CONTROLLER */}
        {currentMatch?.gameKey === 'cricket' &&
          currentMatch.detailedScore?.type === 'cricket_series' && (
            <div className="space-y-4 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Cricket 5-Test Series:{' '}
                  <strong className="text-white">
                    {state.teams.team1.name} {currentMatch.detailedScore.data.team1SeriesWins} -{' '}
                    {currentMatch.detailedScore.data.team2SeriesWins} {state.teams.team2.name}
                  </strong>
                </span>
                <span>{currentMatch.detailedScore.data.tests.length} Matches</span>
              </div>

              <div className="space-y-3">
                {currentMatch.detailedScore.data.tests.map((test) => {
                  const t1Display = formatMatchScoreDisplay(
                    test.team1Innings1,
                    test.team1Innings2,
                    test.status === 'live'
                  );
                  const t2Display = formatMatchScoreDisplay(
                    test.team2Innings1,
                    test.team2Innings2,
                    test.status === 'live'
                  );

                  return (
                    <div
                      key={test.id}
                      className="p-4 bg-[#141824] border border-white/[0.06] rounded-xl space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white block">{test.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {test.venue} · {test.date} · <span className="capitalize">{test.status}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingCricketTestId(
                                editingCricketTestId === test.id ? null : test.id
                              )
                            }
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{editingCricketTestId === test.id ? 'Close' : 'Edit Innings'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCricketTest(test.id)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer"
                            title="Delete Test Match"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-white/[0.04]">
                        <div>
                          <span className="text-slate-400 mr-2">{state.teams.team1.name}:</span>
                          <span className="font-semibold text-white">{t1Display}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 mr-2">{state.teams.team2.name}:</span>
                          <span className="font-semibold text-white">{t2Display}</span>
                        </div>
                      </div>

                      {/* EDIT BOTH INNINGS */}
                      {editingCricketTestId === test.id && (
                        <div className="p-4 bg-[#0a0c10] border border-white/10 rounded-xl space-y-3 mt-2">
                          <span className="font-semibold text-white block uppercase text-[11px]">
                            Edit Innings & Scorecard Link
                          </span>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2.5 bg-[#141824] rounded-lg border border-red-500/20 space-y-1.5">
                              <span className="text-red-400 font-semibold block">{state.teams.team1.name}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block">1st Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team1Innings1.runs}
                                    onChange={(e) =>
                                      handleUpdateCricketTest(test.id, {
                                        team1Innings1: { ...test.team1Innings1, runs: Number(e.target.value) || 0 },
                                      })
                                    }
                                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block">2nd Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team1Innings2?.runs ?? 0}
                                    onChange={(e) =>
                                      handleUpdateCricketTest(test.id, {
                                        team1Innings2: { runs: Number(e.target.value) || 0, wickets: test.team1Innings2?.wickets ?? 0 },
                                      })
                                    }
                                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 bg-[#141824] rounded-lg border border-sky-500/20 space-y-1.5">
                              <span className="text-sky-400 font-semibold block">{state.teams.team2.name}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block">1st Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team2Innings1.runs}
                                    onChange={(e) =>
                                      handleUpdateCricketTest(test.id, {
                                        team2Innings1: { ...test.team2Innings1, runs: Number(e.target.value) || 0 },
                                      })
                                    }
                                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block">2nd Inn Runs</label>
                                  <input
                                    type="number"
                                    value={test.team2Innings2?.runs ?? 0}
                                    onChange={(e) =>
                                      handleUpdateCricketTest(test.id, {
                                        team2Innings2: { runs: Number(e.target.value) || 0, wickets: test.team2Innings2?.wickets ?? 0 },
                                      })
                                    }
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
                              onChange={(e) =>
                                handleUpdateCricketTest(test.id, { resultSummary: e.target.value })
                              }
                              placeholder="Result summary (e.g. T1 won by 42 runs)"
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            />
                            <input
                              type="url"
                              value={test.scorecardImageUrl || ''}
                              onChange={(e) =>
                                handleUpdateCricketTest(test.id, { scorecardImageUrl: e.target.value.trim() })
                              }
                              placeholder="Scorecard Photo Link"
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={test.status}
                              onChange={(e) =>
                                handleUpdateCricketTest(test.id, { status: e.target.value as any })
                              }
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="live">Live</option>
                              <option value="completed">Completed</option>
                            </select>
                            <select
                              value={test.winnerTeamId || ''}
                              onChange={(e) =>
                                handleUpdateCricketTest(test.id, {
                                  winnerTeamId: (e.target.value as any) || null,
                                  status: e.target.value ? 'completed' : test.status,
                                })
                              }
                              className="bg-[#141824] border border-white/10 rounded px-2.5 py-1.5 text-white"
                            >
                              <option value="">Victor: In Progress</option>
                              <option value="team1">{state.teams.team1.name} Win</option>
                              <option value="team2">{state.teams.team2.name} Win</option>
                              <option value="draw">Draw</option>
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

        {/* 🏎️ SMASH KARTS CONTROLLER */}
        {currentMatch?.gameKey === 'smash_karts' &&
          currentMatch.detailedScore?.type === 'smash_karts_series' && (
            <div className="space-y-4 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Smash Karts 7-Game Series (First to 4 wins):{' '}
                  <strong className="text-white">
                    {state.teams.team1.name} {currentMatch.detailedScore.data.team1SeriesWins} -{' '}
                    {currentMatch.detailedScore.data.team2SeriesWins} {state.teams.team2.name}
                  </strong>
                </span>
                <div className="flex items-center gap-2">
                  <span>{currentMatch.detailedScore.data.games.length} Games</span>
                  <button
                    type="button"
                    onClick={() => setShowAddSmashModal(!showAddSmashModal)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-black text-xs font-semibold rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddSmashModal ? 'Cancel' : 'Add Game (TDM/CTF)'}</span>
                  </button>
                </div>
              </div>

              {/* Add Smash Game Form directly in section */}
              {showAddSmashModal && (
                <form
                  onSubmit={handleAddSmashGame}
                  className="p-4 bg-[#141824] border border-white/10 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Add Game to Smash Karts (TDM / CTF)</span>
                    <button
                      type="button"
                      onClick={() => setShowAddSmashModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Game Type</label>
                      <select
                        value={newSmashType}
                        onChange={(e) => setNewSmashType(e.target.value as any)}
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
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
                        placeholder="e.g. Lava Core"
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{state.teams.team1.name} Score</label>
                      <input
                        type="number"
                        value={newSmashT1}
                        onChange={(e) => setNewSmashT1(Number(e.target.value) || 0)}
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">{state.teams.team2.name} Score</label>
                      <input
                        type="number"
                        value={newSmashT2}
                        onChange={(e) => setNewSmashT2(Number(e.target.value) || 0)}
                        className="w-full bg-[#0e1216] border border-white/10 rounded px-2 py-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSmashModal(false)}
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

              <div className="space-y-2.5">
                {currentMatch.detailedScore.data.games.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-[#141824] border border-white/[0.04] rounded-xl flex flex-col gap-2 text-xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-white/10 font-semibold flex items-center justify-center text-[10px]">
                          {g.gameNumber}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${g.type === 'TDM' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'}`}>
                          {g.type}
                        </span>
                        <span className="text-slate-300">{g.arena || 'Arena'}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-sm">
                          <span className="text-red-400">{g.team1Score}</span>
                          <span className="text-slate-500 mx-1">-</span>
                          <span className="text-sky-400">{g.team2Score}</span>
                        </div>

                        {g.winnerTeamId && (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            {g.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name} Win
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditingSmashId(editingSmashId === g.id ? null : g.id)}
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
                    </div>

                    {/* Quick edit */}
                    {editingSmashId === g.id && (
                      <div className="w-full mt-2 pt-2 border-t border-white/10 grid grid-cols-4 gap-2">
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
                          <label className="text-[10px] text-slate-400 block">{state.teams.team1.name}</label>
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
                          <label className="text-[10px] text-slate-400 block">{state.teams.team2.name}</label>
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
                        <div>
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 🏸 BADMINTON CONTROLLER */}
        {currentMatch?.gameKey === 'badminton' &&
          currentMatch.detailedScore?.type === 'badminton_series' && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Badminton 3-Game Series (1st Singles, Doubles, 2nd Singles)</span>
                <span className="text-white font-semibold">
                  {currentMatch.detailedScore.data.team1SeriesWins} - {currentMatch.detailedScore.data.team2SeriesWins}
                </span>
              </div>

              {currentMatch.detailedScore.data.games.map((g) => (
                <div key={g.id} className="p-3 bg-[#141824] border border-white/[0.04] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Game {g.gameNumber}: {g.matchType}</span>
                    <button
                      type="button"
                      onClick={() => setEditingBadmintonId(editingBadmintonId === g.id ? null : g.id)}
                      className="px-2 py-0.5 bg-white/10 text-slate-300 rounded cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 bg-[#0e1216] rounded">
                      <span className="text-[10px] text-slate-400 block">Set 1 (11)</span>
                      <span>{g.set1.team1} - {g.set1.team2}</span>
                    </div>
                    <div className="p-1.5 bg-[#0e1216] rounded">
                      <span className="text-[10px] text-slate-400 block">Set 2 (11)</span>
                      <span>{g.set2.team1} - {g.set2.team2}</span>
                    </div>
                    <div className="p-1.5 bg-[#0e1216] rounded">
                      <span className="text-[10px] text-slate-400 block">Set 3 (21)</span>
                      <span>{g.set3.team1} - {g.set3.team2}</span>
                    </div>
                  </div>

                  {editingBadmintonId === g.id && (
                    <div className="p-2.5 bg-[#0a0c10] border border-white/10 rounded-lg space-y-2 mt-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Set 1 (11)</label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={g.set1.team1}
                              onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                set1: { team1: Number(e.target.value) || 0, team2: g.set1.team2 }
                              })}
                              className="w-1/2 bg-[#141824] border border-white/10 rounded p-1 text-center text-white"
                            />
                            <input
                              type="number"
                              value={g.set1.team2}
                              onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                set1: { team1: g.set1.team1, team2: Number(e.target.value) || 0 }
                              })}
                              className="w-1/2 bg-[#141824] border border-white/10 rounded p-1 text-center text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Set 2 (11)</label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={g.set2.team1}
                              onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                set2: { team1: Number(e.target.value) || 0, team2: g.set2.team2 }
                              })}
                              className="w-1/2 bg-[#141824] border border-white/10 rounded p-1 text-center text-white"
                            />
                            <input
                              type="number"
                              value={g.set2.team2}
                              onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                set2: { team1: g.set2.team1, team2: Number(e.target.value) || 0 }
                              })}
                              className="w-1/2 bg-[#141824] border border-white/10 rounded p-1 text-center text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Set 3 (21)</label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={g.set3.team1}
                              onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                set3: { team1: Number(e.target.value) || 0, team2: g.set3.team2 }
                              })}
                              className="w-1/2 bg-[#141824] border border-white/10 rounded p-1 text-center text-white"
                            />
                            <input
                              type="number"
                              value={g.set3.team2}
                              onChange={(e) => handleUpdateBadmintonGame(g.id, {
                                set3: { team1: g.set3.team1, team2: Number(e.target.value) || 0 }
                              })}
                              className="w-1/2 bg-[#141824] border border-white/10 rounded p-1 text-center text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={g.winnerTeamId || ''}
                          onChange={(e) => handleUpdateBadmintonGame(g.id, {
                            winnerTeamId: (e.target.value as any) || null,
                            status: e.target.value ? 'completed' : g.status,
                          })}
                          className="bg-[#141824] border border-white/10 rounded p-1 text-white"
                        >
                          <option value="">Victor: In Progress</option>
                          <option value="team1">{state.teams.team1.name} Win</option>
                          <option value="team2">{state.teams.team2.name} Win</option>
                        </select>
                        <input
                          type="url"
                          value={g.scorecardImageUrl || ''}
                          onChange={(e) => handleUpdateBadmintonGame(g.id, { scorecardImageUrl: e.target.value.trim() })}
                          placeholder="Scorecard Photo Link"
                          className="bg-[#141824] border border-white/10 rounded p-1 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* 🏐 FOOTVOLLEY CONTROLLER */}
        {currentMatch?.gameKey === 'footvolley' &&
          currentMatch.detailedScore?.type === 'footvolley_series' && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Footvolley 3-Game Series (25 points each)</span>
                <span className="text-white font-semibold">
                  {currentMatch.detailedScore.data.team1SeriesWins} - {currentMatch.detailedScore.data.team2SeriesWins}
                </span>
              </div>

              {currentMatch.detailedScore.data.games.map((g) => (
                <div key={g.id} className="p-3 bg-[#141824] border border-white/[0.04] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">Game {g.gameNumber} (25 PTS)</span>
                    <span className="text-slate-400">{g.winnerTeamId ? `Winner: ${g.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name}` : 'Target 25'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">
                      <span className="text-red-400">{g.team1Score}</span> - <span className="text-sky-400">{g.team2Score}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditingFootvolleyId(editingFootvolleyId === g.id ? null : g.id)}
                      className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {editingFootvolleyId === g.id && (
                    <div className="w-full mt-2 pt-2 border-t border-white/10 grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={g.team1Score}
                        onChange={(e) => handleUpdateFootvolleyGame(g.id, {
                          team1Score: Number(e.target.value) || 0,
                          winnerTeamId: Number(e.target.value) >= 25 ? 'team1' : g.team2Score >= 25 ? 'team2' : null,
                        })}
                        placeholder={`${state.teams.team1.name} Score`}
                        className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        value={g.team2Score}
                        onChange={(e) => handleUpdateFootvolleyGame(g.id, {
                          team2Score: Number(e.target.value) || 0,
                          winnerTeamId: g.team1Score >= 25 ? 'team1' : Number(e.target.value) >= 25 ? 'team2' : null,
                        })}
                        placeholder={`${state.teams.team2.name} Score`}
                        className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="url"
                        value={g.scorecardImageUrl || ''}
                        onChange={(e) => handleUpdateFootvolleyGame(g.id, { scorecardImageUrl: e.target.value.trim() })}
                        placeholder="Scorecard URL"
                        className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* 🏓 TABLE TENNIS CONTROLLER (3-Game Series, 21-PT SETS) */}
        {currentMatch?.gameKey === 'table_tennis' &&
          currentMatch.detailedScore?.type === 'table_tennis_series' && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Table Tennis 3-Game Series (21-pt sets)</span>
                <span className="text-white font-semibold">
                  {currentMatch.detailedScore.data.team1SeriesWins} - {currentMatch.detailedScore.data.team2SeriesWins}
                </span>
              </div>

              {currentMatch.detailedScore.data.games.map((g) => (
                <div key={g.id} className="p-3 bg-[#141824] border border-white/[0.04] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Game {g.gameNumber}: {g.matchType}</span>
                      <span className="text-slate-400">
                        {g.winnerTeamId ? `Winner: ${g.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name}` : '21 PTS per set'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-300">
                        S1: {g.set1.team1}-{g.set1.team2} · S2: {g.set2.team1}-{g.set2.team2} · S3: {g.set3.team1}-{g.set3.team2}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingTTId(editingTTId === g.id ? null : g.id)}
                        className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingTTId === g.id && (
                    <div className="p-2.5 bg-[#0c0e15] border border-white/10 rounded-lg space-y-2 mt-2">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Edit Sets (21 Points Each)</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">Set 1 (21)</span>
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
                          <span className="text-[10px] text-slate-400 block mb-0.5">Set 2 (21)</span>
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
                          <span className="text-[10px] text-slate-400 block mb-0.5">Set 3 (21)</span>
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

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <select
                          value={g.winnerTeamId || ''}
                          onChange={(e) => handleUpdateTableTennisGame(g.id, {
                            winnerTeamId: (e.target.value as any) || null,
                            status: e.target.value ? 'completed' : g.status,
                          })}
                          className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                        >
                          <option value="">Winner: Auto</option>
                          <option value="team1">{state.teams.team1.name} Win</option>
                          <option value="team2">{state.teams.team2.name} Win</option>
                        </select>
                        <input
                          type="url"
                          value={g.scorecardImageUrl || ''}
                          onChange={(e) => handleUpdateTableTennisGame(g.id, { scorecardImageUrl: e.target.value.trim() })}
                          placeholder="Scorecard URL"
                          className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* 🎮 STUMBLE GUYS CONTROLLER (5-Game Series, First to 3 Wins) */}
        {currentMatch?.gameKey === 'stumble_guys' &&
          currentMatch.detailedScore?.type === 'stumble_guys_series' && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Stumble Guys 5-Game Series (First to 3 Wins)</span>
                <span className="text-white font-semibold">
                  {currentMatch.detailedScore.data.team1SeriesWins} - {currentMatch.detailedScore.data.team2SeriesWins}
                </span>
              </div>

              {currentMatch.detailedScore.data.games.map((g) => (
                <div key={g.id} className="p-3 bg-[#141824] border border-white/[0.04] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">Game {g.gameNumber}: {g.mapName}</span>
                    <span className="text-slate-400">
                      {g.winnerTeamId ? `Winner: ${g.winnerTeamId === 'team1' ? state.teams.team1.name : state.teams.team2.name}` : 'First to 3 series'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">
                      <span className="text-red-400">{g.team1Score}</span> - <span className="text-sky-400">{g.team2Score}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditingSGId(editingSGId === g.id ? null : g.id)}
                      className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                      title="Edit Game"
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

                  {editingSGId === g.id && (
                    <div className="w-full mt-2 pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={g.mapName}
                        onChange={(e) => handleUpdateStumbleGuysGame(g.id, { mapName: e.target.value })}
                        placeholder="Map Name"
                        className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        value={g.team1Score}
                        onChange={(e) => handleUpdateStumbleGuysGame(g.id, {
                          team1Score: Number(e.target.value) || 0,
                          winnerTeamId: Number(e.target.value) > g.team2Score ? 'team1' : g.team2Score > Number(e.target.value) ? 'team2' : null,
                          status: 'completed',
                        })}
                        placeholder={`${state.teams.team1.name} Score`}
                        className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                      />
                      <input
                        type="number"
                        value={g.team2Score}
                        onChange={(e) => handleUpdateStumbleGuysGame(g.id, {
                          team2Score: Number(e.target.value) || 0,
                          winnerTeamId: g.team1Score > Number(e.target.value) ? 'team1' : Number(e.target.value) > g.team1Score ? 'team2' : null,
                          status: 'completed',
                        })}
                        placeholder={`${state.teams.team2.name} Score`}
                        className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                      />
                      <select
                        value={g.winnerTeamId || ''}
                        onChange={(e) => handleUpdateStumbleGuysGame(g.id, {
                          winnerTeamId: (e.target.value as any) || null,
                          status: e.target.value ? 'completed' : g.status,
                        })}
                        className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-white"
                      >
                        <option value="">Auto Winner</option>
                        <option value="team1">{state.teams.team1.name}</option>
                        <option value="team2">{state.teams.team2.name}</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* NON-SERIES GENERAL SCORE CONTROLLER (Basketball) */}
        {currentMatch &&
          currentMatch.gameKey !== 'cricket' &&
          currentMatch.gameKey !== 'smash_karts' &&
          currentMatch.gameKey !== 'badminton' &&
          currentMatch.gameKey !== 'footvolley' &&
          currentMatch.gameKey !== 'table_tennis' &&
          currentMatch.gameKey !== 'stumble_guys' && (
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">
                    {state.teams.team1.name} Score
                  </label>
                  <input
                    type="text"
                    value={currentMatch.team1ScoreDisplay || ''}
                    onChange={(e) => handleUpdateMatch({ team1ScoreDisplay: e.target.value })}
                    placeholder="e.g. 24"
                    className="w-full bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    {state.teams.team2.name} Score
                  </label>
                  <input
                    type="text"
                    value={currentMatch.team2ScoreDisplay || ''}
                    onChange={(e) => handleUpdateMatch({ team2ScoreDisplay: e.target.value })}
                    placeholder="e.g. 27"
                    className="w-full bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Status</label>
                  <select
                    value={currentMatch.status}
                    onChange={(e) => handleUpdateMatch({ status: e.target.value as MatchStatus })}
                    className="w-full bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Winner Buttons */}
              <div>
                <label className="text-xs text-slate-400 block mb-2">
                  Winner Selection (+{currentMatch.basePoints} pts winner, +
                  {currentMatch.consolationPoints} pts consolation)
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSetWinner('team1')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                      currentMatch.winnerTeamId === 'team1'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#141824] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {state.teams.team1.name} Win (+{currentMatch.basePoints} pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetWinner('team2')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                      currentMatch.winnerTeamId === 'team2'
                        ? 'bg-sky-600 text-white'
                        : 'bg-[#141824] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {state.teams.team2.name} Win (+{currentMatch.basePoints} pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetWinner(null)}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white bg-[#141824] cursor-pointer"
                  >
                    Clear Winner
                  </button>
                </div>
              </div>

              {/* Live Updates & Deletion */}
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Live Updates ({currentMatch.updates.length})
                  </span>
                </div>

                <form onSubmit={handleAddMatchUpdate} className="flex gap-2">
                  <input
                    type="text"
                    value={newUpdateInput}
                    onChange={(e) => setNewUpdateInput(e.target.value)}
                    placeholder="Log a live update..."
                    className="flex-1 bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Post
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentMatch.updates.length === 0 ? (
                    <div className="text-slate-500 text-xs text-center py-2.5 bg-[#141824] rounded-lg">
                      No live updates logged.
                    </div>
                  ) : (
                    currentMatch.updates.map((up) => (
                      <div
                        key={up.id}
                        className="p-2.5 bg-[#141824] border border-white/[0.04] rounded-lg text-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[10px] text-slate-400">{up.timestamp}</span>
                          <p className="text-slate-200 truncate">{up.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMatchUpdate(up.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                          title="Delete update"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
      </div>

      {/* ======================================================== */}
      {/* 📅 MASTER TOURNAMENT SCHEDULE & DATE MANAGER             */}
      {/* ======================================================== */}
      <div id="admin-schedule-manager" className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Tournament Schedule & Timeline Reorderer
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Edit the date or schedule label of any match. The timeline on desktop and mobile reorders automatically.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-sky-300 bg-sky-500/10 border border-sky-400/30 px-3 py-1 rounded-full font-medium">
            Auto-sorts by Date
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Timeline # & Event</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3">Calendar Date (Sorter)</th>
                <th className="py-3 px-3">Display Label</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sortMatchesBySchedule(state.matches).map((m, idx) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-white/10 font-black text-[11px] flex items-center justify-center text-white">
                        #{idx + 1}
                      </span>
                      <span className="text-xl">{m.emoji}</span>
                      <div>
                        <span className="font-bold text-white block">{m.gameName}</span>
                        <span className="text-[10px] text-slate-400">{m.venueOrPlatform}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {m.tier}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <input
                      type="date"
                      value={m.scheduledDate || ''}
                      onChange={(e) => handleUpdateMatchDate(m.id, e.target.value)}
                      className="bg-[#141824] border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-sky-400 cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={m.scheduledTime}
                      onChange={(e) => {
                        const updated = state.matches.map((item) =>
                          item.id === m.id ? { ...item, scheduledTime: e.target.value } : item
                        );
                        onUpdateState({ ...state, matches: updated });
                      }}
                      className="bg-[#141824] border border-white/10 rounded px-2.5 py-1 text-white text-xs min-w-[140px] outline-none"
                    />
                  </td>

                  <td className="py-3 px-3">
                    <select
                      value={m.status}
                      onChange={(e) => {
                        const updated = state.matches.map((item) =>
                          item.id === m.id ? { ...item, status: e.target.value as MatchStatus } : item
                        );
                        onUpdateState({ ...state, matches: updated });
                      }}
                      className="bg-[#141824] border border-white/10 rounded px-2 py-1 text-white text-xs outline-none"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedMatchId(m.id)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ⭐ MASTER MVP POINT RULES & CONFIGURATION                */}
      {/* ======================================================== */}
      <div id="admin-mvp-config" className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                MVP Point Rules & Championship Bonus
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Every MVP point value and the end-of-tournament Grand Team bonus can be customized here.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleUpdateMvpConfig(DEFAULT_MVP_CONFIG)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Reset Rules to Defaults
          </button>
        </div>

        {/* 9 Configurable Numbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Cricket MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🏏</span>
                <span>Cricket Test MVP</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                Default: 3 pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Points added to MVP board per Test match</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.cricketGamePoints}
              onChange={(e) => handleUpdateMvpConfig({ cricketGamePoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Stumble Guys Game MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🎮</span>
                <span>Stumble Guys Game MVP</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                Default: 1 pt
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Points added to MVP board per Stumble Guys game</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.stumbleGuysGamePoints}
              onChange={(e) => handleUpdateMvpConfig({ stumbleGuysGamePoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Smash Karts TDM MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🏎️</span>
                <span>Smash Karts TDM MVP</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                Default: 2 pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Points added per Team Deathmatch</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.smashKartsTdmPoints}
              onChange={(e) => handleUpdateMvpConfig({ smashKartsTdmPoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Smash Karts CTF MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🏎️</span>
                <span>Smash Karts CTF MVP</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Capture Flag</span>
            </div>
            <p className="text-[11px] text-slate-400">Points added per CTF game</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.smashKartsCtfPoints}
              onChange={(e) => handleUpdateMvpConfig({ smashKartsCtfPoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Basketball MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🏀</span>
                <span>Basketball MVP</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Race to 30</span>
            </div>
            <p className="text-[11px] text-slate-400">Points added for basketball game MVP</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.basketballGamePoints}
              onChange={(e) => handleUpdateMvpConfig({ basketballGamePoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Badminton Game MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🏸</span>
                <span>Badminton Game MVP</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Per Game (3 sets)</span>
            </div>
            <p className="text-[11px] text-slate-400">Points added per badminton series game</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.badmintonGamePoints}
              onChange={(e) => handleUpdateMvpConfig({ badmintonGamePoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Table Tennis Game MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🏓</span>
                <span>Table Tennis Game MVP</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">21 Pts Sets</span>
            </div>
            <p className="text-[11px] text-slate-400">Points added per TT series game</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.tableTennisGamePoints}
              onChange={(e) => handleUpdateMvpConfig({ tableTennisGamePoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Footvolley Game MVP Points */}
          <div className="p-3.5 bg-[#141824] border border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🏐</span>
                <span>Footvolley Game MVP</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">25 Pts Sets</span>
            </div>
            <p className="text-[11px] text-slate-400">Points added per footvolley game</p>
            <input
              type="number"
              min="0"
              max="20"
              value={mvpConfig.footvolleyGamePoints}
              onChange={(e) => handleUpdateMvpConfig({ footvolleyGamePoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white font-bold text-sm outline-none mt-1"
            />
          </div>

          {/* Team Champion Grand Bonus */}
          <div className="p-3.5 bg-[#1c2230] border border-amber-400/30 rounded-xl space-y-1 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Team MVP Grand Bonus</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-400/20 px-2 py-0.5 rounded">
                Default: 6 pts
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Awarded to the team with highest MVP points</p>
            <input
              type="number"
              min="0"
              max="50"
              value={mvpConfig.teamBonusPoints}
              onChange={(e) => handleUpdateMvpConfig({ teamBonusPoints: Number(e.target.value) || 0 })}
              className="w-full bg-[#0c0e15] border border-amber-400/40 rounded px-2.5 py-1.5 text-amber-300 font-black text-sm outline-none mt-1"
            />
          </div>
        </div>

        {/* Toggle: Apply bonus to standings & Conclude Garam Prix */}
        <div className="pt-4 border-t border-white/[0.06] space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#141824] rounded-xl border border-white/5">
            <div>
              <span className="font-semibold text-white block">
                Garam Prix Conclusion Status
              </span>
              <span className="text-[11px] text-slate-400">
                Rule: MVP points get added at the end of Garam Prix, only once.
                {state.isTournamentConcluded
                  ? ' Tournament is concluded. MVP bonus is officially awarded.'
                  : ' Currently active. MVP bonus is pending until conclusion.'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !state.isTournamentConcluded;
                onUpdateState({
                  ...state,
                  isTournamentConcluded: nextVal,
                });
                showFlash(nextVal ? 'Garam Prix concluded! MVP bonus awarded to leading team.' : 'Garam Prix reopened. MVP bonus set to pending.');
              }}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                state.isTournamentConcluded
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
              }`}
            >
              {state.isTournamentConcluded ? '✓ Garam Prix Concluded (Bonus Awarded)' : 'Conclude Garam Prix & Award Bonus'}
            </button>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mvpConfig.applyTeamBonusToStandings}
              onChange={(e) => handleUpdateMvpConfig({ applyTeamBonusToStandings: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 bg-[#141824] border-white/20 cursor-pointer"
            />
            <span className="text-slate-300">
              Apply +{mvpConfig.teamBonusPoints} MVP Grand Bonus into official Championship Standings total points at tournament conclusion
            </span>
          </label>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ⚡ MASTER QUICK MVP ASSIGNER (ALL 7 SPORTS)             */}
      {/* ======================================================== */}
      <div id="admin-mvp-assigner" className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Quick MVP Assigner (All Sports & Games)
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Rapidly pick the MVP for each Cricket Test, Stumble Guys game, Smash Karts TDMs, and all sub-games.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. Cricket Tests */}
          {state.matches.find((m) => m.gameKey === 'cricket')?.detailedScore?.type === 'cricket_series' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>🏏</span>
                  <span>Cricket Tests (Five-Match Series)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded">
                  +{mvpConfig.cricketGamePoints} pts per MVP
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(state.matches.find((m) => m.gameKey === 'cricket')!.detailedScore as any).data.tests.map((test: any) => (
                  <div key={test.id} className="p-3 bg-[#141824] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white block truncate">{test.title}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{test.venue} · {test.date}</span>
                    </div>

                    <select
                      value={test.mvpPlayerId || ''}
                      onChange={(e) => handleAssignMvp('m-cricket', test.id, e.target.value || null)}
                      className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs max-w-[160px] outline-none"
                    >
                      <option value="">No MVP</option>
                      {state.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamId === 'team1' ? state.teams.team1.shortName : state.teams.team2.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Smash Karts Games */}
          {state.matches.find((m) => m.gameKey === 'smash_karts')?.detailedScore?.type === 'smash_karts_series' && (
            <div className="space-y-2 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>🏎️</span>
                  <span>Smash Karts Games (TDMs & CTFs)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded">
                  TDM: +{mvpConfig.smashKartsTdmPoints} pts · CTF: +{mvpConfig.smashKartsCtfPoints} pts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(state.matches.find((m) => m.gameKey === 'smash_karts')!.detailedScore as any).data.games.map((g: any) => (
                  <div key={g.id} className="p-3 bg-[#141824] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">Game {g.gameNumber}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${g.type === 'TDM' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'}`}>
                          {g.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{g.arena || 'Arena'} · {g.team1Score}-{g.team2Score}</span>
                    </div>

                    <select
                      value={g.mvpPlayerId || ''}
                      onChange={(e) => handleAssignMvp('m-smash-karts', g.id, e.target.value || null)}
                      className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs max-w-[160px] outline-none"
                    >
                      <option value="">No MVP</option>
                      {state.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamId === 'team1' ? state.teams.team1.shortName : state.teams.team2.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Stumble Guys Games */}
          {state.matches.find((m) => m.gameKey === 'stumble_guys')?.detailedScore?.type === 'stumble_guys_series' && (
            <div className="space-y-2 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>🎮</span>
                  <span>Stumble Guys Games (5-Game Series)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded">
                  +{mvpConfig.stumbleGuysGamePoints} pt per MVP
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(state.matches.find((m) => m.gameKey === 'stumble_guys')!.detailedScore as any).data.games.map((g: any) => (
                  <div key={g.id} className="p-3 bg-[#141824] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white block">Game {g.gameNumber}: {g.mapName}</span>
                      <span className="text-[10px] text-slate-400 block truncate">Score: {g.team1Score}-{g.team2Score}</span>
                    </div>

                    <select
                      value={g.mvpPlayerId || ''}
                      onChange={(e) => handleAssignMvp('m-stumble-guys', g.id, e.target.value || null)}
                      className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs max-w-[160px] outline-none"
                    >
                      <option value="">No MVP</option>
                      {state.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamId === 'team1' ? state.teams.team1.shortName : state.teams.team2.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Basketball, Badminton, TT, Footvolley */}
          <div className="space-y-2 pt-3 border-t border-white/[0.04]">
            <span className="font-bold text-white block text-xs">
              ⚡ Additional Sports (Basketball, Badminton, Table Tennis, Footvolley)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Basketball Single Match MVP */}
              <div className="p-3 bg-[#141824] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-white block">🏀 Basketball (Race to 30)</span>
                  <span className="text-[10px] text-slate-400">+{mvpConfig.basketballGamePoints} pts</span>
                </div>
                <select
                  value={state.matches.find((m) => m.gameKey === 'basketball')?.mvpPlayerId || ''}
                  onChange={(e) => handleAssignMvp('m-basketball', 'main', e.target.value || null)}
                  className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs max-w-[160px] outline-none"
                >
                  <option value="">No MVP</option>
                  {state.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.teamId === 'team1' ? state.teams.team1.shortName : state.teams.team2.shortName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Badminton Games */}
              {state.matches.find((m) => m.gameKey === 'badminton')?.detailedScore?.type === 'badminton_series' &&
                (state.matches.find((m) => m.gameKey === 'badminton')!.detailedScore as any).data.games.map((g: any) => (
                  <div key={g.id} className="p-3 bg-[#141824] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white block">🏸 Badminton G{g.gameNumber} ({g.matchType})</span>
                      <span className="text-[10px] text-slate-400">+{mvpConfig.badmintonGamePoints} pts</span>
                    </div>
                    <select
                      value={g.mvpPlayerId || ''}
                      onChange={(e) => handleAssignMvp('m-badminton', g.id, e.target.value || null)}
                      className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs max-w-[160px] outline-none"
                    >
                      <option value="">No MVP</option>
                      {state.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamId === 'team1' ? state.teams.team1.shortName : state.teams.team2.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

              {/* Footvolley Games */}
              {state.matches.find((m) => m.gameKey === 'footvolley')?.detailedScore?.type === 'footvolley_series' &&
                (state.matches.find((m) => m.gameKey === 'footvolley')!.detailedScore as any).data.games.map((g: any) => (
                  <div key={g.id} className="p-3 bg-[#141824] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white block">🏐 Footvolley Game {g.gameNumber}</span>
                      <span className="text-[10px] text-slate-400">+{mvpConfig.footvolleyGamePoints} pts</span>
                    </div>
                    <select
                      value={g.mvpPlayerId || ''}
                      onChange={(e) => handleAssignMvp('m-footvolley', g.id, e.target.value || null)}
                      className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs max-w-[160px] outline-none"
                    >
                      <option value="">No MVP</option>
                      {state.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamId === 'team1' ? state.teams.team1.shortName : state.teams.team2.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

              {/* Table Tennis Games */}
              {state.matches.find((m) => m.gameKey === 'table_tennis')?.detailedScore?.type === 'table_tennis_series' &&
                (state.matches.find((m) => m.gameKey === 'table_tennis')!.detailedScore as any).data.games.map((g: any) => (
                  <div key={g.id} className="p-3 bg-[#141824] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white block">🏓 Table Tennis G{g.gameNumber} ({g.matchType})</span>
                      <span className="text-[10px] text-slate-400">+{mvpConfig.tableTennisGamePoints} pts</span>
                    </div>
                    <select
                      value={g.mvpPlayerId || ''}
                      onChange={(e) => handleAssignMvp('m-table-tennis', g.id, e.target.value || null)}
                      className="bg-[#0c0e15] border border-white/10 rounded px-2.5 py-1.5 text-white text-xs max-w-[160px] outline-none"
                    >
                      <option value="">No MVP</option>
                      {state.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.teamId === 'team1' ? state.teams.team1.shortName : state.teams.team2.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Players & Write-ups Manager */}
      <div className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contenders Roster & Write-ups
            </h3>
          </div>
          <button
            onClick={() => setShowAddPlayer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Player</span>
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {state.players.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-[#141824] border border-white/[0.04] rounded-xl text-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-white">{p.name}</span>
                  <select
                    value={p.teamId}
                    onChange={(e) => {
                      const updated = state.players.map((item) =>
                        item.id === p.id ? { ...item, teamId: e.target.value as any } : item
                      );
                      onUpdateState({ ...state, players: updated });
                    }}
                    className="bg-[#0c0e15] border border-white/10 rounded px-2 py-1 text-slate-300"
                  >
                    <option value="team1">Team 1</option>
                    <option value="team2">Team 2</option>
                  </select>
                </div>
                <button
                  onClick={() => handleDeletePlayer(p.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove player"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Role</label>
                  <input
                    type="text"
                    value={p.role}
                    onChange={(e) => {
                      const updated = state.players.map((item) =>
                        item.id === p.id ? { ...item, role: e.target.value } : item
                      );
                      onUpdateState({ ...state, players: updated });
                    }}
                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Key Game</label>
                  <input
                    type="text"
                    value={p.favoriteGame || ''}
                    onChange={(e) => {
                      const updated = state.players.map((item) =>
                        item.id === p.id ? { ...item, favoriteGame: e.target.value } : item
                      );
                      onUpdateState({ ...state, players: updated });
                    }}
                    className="w-full bg-[#0c0e15] border border-white/10 rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Player Write-up / Bio</label>
                <textarea
                  rows={2}
                  value={p.bio}
                  onChange={(e) => {
                    const updated = state.players.map((item) =>
                      item.id === p.id ? { ...item, bio: e.target.value } : item
                    );
                    onUpdateState({ ...state, players: updated });
                  }}
                  className="w-full bg-[#0c0e15] border border-white/10 rounded p-2.5 text-white leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e1216] border border-white/15 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-base text-white">Add New Contender</h3>
            <form onSubmit={handleAddPlayer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  required
                  className="w-full bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Team</label>
                  <select
                    value={newPlayerTeam}
                    onChange={(e) => setNewPlayerTeam(e.target.value as any)}
                    className="w-full bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="team1">Team 1</option>
                    <option value="team2">Team 2</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Role</label>
                  <input
                    type="text"
                    value={newPlayerRole}
                    onChange={(e) => setNewPlayerRole(e.target.value)}
                    className="w-full bg-[#141824] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Write-up / Bio</label>
                <textarea
                  rows={2}
                  value={newPlayerBio}
                  onChange={(e) => setNewPlayerBio(e.target.value)}
                  className="w-full bg-[#141824] border border-white/10 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayer(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold cursor-pointer"
                >
                  Add Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backup and Factory Reset */}
      <div className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold text-white block">Data Management</span>
          <span className="text-slate-400">Export JSON tournament state or reset to default fixtures.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => {
              setConfirmDialog({
                isOpen: true,
                title: 'Reset Tournament to Defaults?',
                message: 'This will restore all matches, scores, dates, and rosters to the initial default state. All custom edits will be cleared.',
                confirmLabel: 'Reset Everything',
                variant: 'danger',
                onConfirm: () => {
                  onResetToDefault();
                  showFlash('Reset complete.');
                },
              });
            }}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDialog?.isOpen)}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        confirmLabel={confirmDialog?.confirmLabel || 'Delete'}
        variant={confirmDialog?.variant || 'danger'}
        onConfirm={() => {
          if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog(null);
        }}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
};
