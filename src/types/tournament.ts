export type TierType = 'platinum' | 'gold' | 'silver';

export type GameKey =
  | 'cricket'
  | 'basketball'
  | 'stumble_guys'
  | 'table_tennis'
  | 'footvolley'
  | 'badminton'
  | 'smash_karts'
  | (string & {});

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface Player {
  id: string;
  name: string;
  teamId: 'team1' | 'team2';
  role: string;
  isCaptain?: boolean;
  avatarSeed?: string;
  bio: string;
  favoriteGame?: string;
}

export interface Team {
  id: 'team1' | 'team2';
  name: string;
  shortName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  captainId: string;
}

export interface MatchUpdate {
  id: string;
  timestamp: string;
  phase?: string;
  type: 'highlight' | 'score' | 'wicket' | 'goal' | 'round' | 'general';
  text: string;
  teamId?: 'team1' | 'team2' | 'neutral';
}

// 🏏 Cricket 5-Match Test Series
export interface TestMatchInnings {
  runs: number;
  wickets: number;
  overs?: string;
  declared?: boolean;
}

export interface CricketTestMatch {
  id: string;
  testNumber: number; // 1, 2, 3, 4, 5
  title: string;
  venue: string;
  date: string;
  status: MatchStatus;
  team1Innings1: TestMatchInnings;
  team2Innings1: TestMatchInnings;
  team1Innings2?: TestMatchInnings;
  team2Innings2?: TestMatchInnings;
  target?: number;
  winnerTeamId?: 'team1' | 'team2' | 'draw' | null;
  resultSummary?: string;
  scorecardImageUrl?: string; // external scorecard photo (e.g. CricHeroes)
  mvp?: string;
  mvpPlayerId?: string;
}

export interface DetailedCricketSeries {
  seriesName: string;
  totalTests: number; // 5
  tests: CricketTestMatch[];
  team1SeriesWins: number;
  team2SeriesWins: number;
  draws: number;
}

// 🏀 Basketball: One game, first to 30 wins
export interface BasketballPlayLog {
  id: string;
  teamId: 'team1' | 'team2';
  pointsAdded: number;
  newTotal: number;
  note: string;
  timestamp: string;
}

export interface DetailedBasketballRace30 {
  targetPoints: number; // 30
  team1Points: number;
  team2Points: number;
  winnerTeamId?: 'team1' | 'team2' | null;
  scoringLog: BasketballPlayLog[];
}

// 🏎️ Smash Karts: 7-Game series, first to 4 wins. Alternate TDM (4) and CTF (3)
export interface SmashKartsGame {
  id: string;
  gameNumber: number;
  type: 'TDM' | 'CTF';
  arena?: string;
  team1Score: number;
  team2Score: number;
  status: MatchStatus;
  winnerTeamId?: 'team1' | 'team2' | null;
  scorecardImageUrl?: string;
  mvpPlayerId?: string;
}

export interface DetailedSmashKartsSeries {
  totalGames: number; // 7
  targetWins: number; // 4
  team1SeriesWins: number;
  team2SeriesWins: number;
  games: SmashKartsGame[];
}

// 🏸 Badminton: 3-Game series, first to 2 wins (1st Singles, Doubles, 2nd Singles). Each game 3 sets: 11, 11, 21 pts
export interface BadmintonGame {
  id: string;
  gameNumber: number;
  matchType: '1st Singles' | 'Doubles' | '2nd Singles';
  status: MatchStatus;
  set1: { team1: number; team2: number };
  set2: { team1: number; team2: number };
  set3: { team1: number; team2: number };
  team1SetsWon: number;
  team2SetsWon: number;
  winnerTeamId?: 'team1' | 'team2' | null;
  scorecardImageUrl?: string;
  mvpPlayerId?: string;
}

export interface DetailedBadmintonSeries {
  totalGames: number; // 3
  targetWins: number; // 2
  team1SeriesWins: number;
  team2SeriesWins: number;
  games: BadmintonGame[];
}

// 🏐 Footvolley: 3-Game series, 25 points each, first to 2 wins
export interface FootvolleyGame {
  id: string;
  gameNumber: number;
  status: MatchStatus;
  targetPoints: number; // 25
  team1Score: number;
  team2Score: number;
  winnerTeamId?: 'team1' | 'team2' | null;
  scorecardImageUrl?: string;
  mvpPlayerId?: string;
}

export interface DetailedFootvolleySeries {
  totalGames: number; // 3
  targetWins: number; // 2
  team1SeriesWins: number;
  team2SeriesWins: number;
  games: FootvolleyGame[];
}

// 🎮 Stumble Guys: 5-Game Series, first to 3 wins
export interface StumbleGuysGame {
  id: string;
  gameNumber: number; // 1 to 5
  mapName: string;
  team1Score: number;
  team2Score: number;
  status: MatchStatus;
  winnerTeamId?: 'team1' | 'team2' | null;
  scorecardImageUrl?: string;
  mvpPlayerId?: string;
}

export interface DetailedStumbleGuysSeries {
  totalGames: number; // 5
  targetWins: number; // 3
  team1SeriesWins: number;
  team2SeriesWins: number;
  games: StumbleGuysGame[];
}

export interface DetailedStumbleGuysScore {
  rounds: {
    roundNumber: number;
    mapName: string;
    team1Qualifiers: number;
    team2Qualifiers: number;
    winnerTeamId?: 'team1' | 'team2';
  }[];
  crownWinner?: string;
}

// 🏓 Table Tennis: 3-Game Series (1st Singles, Doubles, 2nd Singles), Sets to 21 points, first to 2 wins
export interface TableTennisGame {
  id: string;
  gameNumber: number; // 1, 2, 3
  matchType: '1st Singles' | 'Doubles' | '2nd Singles';
  status: MatchStatus;
  set1: { team1: number; team2: number };
  set2: { team1: number; team2: number };
  set3: { team1: number; team2: number };
  team1SetsWon: number;
  team2SetsWon: number;
  winnerTeamId?: 'team1' | 'team2' | null;
  scorecardImageUrl?: string;
  mvpPlayerId?: string;
}

export interface DetailedTableTennisSeries {
  totalGames: number; // 3
  targetWins: number; // 2
  team1SeriesWins: number;
  team2SeriesWins: number;
  games: TableTennisGame[];
}

export interface DetailedSetScore {
  sets: {
    setNumber: number;
    team1: number;
    team2: number;
  }[];
  currentSet: number;
  bestOf: number;
}

export type SportSpecificScores =
  | { type: 'cricket_series'; data: DetailedCricketSeries }
  | { type: 'basketball_race30'; data: DetailedBasketballRace30 }
  | { type: 'smash_karts_series'; data: DetailedSmashKartsSeries }
  | { type: 'badminton_series'; data: DetailedBadmintonSeries }
  | { type: 'footvolley_series'; data: DetailedFootvolleySeries }
  | { type: 'table_tennis_series'; data: DetailedTableTennisSeries }
  | { type: 'stumble_guys_series'; data: DetailedStumbleGuysSeries }
  | { type: 'stumble_guys'; data: DetailedStumbleGuysScore }
  | { type: 'sets'; data: DetailedSetScore };

export interface Match {
  id: string;
  gameKey: GameKey;
  gameName: string;
  subtitleTag: string;
  emoji: string;
  tier: TierType;
  basePoints: number;
  consolationPoints: number;
  scheduledTime: string;
  scheduledDate?: string; // YYYY-MM-DD or parseable date string for chronological ordering
  venueOrPlatform: string;
  status: MatchStatus;
  winnerTeamId?: 'team1' | 'team2' | null;
  team1ScoreDisplay?: string;
  team2ScoreDisplay?: string;
  team1PointsAwarded?: number;
  team2PointsAwarded?: number;
  mvpPlayerName?: string;
  mvpPlayerId?: string;
  matchNotes?: string;
  updates: MatchUpdate[];
  detailedScore?: SportSpecificScores;
}

export interface MvpPointConfig {
  cricketGamePoints: number; // default: 3
  stumbleGuysGamePoints: number; // default: 1
  smashKartsTdmPoints: number; // default: 2
  smashKartsCtfPoints: number; // default: 2
  basketballGamePoints: number; // default: 3
  tableTennisGamePoints: number; // default: 2
  badmintonGamePoints: number; // default: 2
  footvolleyGamePoints: number; // default: 2
  teamBonusPoints: number; // default: 6
  applyTeamBonusToStandings: boolean; // default: true
}

export interface MvpAwardItem {
  id: string;
  playerId: string;
  playerName: string;
  teamId: 'team1' | 'team2';
  matchId: string;
  gameKey: GameKey;
  gameName: string;
  gameEmoji: string;
  gameDetailTitle: string;
  subGameIdentifier: string;
  date: string;
  points: number;
  resultSummary?: string;
}

export interface CountdownConfig {
  targetDate: string; // ISO date-time string e.g. 2026-10-11T17:00:00
  title: string;      // e.g. 'LIVE IN'
  subtitle?: string;  // e.g. 'Tentative · 11th October, 5:00 PM'
  enabled: boolean;
}

export interface TournamentState {
  tournamentTitle: string;
  subtitle: string;
  teams: {
    team1: Team;
    team2: Team;
  };
  players: Player[];
  matches: Match[];
  mvpConfig?: MvpPointConfig;
  countdownConfig?: CountdownConfig;
  isTournamentConcluded?: boolean;
}
