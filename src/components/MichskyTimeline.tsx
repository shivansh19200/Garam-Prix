import React, { useRef } from 'react';
import { TournamentState, Match } from '../types/tournament';
import { sortMatchesBySchedule } from '../utils/dateCalculations';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Radio,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { WindReveal } from './WindReveal';

interface MichskyTimelineProps {
  state: TournamentState;
  onOpenModal: (match: Match) => void;
}

export const MichskyTimeline: React.FC<MichskyTimelineProps> = ({
  state,
  onOpenModal,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reorder the timeline automatically according to scheduled dates
  const orderedMatches = sortMatchesBySchedule(state.matches);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const getTierTheme = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return {
          barBg: 'bg-gradient-to-r from-slate-200 via-white to-slate-300',
          textColor: 'text-slate-900',
          stemColor: 'bg-slate-300',
          borderAccent: 'border-slate-300/40 hover:border-white',
          glow: 'shadow-[0_0_20px_rgba(255,255,255,0.2)]',
          badgeText: 'Tier 01 · 10 PTS',
          dotBg: 'bg-white',
        };
      case 'gold':
        return {
          barBg: 'bg-gradient-to-r from-[#ffd32a] via-[#f59e0b] to-[#d97706]',
          textColor: 'text-black',
          stemColor: 'bg-amber-400',
          borderAccent: 'border-amber-400/40 hover:border-amber-300',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
          badgeText: 'Tier 02 · 7 PTS',
          dotBg: 'bg-amber-400',
        };
      case 'silver':
      default:
        return {
          barBg: 'bg-gradient-to-r from-[#38bdf8] via-[#0284c7] to-[#0369a1]',
          textColor: 'text-white',
          stemColor: 'bg-sky-400',
          borderAccent: 'border-sky-400/40 hover:border-sky-300',
          glow: 'shadow-[0_0_20px_rgba(56,189,248,0.25)]',
          badgeText: 'Tier 03 · 5 PTS',
          dotBg: 'bg-sky-400',
        };
    }
  };

  return (
    <section
      id="section-timeline"
      className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.06] relative"
    >
      <div className="wind-streak" />

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-sky-500/[0.03] blur-[140px] pointer-events-none -z-10" />

      {/* Header and Controls */}
      <WindReveal direction="wind-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold text-sky-300 bg-sky-500/10 border border-sky-400/30 shadow-[0_0_25px_rgba(56,189,248,0.25)] backdrop-blur-md mb-3">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>Championship Schedule</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase select-none flex items-center gap-3">
              <span>TIMELINE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-ping" />
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-light">
              Chronological schedule of all {orderedMatches.length} Garam Prix events. Auto-reordered by match date.
            </p>
          </div>

          {/* Scroll Arrows for Desktop */}
          <div className="hidden md:flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={scrollLeft}
              className="w-11 h-11 rounded-2xl border border-white/10 bg-[#0e121a] hover:bg-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-lg cursor-pointer"
              aria-label="Previous timeline milestones"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="w-11 h-11 rounded-2xl border border-white/10 bg-[#0e121a] hover:bg-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-lg cursor-pointer"
              aria-label="Next timeline milestones"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </WindReveal>

      {orderedMatches.length === 0 ? (
        <div className="py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-3xl space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-sm font-medium text-slate-300">No events currently scheduled</p>
          <p className="text-xs text-slate-500">Timeline will automatically populate as matches are scheduled.</p>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* 1. MOBILE VIEW (< md): DEDICATED VERTICAL TIMELINE      */}
          {/* ======================================================== */}
          <div className="block md:hidden relative pl-6 pb-6">
            {/* Continuous Vertical Glowing Line */}
            <div className="absolute left-[17px] top-4 bottom-4 w-[3px] bg-gradient-to-b from-sky-400 via-amber-400 to-white rounded-full opacity-60 shadow-[0_0_12px_rgba(56,189,248,0.5)]" />

        <div className="space-y-8 relative">
          {orderedMatches.map((match, idx) => {
            const theme = getTierTheme(match.tier);
            const winningTeam =
              match.winnerTeamId === 'team1'
                ? state.teams.team1
                : match.winnerTeamId === 'team2'
                ? state.teams.team2
                : null;

            return (
              <div key={match.id} className="relative flex items-start gap-5">
                {/* Milestone Node on the Vertical Spine */}
                <div className="relative -ml-[25px] mt-1 shrink-0 z-10">
                  <div
                    className={`w-6 h-6 rounded-full ${theme.barBg} border-2 border-[#0a0a0a] shadow-lg flex items-center justify-center`}
                  >
                    <div className="w-2 h-2 rounded-full bg-black/80" />
                  </div>
                  {match.status === 'live' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  )}
                </div>

                {/* Milestone Card */}
                <div
                  onClick={() => onOpenModal(match)}
                  className={`flex-1 bg-[#0b0e15] border rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all active:scale-[0.98] ${theme.borderAccent} ${theme.glow}`}
                >
                  {/* Date & Event Number Banner */}
                  <div
                    className={`w-full py-1.5 px-4 flex items-center justify-between font-black text-[11px] tracking-wider uppercase select-none ${theme.barBg} ${theme.textColor}`}
                  >
                    <span>{match.scheduledTime}</span>
                    <span className="opacity-75 text-[10px]">#{idx + 1}</span>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl drop-shadow">{match.emoji}</span>
                        <div>
                          <h3 className="font-bold text-base text-white">{match.gameName}</h3>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                            {match.subtitleTag}
                          </span>
                        </div>
                      </div>

                      <div>
                        {match.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-500/15 border border-sky-400/40 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Final</span>
                          </span>
                        ) : match.status === 'live' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/40 px-2 py-0.5 rounded-full animate-pulse">
                            <Radio className="w-2.5 h-2.5" />
                            <span>Live</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Upcoming</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Venue & Tier Tag */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{match.venueOrPlatform}</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">
                        {theme.badgeText}
                      </span>
                    </div>

                    {/* Outcome / Score Pill */}
                    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      {match.status === 'completed' && winningTeam ? (
                        <span className="text-sky-300 font-semibold truncate flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{winningTeam.name} Won</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium">
                          {match.team1ScoreDisplay && match.team2ScoreDisplay
                            ? `${match.team1ScoreDisplay} - ${match.team2ScoreDisplay}`
                            : 'Scheduled fixture'}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP VIEW (md+): HORIZONTAL ALTERNATING TIMELINE  */}
      {/* ======================================================== */}
      <div
        ref={scrollContainerRef}
        className="hidden md:block overflow-x-auto pb-10 pt-4 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="relative min-w-[1450px] px-6">
          {/* Continuous Segmented Horizontal Center Line */}
          <div className="absolute top-[280px] left-0 right-0 h-3 bg-[#161c28] rounded-full shadow-inner flex overflow-hidden">
            {orderedMatches.map((m) => {
              const theme = getTierTheme(m.tier);
              return (
                <div
                  key={m.id}
                  className={`flex-1 h-full opacity-40 transition-opacity hover:opacity-100 ${theme.barBg}`}
                />
              );
            })}
          </div>

          {/* Alternating Milestones Grid */}
          <div
            className="grid gap-6 relative"
            style={{
              gridTemplateColumns: `repeat(${Math.max(orderedMatches.length, 1)}, minmax(130px, 1fr))`,
            }}
          >
            {orderedMatches.map((match, idx) => {
              const theme = getTierTheme(match.tier);
              const isEven = idx % 2 === 0; // Even: card BELOW the line. Odd: card ABOVE the line
              const winningTeam =
                match.winnerTeamId === 'team1'
                  ? state.teams.team1
                  : match.winnerTeamId === 'team2'
                  ? state.teams.team2
                  : null;

              return (
                <div
                  key={match.id}
                  className="relative flex flex-col items-center min-w-[195px] h-[560px]"
                >
                  {/* ======================================================== */}
                  {/* CASE 1: ODD INDEX (Card is ABOVE the central line)       */}
                  {/* ======================================================== */}
                  {!isEven && (
                    <div className="w-full flex flex-col items-center">
                      {/* Card on Top */}
                      <div
                        onClick={() => onOpenModal(match)}
                        className={`w-full bg-[#0b0e15] border rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 group hover:-translate-y-1.5 ${theme.borderAccent} ${theme.glow}`}
                      >
                        {/* Card Content Body */}
                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-2xl drop-shadow">{match.emoji}</span>
                            <div>
                              {match.status === 'completed' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-500/15 border border-sky-400/40 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Final</span>
                                </span>
                              ) : match.status === 'live' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/40 px-2 py-0.5 rounded-full animate-pulse">
                                  <Radio className="w-2.5 h-2.5" />
                                  <span>Live</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Upcoming</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                              {match.gameName}
                            </h3>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">
                              {match.subtitleTag}
                            </span>
                          </div>

                          {/* Outcome / Score Pill */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                            {match.status === 'completed' && winningTeam ? (
                              <span className="text-sky-300 font-semibold truncate flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{winningTeam.name.split(' ')[0]} Won</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                {match.team1ScoreDisplay && match.team2ScoreDisplay
                                  ? `${match.team1ScoreDisplay} - ${match.team2ScoreDisplay}`
                                  : 'Scheduled'}
                              </span>
                            )}
                            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                          </div>
                        </div>

                        {/* Date Block at the bottom of the top card (connects to stem) */}
                        <div
                          className={`w-full py-1.5 px-3 text-center font-black text-[11px] tracking-wider uppercase select-none ${theme.barBg} ${theme.textColor}`}
                        >
                          {match.scheduledTime}
                        </div>
                      </div>

                      {/* Stem going DOWN to the central line */}
                      <div className={`w-1 h-14 ${theme.stemColor} shadow-md`} />

                      {/* Junction Joint Anchor on the central line */}
                      <div
                        className={`w-5 h-5 rounded-md ${theme.barBg} border-2 border-[#0e121a] shadow-lg -mt-2.5 z-10 flex items-center justify-center`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* CASE 2: EVEN INDEX (Card is BELOW the central line)      */}
                  {/* ======================================================== */}
                  {isEven && (
                    <div className="w-full flex flex-col items-center pt-[274px]">
                      {/* Junction Joint Anchor on the central line */}
                      <div
                        className={`w-5 h-5 rounded-md ${theme.barBg} border-2 border-[#0e121a] shadow-lg z-10 flex items-center justify-center`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      </div>

                      {/* Stem going DOWN to the card */}
                      <div className={`w-1 h-14 ${theme.stemColor} shadow-md`} />

                      {/* Card on Bottom */}
                      <div
                        onClick={() => onOpenModal(match)}
                        className={`w-full bg-[#0b0e15] border rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 group hover:translate-y-1.5 ${theme.borderAccent} ${theme.glow}`}
                      >
                        {/* Date Block at top of the bottom card (connects to stem) */}
                        <div
                          className={`w-full py-1.5 px-3 text-center font-black text-[11px] tracking-wider uppercase select-none ${theme.barBg} ${theme.textColor}`}
                        >
                          {match.scheduledTime}
                        </div>

                        {/* Card Content Body */}
                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-2xl drop-shadow">{match.emoji}</span>
                            <div>
                              {match.status === 'completed' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-500/15 border border-sky-400/40 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Final</span>
                                </span>
                              ) : match.status === 'live' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/40 px-2 py-0.5 rounded-full animate-pulse">
                                  <Radio className="w-2.5 h-2.5" />
                                  <span>Live</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Upcoming</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                              {match.gameName}
                            </h3>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">
                              {match.subtitleTag}
                            </span>
                          </div>

                          {/* Outcome / Score Pill */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                            {match.status === 'completed' && winningTeam ? (
                              <span className="text-sky-300 font-semibold truncate flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{winningTeam.name.split(' ')[0]} Won</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                {match.team1ScoreDisplay && match.team2ScoreDisplay
                                  ? `${match.team1ScoreDisplay} - ${match.team2ScoreDisplay}`
                                  : 'Scheduled'}
                              </span>
                            )}
                            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
      )}
    </section>
  );
};
