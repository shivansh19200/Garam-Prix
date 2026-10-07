import React, { useState } from 'react';
import { TournamentState, Match, TierType } from '../types/tournament';
import { MichskyProjectCard } from './MichskyProjectCard';
import { Sparkles, Trophy, Shield } from 'lucide-react';
import { WindReveal } from './WindReveal';

interface MichskyGridProps {
  state: TournamentState;
  onOpenModal: (match: Match) => void;
}

export const MichskyGrid: React.FC<MichskyGridProps> = ({
  state,
  onOpenModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | TierType>('all');

  const filterTabs = [
    { id: 'all', label: 'All Events' },
    { id: 'platinum', label: 'Platinum' },
    { id: 'gold', label: 'Gold' },
    { id: 'silver', label: 'Silver' },
  ];

  const platinumMatches = state.matches.filter((m) => m.tier === 'platinum');
  const goldMatches = state.matches.filter((m) => m.tier === 'gold');
  const silverMatches = state.matches.filter((m) => m.tier === 'silver');

  return (
    <section id="section-projects" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto relative">
      <div className="wind-streak" />

      {/* Header with Ice Cold Appealing Title and Filter Tabs */}
      <WindReveal direction="wind-left">
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 border-b border-white/[0.06] pb-6">
          {/* Ambient subtle ice cold glow behind header */}
          <div className="absolute top-0 left-0 w-[280px] h-[120px] bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-transparent blur-3xl pointer-events-none -z-10 ice-aura-glow" />

          <div className="relative">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase select-none ice-text-animated">
              GAMES
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400 pb-1">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`relative py-1 cursor-pointer transition-colors ${
                    isActive ? 'text-white font-semibold' : 'hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-[-25px] left-0 right-0 h-[2px] bg-white transition-all shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </WindReveal>

      <div className="space-y-28">
        {/* ======================================================== */}
        {/* 💎 PLATINUM SECTION                                      */}
        {/* ======================================================== */}
        {(activeFilter === 'all' || activeFilter === 'platinum') && platinumMatches.length > 0 && (
          <div className="tier-section-platinum relative">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-white/[0.06] via-slate-300/[0.02] to-transparent blur-3xl pointer-events-none -z-10" />

            {/* Centered Platinum Header */}
            <WindReveal direction="up">
              <div className="text-center mb-10 sm:mb-14 px-2">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.3em] uppercase font-bold text-slate-200 bg-white/[0.07] border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-md mb-3 sm:mb-4 group hover:border-white/40 transition-all">
                  <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white animate-pulse" />
                  <span>Tier 01 · 10 Pts Winner · 4 Consolation</span>
                </div>

                <h3 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.08em] sm:tracking-[0.25em] md:tracking-[0.35em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-[0_12px_35px_rgba(255,255,255,0.35)] select-none break-normal">
                  PLATINUM
                </h3>

                {/* Decorative Accent Line */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-[200px] sm:max-w-md mx-auto my-2 sm:my-3">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/40 to-white" />
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rotate-45 bg-white shadow-[0_0_10px_#ffffff]" />
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/40 to-white" />
                </div>
              </div>
            </WindReveal>

            {/* Platinum Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8 sm:gap-10">
              {platinumMatches.map((match, idx) => (
                <WindReveal key={match.id} direction="wind-left" delay={idx * 0.12}>
                  <MichskyProjectCard
                    match={match}
                    team1={state.teams.team1}
                    team2={state.teams.team2}
                    onOpenScoreboard={onOpenModal}
                  />
                </WindReveal>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 🏆 GOLD SECTION                                          */}
        {/* ======================================================== */}
        {(activeFilter === 'all' || activeFilter === 'gold') && goldMatches.length > 0 && (
          <div className="tier-section-gold relative pt-6">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[220px] bg-gradient-to-b from-amber-500/[0.08] via-yellow-500/[0.02] to-transparent blur-3xl pointer-events-none -z-10" />

            {/* Centered Gold Header */}
            <WindReveal direction="up">
              <div className="text-center mb-10 sm:mb-14 px-2">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.3em] uppercase font-bold text-amber-300 bg-amber-500/[0.12] border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md mb-3 sm:mb-4 group hover:border-amber-400 transition-all">
                  <Trophy className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400 animate-pulse" />
                  <span>Tier 02 · 7 Pts Winner · 3 Consolation</span>
                </div>

                <h3 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.1em] sm:tracking-[0.25em] md:tracking-[0.35em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#fff3b0] via-[#f59e0b] to-[#b45309] drop-shadow-[0_12px_35px_rgba(245,158,11,0.4)] select-none break-normal">
                  GOLD
                </h3>

                {/* Decorative Accent Line */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-[200px] sm:max-w-md mx-auto my-2 sm:my-3">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400/40 to-amber-400" />
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rotate-45 bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-400/40 to-amber-400" />
                </div>
              </div>
            </WindReveal>

            {/* Gold Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {goldMatches.map((match, idx) => (
                <WindReveal key={match.id} direction="wind-left" delay={idx * 0.1}>
                  <MichskyProjectCard
                    match={match}
                    team1={state.teams.team1}
                    team2={state.teams.team2}
                    onOpenScoreboard={onOpenModal}
                  />
                </WindReveal>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 🛡️ SILVER SECTION                                        */}
        {/* ======================================================== */}
        {(activeFilter === 'all' || activeFilter === 'silver') && silverMatches.length > 0 && (
          <div className="tier-section-silver relative pt-6">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[220px] bg-gradient-to-b from-slate-400/[0.08] via-cyan-500/[0.02] to-transparent blur-3xl pointer-events-none -z-10" />

            {/* Centered Silver Header */}
            <WindReveal direction="up">
              <div className="text-center mb-10 sm:mb-14 px-2">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.3em] uppercase font-bold text-slate-300 bg-white/[0.06] border border-slate-400/30 shadow-[0_0_20px_rgba(148,163,184,0.25)] backdrop-blur-md mb-3 sm:mb-4 group hover:border-slate-300 transition-all">
                  <Shield className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-300 animate-pulse" />
                  <span>Tier 03 · 5 Pts Winner · 2 Consolation</span>
                </div>

                <h3 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.1em] sm:tracking-[0.25em] md:tracking-[0.35em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#f8fafc] via-[#cbd5e1] to-[#64748b] drop-shadow-[0_12px_35px_rgba(148,163,184,0.35)] select-none break-normal">
                  SILVER
                </h3>

                {/* Decorative Accent Line */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-[200px] sm:max-w-md mx-auto my-2 sm:my-3">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-300/40 to-slate-200" />
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rotate-45 bg-slate-300 shadow-[0_0_10px_#cbd5e1]" />
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-slate-300/40 to-slate-200" />
                </div>
              </div>
            </WindReveal>

            {/* Silver Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8 sm:gap-10">
              {silverMatches.map((match, idx) => (
                <WindReveal key={match.id} direction="wind-left" delay={idx * 0.12}>
                  <MichskyProjectCard
                    match={match}
                    team1={state.teams.team1}
                    team2={state.teams.team2}
                    onOpenScoreboard={onOpenModal}
                  />
                </WindReveal>
              ))}
            </div>
          </div>
        )}

        {state.matches.length === 0 && (
          <div className="py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-3xl space-y-2">
            <span className="text-2xl block">⚔️</span>
            <p className="text-sm font-medium text-slate-300">No games currently scheduled</p>
            <p className="text-xs text-slate-500">Games can be created or restored in the Admin Control Room.</p>
          </div>
        )}
      </div>
    </section>
  );
};
