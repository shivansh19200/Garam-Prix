import React, { useState, useEffect } from 'react';
import { Clock, Flame, Calendar, Sparkles, ChevronRight, Edit3 } from 'lucide-react';
import { CountdownConfig } from '../types/tournament';

interface GaramPrixCountdownProps {
  config?: CountdownConfig;
  isAdmin?: boolean;
  onOpenAdminSchedule?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalMs: number;
}

export const GaramPrixCountdown: React.FC<GaramPrixCountdownProps> = ({
  config,
  isAdmin = false,
  onOpenAdminSchedule,
}) => {
  const targetIso = config?.targetDate || '2026-10-11T17:00:00';
  const title = config?.title || 'LIVE IN';
  const subtitle = config?.subtitle || 'Tentatively 11th October 2026 · 5:00 PM';

  const calculateTime = (): TimeRemaining => {
    const target = new Date(targetIso).getTime();
    const now = Date.now();
    const diff = target - now;

    if (isNaN(target) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalMs: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPast: false, totalMs: diff };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTime);

  useEffect(() => {
    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  const scrollToTimeline = () => {
    const el = document.getElementById('section-projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 px-4">
      {/* Outer ambient glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 via-amber-500/25 to-sky-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 pointer-events-none" />

      <div className="relative bg-[#0d1017]/95 border border-white/[0.12] rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Top Header Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-4 h-4 animate-pulse fill-amber-400/60" />
              {!timeLeft.isPast && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-300">
                  {title}
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  Tentative Schedule
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{subtitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onOpenAdminSchedule && (
              <button
                type="button"
                onClick={onOpenAdminSchedule}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit tentative countdown date in Admin Panel"
              >
                <Edit3 className="w-3 h-3 text-amber-400" />
                <span>Edit Countdown</span>
              </button>
            )}

            <button
              type="button"
              onClick={scrollToTimeline}
              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Matches</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Countdown Digit Blocks or Live Banner */}
        {timeLeft.isPast ? (
          <div className="py-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-sm tracking-widest uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>GARAM PRIX IS LIVE NOW</span>
            </div>
            <p className="text-xs text-slate-400">
              Matches are underway! Check scores and commentary below.
            </p>
          </div>
        ) : (
          <div className="pt-5 pb-2">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
              {/* DAYS */}
              <div className="bg-[#141824]/90 border border-white/[0.08] hover:border-amber-500/40 rounded-xl p-3 sm:p-4 text-center transition-all group">
                <span className="block text-3xl sm:text-5xl font-light text-white tracking-tight font-mono group-hover:text-amber-300 transition-colors">
                  {pad(timeLeft.days)}
                </span>
                <span className="block text-[9px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                  Days
                </span>
              </div>

              {/* HOURS */}
              <div className="bg-[#141824]/90 border border-white/[0.08] hover:border-amber-500/40 rounded-xl p-3 sm:p-4 text-center transition-all group">
                <span className="block text-3xl sm:text-5xl font-light text-white tracking-tight font-mono group-hover:text-amber-300 transition-colors">
                  {pad(timeLeft.hours)}
                </span>
                <span className="block text-[9px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                  Hours
                </span>
              </div>

              {/* MINUTES */}
              <div className="bg-[#141824]/90 border border-white/[0.08] hover:border-amber-500/40 rounded-xl p-3 sm:p-4 text-center transition-all group">
                <span className="block text-3xl sm:text-5xl font-light text-white tracking-tight font-mono group-hover:text-amber-300 transition-colors">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="block text-[9px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                  Mins
                </span>
              </div>

              {/* SECONDS */}
              <div className="bg-[#141824]/90 border border-red-500/25 hover:border-red-500/50 rounded-xl p-3 sm:p-4 text-center transition-all group bg-gradient-to-b from-red-500/[0.05] to-transparent">
                <span className="block text-3xl sm:text-5xl font-light text-red-400 tracking-tight font-mono animate-pulse">
                  {pad(timeLeft.seconds)}
                </span>
                <span className="block text-[9px] sm:text-[11px] uppercase font-bold tracking-widest text-red-400/80 mt-1">
                  Secs
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Garam Prix Grand Clash · Stream & In-Person Showdown</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
