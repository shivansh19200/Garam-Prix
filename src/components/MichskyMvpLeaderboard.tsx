import React, { useState } from 'react';
import { TournamentState } from '../types/tournament';
import {
  getPlayerMvpLeaderboard,
  getTeamMvpSummary,
  PlayerMvpStats,
  DEFAULT_MVP_CONFIG,
} from '../utils/mvpCalculations';
import {
  Award,
  Crown,
  Medal,
  ChevronRight,
  X,
  Layers,
  Settings,
} from 'lucide-react';
import { WindReveal } from './WindReveal';

interface MichskyMvpLeaderboardProps {
  state: TournamentState;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export const MichskyMvpLeaderboard: React.FC<MichskyMvpLeaderboardProps> = ({
  state,
  isAdmin = false,
  onOpenAdminPanel,
}) => {
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<PlayerMvpStats | null>(null);

  const leaderboard = getPlayerMvpLeaderboard(state);
  const teamMvp = getTeamMvpSummary(state);
  const config = state.mvpConfig || DEFAULT_MVP_CONFIG;

  const top3 = leaderboard.slice(0, 3);
  const totalMvpPointsInTournament = teamMvp.team1MvpPoints + teamMvp.team2MvpPoints;
  const team1Pct =
    totalMvpPointsInTournament > 0
      ? Math.round((teamMvp.team1MvpPoints / totalMvpPointsInTournament) * 100)
      : 50;
  const team2Pct = 100 - team1Pct;

  const winningTeam =
    teamMvp.bonusWinnerTeamId === 'team1'
      ? state.teams.team1
      : teamMvp.bonusWinnerTeamId === 'team2'
      ? state.teams.team2
      : null;

  return (
    <section
      id="section-mvp"
      className="relative py-28 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.06] overflow-hidden"
    >
      {/* Subtle wind streak animation */}
      <div className="wind-streak" />

      {/* Background glow ambiance */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/[0.03] blur-[150px] pointer-events-none -z-10" />

      {/* Clean, Non-bloated Header */}
      <WindReveal direction="wind-left" className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase font-bold text-amber-400 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>HONORS</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase select-none flex items-center gap-3">
              <span>MVP LEADERBOARD</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
            </h2>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all self-start md:self-auto cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure MVP Rules</span>
            </button>
          )}
        </div>
      </WindReveal>

      {/* Team MVP Duel Progress Bar (Concise, no wordy explanations) */}
      <WindReveal direction="up" delay={0.1} className="mb-12">
        <div className="p-6 bg-[#0b0e15] border border-white/[0.08] rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">
                  {state.teams.team1.name}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-400">
                  {teamMvp.team1MvpPoints} <span className="text-xs font-medium text-slate-400">MVP PTS</span>
                </span>
              </div>
            </div>

            {/* Center Status */}
            <div className="text-center px-4 py-1 rounded-full bg-white/[0.04] border border-white/10 hidden sm:block">
              {winningTeam ? (
                <span className="text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                  <span>
                    {winningTeam.name} leads (+{teamMvp.leaderGap}) · Projected +{config.teamBonusPoints} Team Bonus
                  </span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-300">
                  Tied at {teamMvp.team1MvpPoints} MVP pts
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">
                  {state.teams.team2.name}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-sky-400">
                  {teamMvp.team2MvpPoints} <span className="text-xs font-medium text-slate-400">MVP PTS</span>
                </span>
              </div>
              <div className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" />
            </div>
          </div>

          {/* Dual Progress Bar */}
          <div className="h-2.5 w-full bg-[#141824] rounded-full overflow-hidden flex p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-l-full transition-all duration-700 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
              style={{ width: `${totalMvpPointsInTournament === 0 ? 50 : team1Pct}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-r-full transition-all duration-700 shadow-[0_0_12px_rgba(14,165,233,0.5)]"
              style={{ width: `${totalMvpPointsInTournament === 0 ? 50 : team2Pct}%` }}
            />
          </div>
        </div>
      </WindReveal>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {top3.map((entry, idx) => {
          const isGold = idx === 0;
          const isSilver = idx === 1;

          const team = entry.player.teamId === 'team1' ? state.teams.team1 : state.teams.team2;
          const isTeam1 = entry.player.teamId === 'team1';

          return (
            <WindReveal
              key={entry.player.id}
              direction="wind-left"
              delay={0.1 + idx * 0.12}
            >
              <div
                onClick={() => setSelectedPlayerStats(entry)}
                className={`relative bg-[#0c1017] border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group shadow-xl ${
                  isGold
                    ? 'border-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.2)] md:-translate-y-2'
                    : isSilver
                    ? 'border-slate-300/40 shadow-[0_0_25px_rgba(255,255,255,0.1)]'
                    : 'border-amber-700/40 shadow-[0_0_20px_rgba(180,83,9,0.15)]'
                }`}
              >
                {/* Podium Rank Pin */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-md ${
                      isGold
                        ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                        : isSilver
                        ? 'bg-slate-200 text-slate-900 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                        : 'bg-amber-700 text-white shadow-[0_0_10px_rgba(180,83,9,0.3)]'
                    }`}
                  >
                    {isGold ? <Crown className="w-5 h-5 fill-black" /> : `#${idx + 1}`}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      isTeam1
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    {team.name}
                  </span>
                </div>

                {/* Contender Name & Role */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <span>{entry.player.name}</span>
                    {entry.player.isCaptain && (
                      <span className="text-[10px] text-amber-400 font-extrabold bg-amber-400/10 px-1.5 py-0.5 rounded">
                        CPT
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-slate-400 font-light block mt-0.5">
                    {entry.player.role}
                  </span>
                </div>

                {/* Points Metric */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-medium">
                      Points
                    </span>
                    <span className="text-3xl font-black text-white group-hover:text-amber-300 transition-colors">
                      {entry.totalPoints}{' '}
                      <span className="text-xs font-normal text-slate-400">PTS</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-medium">
                      Honors
                    </span>
                    <span className="text-sm font-bold text-slate-300">
                      {entry.awardsCount}
                    </span>
                  </div>
                </div>

                {/* View Games Prompt */}
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400 group-hover:text-white transition-colors">
                  <span>View games ({entry.awardsCount})</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </WindReveal>
          );
        })}
      </div>

      {/* Full 8-Man Roster Standings Table */}
      <WindReveal direction="up" delay={0.25}>
        <div className="rounded-3xl bg-[#0b0e15] border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Medal className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wider">
                Contender Rankings
              </h3>
            </div>
            <span className="text-xs text-slate-400">Click to view match awards</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#121622]/60 text-slate-400 font-semibold uppercase text-[11px] tracking-wider select-none">
                  <th className="py-4 px-5">Rank & Contender</th>
                  <th className="py-4 px-3 text-center">Team</th>
                  <th className="py-4 px-3 text-center">Honors</th>
                  <th className="py-4 px-3 text-center">Sports</th>
                  <th className="py-4 px-5 text-right font-black tracking-wider text-white">
                    MVP Points
                  </th>
                  <th className="py-4 px-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {leaderboard.map((entry) => {
                  const isTeam1 = entry.player.teamId === 'team1';
                  const team = isTeam1 ? state.teams.team1 : state.teams.team2;

                  return (
                    <tr
                      key={entry.player.id}
                      onClick={() => setSelectedPlayerStats(entry)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              entry.rank === 1
                                ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                : entry.rank === 2
                                ? 'bg-slate-200 text-black'
                                : entry.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {entry.rank === 1 ? <Crown className="w-4 h-4 fill-black" /> : `#${entry.rank}`}
                          </span>

                          <div>
                            <span className="font-bold text-white group-hover:text-amber-300 transition-colors block">
                              {entry.player.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-light block">
                              {entry.player.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isTeam1
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {team.shortName}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-200">
                          <span>{entry.awardsCount}</span>
                          <Award className="w-3.5 h-3.5 text-amber-400/80" />
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {Object.keys(entry.sportBreakdown).length === 0 ? (
                            <span className="text-slate-500 text-[11px]">—</span>
                          ) : (
                            Object.entries(entry.sportBreakdown).map(([sport, info]) => (
                              <span
                                key={sport}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300 capitalize"
                              >
                                {sport.replace('_', ' ')} ({info.count})
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right font-black text-lg text-white group-hover:text-amber-300 transition-colors">
                        {entry.totalPoints}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 group-hover:text-white transition-colors"
                          title="View award details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </WindReveal>

      {/* Player MVP Inspection Modal */}
      {selectedPlayerStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c1017] border border-white/15 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black shadow-lg ${
                    selectedPlayerStats.rank === 1
                      ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  #{selectedPlayerStats.rank}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{selectedPlayerStats.player.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        selectedPlayerStats.player.teamId === 'team1'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      }`}
                    >
                      {selectedPlayerStats.player.teamId === 'team1'
                        ? state.teams.team1.name
                        : state.teams.team2.name}
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400 font-light">
                    {selectedPlayerStats.player.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlayerStats(null)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 p-6 pb-2">
              <div className="p-4 bg-[#141824] rounded-2xl border border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-medium">
                  MVP Points
                </span>
                <span className="text-3xl font-black text-amber-300 mt-1 block">
                  {selectedPlayerStats.totalPoints}{' '}
                  <span className="text-xs font-normal text-slate-400">PTS</span>
                </span>
              </div>

              <div className="p-4 bg-[#141824] rounded-2xl border border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-medium">
                  Awards
                </span>
                <span className="text-3xl font-black text-white mt-1 block">
                  {selectedPlayerStats.awardsCount}
                </span>
              </div>
            </div>

            {/* Games List (Where this player won MVP) */}
            <div className="p-6 pt-2 overflow-y-auto flex-1 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Awarded Games ({selectedPlayerStats.awards.length})</span>
              </h4>

              {selectedPlayerStats.awards.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-[#121622]/40 rounded-2xl border border-white/5 space-y-2">
                  <Award className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">No MVP honors registered yet for this contender.</p>
                </div>
              ) : (
                selectedPlayerStats.awards.map((award) => (
                  <div
                    key={award.id}
                    className="p-4 bg-[#121622] border border-white/[0.06] rounded-2xl flex items-center justify-between gap-4 transition-colors hover:border-amber-400/30"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{award.gameEmoji}</span>
                        <span className="font-bold text-sm text-white truncate">
                          {award.gameName}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          {award.date}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium pl-7">
                        {award.gameDetailTitle}
                      </p>

                      {award.resultSummary && (
                        <p className="text-[11px] text-emerald-400 pl-7 font-light">
                          Outcome: {award.resultSummary}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs sm:text-sm">
                        +{award.points} PTS
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#0a0a0a] flex items-center justify-end text-xs text-slate-400">
              <button
                onClick={() => setSelectedPlayerStats(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
