import { TournamentState, CountdownConfig } from '../types/tournament';
import { INITIAL_TOURNAMENT_DATA } from '../data/initialTournamentData';
import { recalculateMatchOutcome } from './seriesCalculations';
import { getTeamMvpSummary, DEFAULT_MVP_CONFIG } from './mvpCalculations';

const STORAGE_KEY = 'garam_prix_gp_state_v5';

export const DEFAULT_COUNTDOWN_CONFIG: CountdownConfig = {
  targetDate: '2026-10-11T17:00:00',
  title: 'LIVE IN',
  subtitle: 'Tentative · 11th October, 5:00 PM',
  enabled: true,
};

export function loadTournamentState(): TournamentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TOURNAMENT_DATA;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.teams || !parsed.matches) {
      return INITIAL_TOURNAMENT_DATA;
    }
    // Normalize and recalculate every match so series points and standings are always synced
    const normalizedMatches = parsed.matches.map((m: any) => recalculateMatchOutcome(m));
    return {
      ...parsed,
      mvpConfig: parsed.mvpConfig || DEFAULT_MVP_CONFIG,
      countdownConfig: parsed.countdownConfig || DEFAULT_COUNTDOWN_CONFIG,
      matches: normalizedMatches,
    };
  } catch (err) {
    console.warn('Failed to parse saved tournament data, using defaults:', err);
    return INITIAL_TOURNAMENT_DATA;
  }
}

export function saveTournamentState(state: TournamentState): void {
  try {
    const normalizedState = {
      ...state,
      matches: state.matches.map((m) => recalculateMatchOutcome(m)),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
  } catch (err) {
    console.error('Failed to save tournament data:', err);
  }
}

export function resetTournamentState(): TournamentState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  return INITIAL_TOURNAMENT_DATA;
}

export interface TournamentCalculations {
  team1TotalPoints: number;
  team2TotalPoints: number;
  team1BaseMatchPoints: number;
  team2BaseMatchPoints: number;
  team1MvpBonus: number;
  team2MvpBonus: number;
  mvpBonusWinnerTeamId: 'team1' | 'team2' | null;
  projectedMvpWinnerTeamId: 'team1' | 'team2' | null;
  projectedBonusPoints: number;
  isTournamentConcluded: boolean;
  mvpBonusAwarded: boolean;
  team1Wins: number;
  team2Wins: number;
  completedMatchesCount: number;
  liveMatchesCount: number;
  upcomingMatchesCount: number;
  totalMatchesCount: number;
  leaderTeamId: 'team1' | 'team2' | 'tied';
  pointGap: number;
  maxPointsPossible: number;
  team1TierPoints: { platinum: number; gold: number; silver: number };
  team2TierPoints: { platinum: number; gold: number; silver: number };
  team1TierWins: { platinum: number; gold: number; silver: number };
  team2TierWins: { platinum: number; gold: number; silver: number };
}

export function calculateTournamentStats(state: TournamentState): TournamentCalculations {
  let team1BaseMatchPoints = 0;
  let team2BaseMatchPoints = 0;
  let team1Wins = 0;
  let team2Wins = 0;
  let completedMatchesCount = 0;
  let liveMatchesCount = 0;
  let upcomingMatchesCount = 0;

  const team1TierPoints = { platinum: 0, gold: 0, silver: 0 };
  const team2TierPoints = { platinum: 0, gold: 0, silver: 0 };
  const team1TierWins = { platinum: 0, gold: 0, silver: 0 };
  const team2TierWins = { platinum: 0, gold: 0, silver: 0 };

  let maxPointsPossible = 0;

  for (const m of state.matches) {
    maxPointsPossible += m.basePoints;

    if (m.status === 'completed') {
      completedMatchesCount++;
      const t1Pts = m.team1PointsAwarded ?? (m.winnerTeamId === 'team1' ? m.basePoints : m.consolationPoints);
      const t2Pts = m.team2PointsAwarded ?? (m.winnerTeamId === 'team2' ? m.basePoints : m.consolationPoints);

      team1BaseMatchPoints += t1Pts;
      team2BaseMatchPoints += t2Pts;

      if (m.tier in team1TierPoints) {
        team1TierPoints[m.tier] += t1Pts;
        team2TierPoints[m.tier] += t2Pts;
      }

      if (m.winnerTeamId === 'team1') {
        team1Wins++;
        if (m.tier in team1TierWins) {
          team1TierWins[m.tier]++;
        }
      } else if (m.winnerTeamId === 'team2') {
        team2Wins++;
        if (m.tier in team2TierWins) {
          team2TierWins[m.tier]++;
        }
      }
    } else if (m.status === 'live') {
      liveMatchesCount++;
    } else {
      upcomingMatchesCount++;
    }
  }

  // The entire Garam Prix concludes either when all matches are completed or marked concluded
  const isTournamentConcluded = Boolean(
    state.isTournamentConcluded ||
      (state.matches.length > 0 && state.matches.every((m) => m.status === 'completed'))
  );

  // Calculate MVP summary and projected leader
  const mvpSummary = getTeamMvpSummary(state);
  const projectedMvpWinnerTeamId = mvpSummary.bonusWinnerTeamId;
  const projectedBonusPoints = mvpSummary.bonusPoints;

  // RULE: MVP bonus points get added AT THE END OF GARAM PRIX, ONLY ONCE
  let team1MvpBonus = 0;
  let team2MvpBonus = 0;
  let mvpBonusWinnerTeamId: 'team1' | 'team2' | null = null;
  let mvpBonusAwarded = false;

  const mvpConfig = state.mvpConfig || DEFAULT_MVP_CONFIG;
  if (isTournamentConcluded && mvpConfig.applyTeamBonusToStandings !== false) {
    mvpBonusWinnerTeamId = projectedMvpWinnerTeamId;
    mvpBonusAwarded = true;
    if (mvpBonusWinnerTeamId === 'team1') {
      team1MvpBonus = projectedBonusPoints;
    } else if (mvpBonusWinnerTeamId === 'team2') {
      team2MvpBonus = projectedBonusPoints;
    }
  }

  const team1TotalPoints = team1BaseMatchPoints + team1MvpBonus;
  const team2TotalPoints = team2BaseMatchPoints + team2MvpBonus;

  let leaderTeamId: 'team1' | 'team2' | 'tied' = 'tied';
  if (team1TotalPoints > team2TotalPoints) leaderTeamId = 'team1';
  else if (team2TotalPoints > team1TotalPoints) leaderTeamId = 'team2';

  const pointGap = Math.abs(team1TotalPoints - team2TotalPoints);

  return {
    team1TotalPoints,
    team2TotalPoints,
    team1BaseMatchPoints,
    team2BaseMatchPoints,
    team1MvpBonus,
    team2MvpBonus,
    mvpBonusWinnerTeamId,
    projectedMvpWinnerTeamId,
    projectedBonusPoints,
    isTournamentConcluded,
    mvpBonusAwarded,
    team1Wins,
    team2Wins,
    completedMatchesCount,
    liveMatchesCount,
    upcomingMatchesCount,
    totalMatchesCount: state.matches.length,
    leaderTeamId,
    pointGap,
    maxPointsPossible,
    team1TierPoints,
    team2TierPoints,
    team1TierWins,
    team2TierWins,
  };
}
