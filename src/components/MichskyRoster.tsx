import React from 'react';
import { TournamentState } from '../types/tournament';
import { Crown } from 'lucide-react';

interface MichskyRosterProps {
  state: TournamentState;
}

export const MichskyRoster: React.FC<MichskyRosterProps> = ({ state }) => {
  const team1 = state.teams.team1;
  const team2 = state.teams.team2;

  const team1Players = state.players.filter((p) => p.teamId === 'team1');
  const team2Players = state.players.filter((p) => p.teamId === 'team2');

  return (
    <section
      id="section-roster"
      className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.04]"
    >
      <div className="mb-10">
        <h2 className="text-4xl sm:text-5xl font-light text-white tracking-tight uppercase">
          Roster
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team 1 */}
        <div className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <div>
                <h3 className="font-semibold text-lg text-white">{team1.name}</h3>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              4 Players
            </span>
          </div>

          <div className="space-y-3">
            {team1Players.map((player) => (
              <div
                key={player.id}
                className="p-4 bg-[#141824] border border-white/[0.04] rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-white flex items-center gap-2">
                    <span>{player.name}</span>
                    {player.isCaptain && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
                        <Crown className="w-3 h-3 fill-amber-400" /> Capt
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                    {player.role}
                  </span>
                </div>

                {player.favoriteGame && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Specialty:</span>
                    <span className="text-slate-300 font-medium">{player.favoriteGame}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 */}
        <div className="bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <div>
                <h3 className="font-semibold text-lg text-white">{team2.name}</h3>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              4 Players
            </span>
          </div>

          <div className="space-y-3">
            {team2Players.map((player) => (
              <div
                key={player.id}
                className="p-4 bg-[#141824] border border-white/[0.04] rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-white flex items-center gap-2">
                    <span>{player.name}</span>
                    {player.isCaptain && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
                        <Crown className="w-3 h-3 fill-amber-400" /> Capt
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                    {player.role}
                  </span>
                </div>

                {player.favoriteGame && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] uppercase">Specialty:</span>
                    <span className="text-slate-300 font-medium">{player.favoriteGame}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
