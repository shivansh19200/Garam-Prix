import React from 'react';
import { TournamentState } from '../types/tournament';
import { TournamentCalculations } from '../utils/storage';
import { ChevronDown, Flame } from 'lucide-react';
import { WindReveal } from './WindReveal';
import { GaramPrixCountdown } from './GaramPrixCountdown';

interface MichskyHeroProps {
  state: TournamentState;
  stats: TournamentCalculations;
  isAdmin?: boolean;
  onOpenAdminSchedule?: () => void;
}

export const MichskyHero: React.FC<MichskyHeroProps> = ({
  state,
  stats,
  isAdmin = false,
  onOpenAdminSchedule,
}) => {
  const team1 = state.teams.team1;
  const team2 = state.teams.team2;

  const totalPoints = stats.team1TotalPoints + stats.team2TotalPoints;
  const t1Percent = totalPoints === 0 ? 50 : Math.round((stats.team1TotalPoints / totalPoints) * 100);
  const t2Percent = 100 - t1Percent;

  const scrollToBattlefield = () => {
    const el = document.getElementById('section-projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="masthead"
      className="relative min-h-[85vh] flex flex-col justify-between pt-28 pb-12 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden"
    >
      <div />

      {/* Main Hero */}
      <div className="relative text-center space-y-6 my-auto pt-6">
        {/* Ambient Fire Aura Glow in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] lg:w-[850px] h-[220px] sm:h-[350px] bg-gradient-to-t from-red-600/25 via-amber-500/18 to-transparent blur-[70px] pointer-events-none rounded-full fire-aura-glow -z-10" />

        {/* Floating Ember Particles */}
        <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
          <span className="absolute left-[15%] bottom-[20%] w-1.5 h-1.5 rounded-full bg-amber-400 ember-particle shadow-[0_0_8px_#ff9500]" style={{ animationDelay: '0.2s', animationDuration: '3.2s' }} />
          <span className="absolute left-[28%] bottom-[30%] w-2 h-2 rounded-full bg-orange-400 ember-particle shadow-[0_0_10px_#ff5500]" style={{ animationDelay: '1.1s', animationDuration: '2.8s' }} />
          <span className="absolute left-[45%] bottom-[15%] w-1.5 h-1.5 rounded-full bg-red-400 ember-particle shadow-[0_0_8px_#ff2200]" style={{ animationDelay: '0.7s', animationDuration: '3.6s' }} />
          <span className="absolute left-[62%] bottom-[25%] w-2 h-2 rounded-full bg-amber-300 ember-particle shadow-[0_0_10px_#ffaa00]" style={{ animationDelay: '1.8s', animationDuration: '3.1s' }} />
          <span className="absolute left-[78%] bottom-[20%] w-1.5 h-1.5 rounded-full bg-orange-500 ember-particle shadow-[0_0_8px_#ff6600]" style={{ animationDelay: '0.4s', animationDuration: '2.9s' }} />
          <span className="absolute left-[88%] bottom-[35%] w-2 h-2 rounded-full bg-amber-400 ember-particle shadow-[0_0_10px_#ff9900]" style={{ animationDelay: '1.4s', animationDuration: '3.4s' }} />
        </div>

        <WindReveal direction="wind-left" duration={0.9}>
          {/* Fiery Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse fill-amber-400" />
            <span>The Championship Grand Prix</span>
          </div>

          {/* Fiery Animated Heading */}
          <div className="relative inline-block">
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-[0.08em] sm:tracking-[0.12em] uppercase select-none fire-text-animated">
              GARAM PRIX
            </h1>
          </div>
        </WindReveal>

        {/* Live Countdown Banner */}
        {state.countdownConfig?.enabled !== false && (
          <WindReveal direction="up" delay={0.1}>
            <GaramPrixCountdown
              config={state.countdownConfig}
              isAdmin={isAdmin}
              onOpenAdminSchedule={onOpenAdminSchedule}
            />
          </WindReveal>
        )}

        {/* Duel Score Board */}
        <WindReveal direction="up" delay={0.18}>
          <div className="max-w-2xl mx-auto bg-[#0e1216] border border-white/[0.08] rounded-2xl p-6 sm:p-8 mt-6 shadow-2xl">
          <div className="grid grid-cols-2 items-center gap-6">
            {/* Team 1 Score */}
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-semibold text-sm sm:text-base text-white">
                  {team1.name}
                </span>
              </div>
              <div className="text-4xl sm:text-6xl font-light text-red-400">
                {stats.team1TotalPoints}
              </div>
              <div className="text-xs text-slate-400">
                {stats.team1Wins} {stats.team1Wins === 1 ? 'Win' : 'Wins'}
              </div>
            </div>

            {/* Team 2 Score */}
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span className="font-semibold text-sm sm:text-base text-white">
                  {team2.name}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              </div>
              <div className="text-4xl sm:text-6xl font-light text-sky-400">
                {stats.team2TotalPoints}
              </div>
              <div className="text-xs text-slate-400">
                {stats.team2Wins} {stats.team2Wins === 1 ? 'Win' : 'Wins'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="h-1.5 w-full bg-[#1c2024] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-red-500 transition-all duration-700 ease-out"
                style={{ width: `${t1Percent}%` }}
              />
              <div
                className="h-full bg-sky-500 transition-all duration-700 ease-out"
                style={{ width: `${t2Percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>
                {stats.leaderTeamId === 'tied'
                  ? 'Scores level'
                  : `${stats.leaderTeamId === 'team1' ? team1.name : team2.name} leads by ${stats.pointGap} PTS`}
              </span>
              <span>{stats.completedMatchesCount} of {stats.totalMatchesCount} Completed</span>
            </div>
          </div>
        </div>
      </WindReveal>
    </div>

    {/* Scroll Down */}
      <div className="text-center pt-8">
        <button
          onClick={scrollToBattlefield}
          className="inline-flex flex-col items-center text-slate-500 hover:text-white transition-colors group cursor-pointer"
          aria-label="Scroll to Games"
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
            Games
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    </section>
  );
};
