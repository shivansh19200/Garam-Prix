import React, { useState, useEffect } from 'react';
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
}) => {
  const targetIso = config?.targetDate || '2026-10-11T17:00:00';
  const title = config?.title || 'LIVE IN';

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

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative w-full max-w-2xl mx-auto my-6 px-4 bg-transparent">
      {/* Centered Bigger White Header without extra clutter */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white drop-shadow-[0_2px_14px_rgba(255,255,255,0.3)] select-none">
          {title}
        </h2>
      </div>

      {/* Countdown Digit Blocks or Live Banner */}
      {timeLeft.isPast ? (
        <div className="py-4 text-center">
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-red-600/30 border border-red-500/50 text-white font-bold text-sm sm:text-base tracking-widest uppercase backdrop-blur-md">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span>GARAM PRIX IS LIVE NOW</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-xl mx-auto">
          {/* DAYS */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 sm:p-5 text-center backdrop-blur-md transition-transform hover:scale-[1.02]">
            <span className="block text-3xl sm:text-5xl font-light text-white tracking-tight font-mono">
              {pad(timeLeft.days)}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-400 mt-1.5">
              Days
            </span>
          </div>

          {/* HOURS */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 sm:p-5 text-center backdrop-blur-md transition-transform hover:scale-[1.02]">
            <span className="block text-3xl sm:text-5xl font-light text-white tracking-tight font-mono">
              {pad(timeLeft.hours)}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-400 mt-1.5">
              Hours
            </span>
          </div>

          {/* MINUTES */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 sm:p-5 text-center backdrop-blur-md transition-transform hover:scale-[1.02]">
            <span className="block text-3xl sm:text-5xl font-light text-white tracking-tight font-mono">
              {pad(timeLeft.minutes)}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-400 mt-1.5">
              Mins
            </span>
          </div>

          {/* SECONDS */}
          <div className="bg-black/40 border border-red-500/30 rounded-2xl p-3 sm:p-5 text-center backdrop-blur-md transition-transform hover:scale-[1.02]">
            <span className="block text-3xl sm:text-5xl font-light text-red-400 tracking-tight font-mono animate-pulse">
              {pad(timeLeft.seconds)}
            </span>
            <span className="block text-[10px] sm:text-xs uppercase font-bold tracking-widest text-red-400/80 mt-1.5">
              Secs
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
