import React from 'react';
import { TournamentState } from '../types/tournament';
import { TournamentCalculations } from '../utils/storage';
import { Trophy, Crown, Sparkles, Shield } from 'lucide-react';

interface MichskyStandingsProps {
  state: TournamentState;
  stats: TournamentCalculations;
}

export const MichskyStandings: React.FC<MichskyStandingsProps> = ({
  state,
  stats,
}) => {
  const team1 = state.teams.team1;
  const team2 = state.teams.team2;

  let t1ConsolationPts = 0;
  let t2ConsolationPts = 0;
  const t1TierWins = { platinum: 0, gold: 0, silver: 0 };
  const t2TierWins = { platinum: 0, gold: 0, silver: 0 };

  state.matches.forEach((m) => {
    if (m.status === 'completed') {
      if (m.winnerTeamId === 'team1') {
        if (m.tier in t1TierWins) t1TierWins[m.tier]++;
        t2ConsolationPts += m.team2PointsAwarded ?? m.consolationPoints;
      } else if (m.winnerTeamId === 'team2') {
        if (m.tier in t2TierWins) t2TierWins[m.tier]++;
        t1ConsolationPts += m.team1PointsAwarded ?? m.consolationPoints;
      }
    }
  });

  const isT1Leader = stats.team1TotalPoints > stats.team2TotalPoints;
  const isT2Leader = stats.team2TotalPoints > stats.team1TotalPoints;
  const isTied = stats.team1TotalPoints === stats.team2TotalPoints;

  const teamRows = [
    {
      team: team1,
      wins: stats.team1Wins,
      played: stats.completedMatchesCount,
      losses: stats.completedMatchesCount - stats.team1Wins,
      tierWins: t1TierWins,
      consolation: t1ConsolationPts,
      basePts: stats.team1BaseMatchPoints,
      mvpBonus: stats.team1MvpBonus,
      totalPts: stats.team1TotalPoints,
      isLeader: isT1Leader,
      color: 'red',
      colorBg: 'bg-red-500',
      colorShadow: 'shadow-[0_0_8px_#ef4444]',
      colorText: 'text-red-400',
      tagText: 'Red Contenders · Capt: Shivansh',
      rank: isT1Leader ? 1 : isTied ? 1 : 2,
    },
    {
      team: team2,
      wins: stats.team2Wins,
      played: stats.completedMatchesCount,
      losses: stats.completedMatchesCount - stats.team2Wins,
      tierWins: t2TierWins,
      consolation: t2ConsolationPts,
      basePts: stats.team2BaseMatchPoints,
      mvpBonus: stats.team2MvpBonus,
      totalPts: stats.team2TotalPoints,
      isLeader: isT2Leader,
      color: 'sky',
      colorBg: 'bg-sky-500',
      colorShadow: 'shadow-[0_0_8px_#0ea5e9]',
      colorText: 'text-sky-400',
      tagText: 'Blue Challengers · Capt: John',
      rank: isT2Leader ? 1 : isTied ? 1 : 2,
    },
  ];

  // Sort by rank / points descending
  if (isT2Leader) {
    teamRows.reverse();
  }

  return (
    <section
      id="section-standings"
      className="relative py-28 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.06] overflow-hidden"
    >
      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-red-600/[0.04] blur-[120px] pointer-events-none -z-10 fire-aura-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-sky-600/[0.04] blur-[120px] pointer-events-none -z-10" />

      {/* Header with Luxury Championship Styling */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse fill-amber-400/30" />
          <span>Official Championship Leaderboard</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase select-none flex items-center gap-3">
          <span>STANDINGS</span>
          <span className="hidden sm:inline-block w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-ping" />
        </h2>
      </div>

      {/* Main Luxury Points Table Container */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-red-500/30 via-white/15 to-sky-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_60px_rgba(255,100,0,0.06)] overflow-hidden">
        <div className="bg-[#0b0e15]/95 backdrop-blur-xl rounded-[23px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#121622]/90 text-slate-400 font-semibold uppercase text-[11px] tracking-wider select-none">
                  <th className="py-4 sm:py-5 px-5">Rank & Team</th>
                  <th className="py-4 sm:py-5 px-3 text-center">Played</th>
                  <th className="py-4 sm:py-5 px-3 text-center text-emerald-400 font-bold">Wins</th>
                  <th className="py-4 sm:py-5 px-3 text-center">Losses</th>
                  <th className="py-4 sm:py-5 px-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                      <span>Platinum</span>
                    </span>
                  </th>
                  <th className="py-4 sm:py-5 px-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-amber-300">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gold</span>
                    </span>
                  </th>
                  <th className="py-4 sm:py-5 px-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <Shield className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Silver</span>
                    </span>
                  </th>
                  <th className="py-4 sm:py-5 px-3 text-center text-amber-300">Consolation</th>
                  <th className="py-4 sm:py-5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                      <Crown className="w-3.5 h-3.5" />
                      <span>MVP Bonus</span>
                    </span>
                  </th>
                  <th className="py-4 sm:py-5 px-5 text-right font-black tracking-widest text-white">
                    Total PTS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {teamRows.map((row) => (
                  <tr
                    key={row.team.id}
                    className={`transition-all duration-300 group ${
                      row.isLeader
                        ? row.color === 'red'
                          ? 'bg-red-500/[0.04] hover:bg-red-500/[0.08]'
                          : 'bg-sky-500/[0.04] hover:bg-sky-500/[0.08]'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <td className="py-5 sm:py-6 px-5">
                      <div className="flex items-center gap-3.5">
                        {/* Rank Badge */}
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-md ${
                            row.rank === 1
                              ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {row.rank === 1 ? <Crown className="w-4 h-4 fill-black" /> : `#${row.rank}`}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${row.colorBg} ${row.colorShadow}`} />
                            <span className={`font-bold text-base sm:text-lg text-white block tracking-wide group-hover:${row.colorText} transition-colors`}>
                              {row.team.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-light pl-4.5 block mt-0.5">
                            {row.tagText}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 sm:py-6 px-3 text-center text-slate-300 font-medium">
                      {row.played}
                    </td>

                    <td className="py-5 sm:py-6 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm">
                        {row.wins}
                      </span>
                    </td>

                    <td className="py-5 sm:py-6 px-3 text-center text-slate-400 font-light">
                      {row.losses}
                    </td>

                    {/* Platinum Wins */}
                    <td className="py-5 sm:py-6 px-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/20 text-white font-bold text-xs sm:text-sm shadow-sm">
                        {row.tierWins.platinum}
                      </span>
                    </td>

                    {/* Gold Wins */}
                    <td className="py-5 sm:py-6 px-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm shadow-sm">
                        {row.tierWins.gold}
                      </span>
                    </td>

                    {/* Silver Wins */}
                    <td className="py-5 sm:py-6 px-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md bg-slate-400/15 border border-slate-400/30 text-slate-200 font-bold text-xs sm:text-sm shadow-sm">
                        {row.tierWins.silver}
                      </span>
                    </td>

                    <td className="py-5 sm:py-6 px-3 text-center font-semibold text-amber-400">
                      +{row.consolation}
                    </td>

                    {/* MVP Bonus Column */}
                    <td className="py-5 sm:py-6 px-3 text-center">
                      {stats.isTournamentConcluded ? (
                        row.mvpBonus > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span>+{row.mvpBonus} PTS</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )
                      ) : (
                        row.team.id === stats.projectedMvpWinnerTeamId ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] font-medium"
                            title="Pending: Added once at the end of Garam Prix"
                          >
                            <Crown className="w-3 h-3 text-amber-400/80" />
                            <span>Projected +{stats.projectedBonusPoints}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )
                      )}
                    </td>

                    <td className="py-5 sm:py-6 px-5 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span
                          className={`text-3xl sm:text-4xl lg:text-5xl font-light ${row.colorText} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] select-none`}
                        >
                          {row.totalPts}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {row.mvpBonus > 0 && (
                            <span className="text-[9px] text-amber-400 font-medium">
                              ({row.basePts} + {row.mvpBonus} MVP)
                            </span>
                          )}
                          {row.isLeader && (
                            <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                              LEADER
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer MVP Note */}
          <div className="p-4 bg-[#0a0d14] border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                MVP points get added at the end of Garam Prix, only once.
                {stats.isTournamentConcluded ? ' (Tournament concluded · Bonus officially awarded)' : ' (Currently in progress · Bonus pending)'}
              </span>
            </div>
            <a
              href="#section-mvp"
              className="text-amber-300 hover:text-white font-medium transition-colors shrink-0 flex items-center gap-1"
            >
              <span>Inspect MVP Leaderboard</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
