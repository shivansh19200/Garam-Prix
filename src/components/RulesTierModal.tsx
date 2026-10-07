import React from 'react';
import { X, Trophy } from 'lucide-react';

interface RulesTierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesTierModal: React.FC<RulesTierModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e1216] border border-white/15 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-xl w-full space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg text-white">
              Garam Prix Tournament Constitution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            8 men. 2 teams. 7 games across 3 tiers. 1 champion.
            Even in defeat, teams earn consolation points so every game counts toward the championship trophy.
          </p>

          {/* Platinum */}
          <div className="p-4 bg-[#141824] rounded-xl border border-white/[0.04] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-300 uppercase">🏆 Platinum Tier — 10 PTS</span>
              <span className="text-[11px] text-slate-400">Winner: 10 PTS · Loser: 4 PTS</span>
            </div>
            <div className="text-slate-400">
              🏏 Cricket (5-Match Test Series) · 🏀 Basketball (First to 30)
            </div>
          </div>

          {/* Gold */}
          <div className="p-4 bg-[#141824] rounded-xl border border-white/[0.04] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300 uppercase">🥇 Gold Tier — 7 PTS</span>
              <span className="text-[11px] text-slate-400">Winner: 7 PTS · Loser: 2 PTS</span>
            </div>
            <div className="text-slate-400">
              🎮 Stumble Guys · 🏓 Table Tennis · 🏐 Footvolley
            </div>
          </div>

          {/* Silver */}
          <div className="p-4 bg-[#141824] rounded-xl border border-white/[0.04] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 uppercase">🥈 Silver Tier — 5 PTS</span>
              <span className="text-[11px] text-slate-400">Winner: 5 PTS · Loser: 2 PTS</span>
            </div>
            <div className="text-slate-400">
              🏸 Badminton · 🏎️ Smash Karts
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs transition-colors hover:bg-slate-200 cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
