import React from 'react';

interface MichskyFooterProps {
  onOpenRules: () => void;
}

export const MichskyFooter: React.FC<MichskyFooterProps> = ({ onOpenRules }) => {
  return (
    <footer id="page-footer" className="bg-[#0a0a0a] border-t border-white/[0.06] py-12 px-6 lg:px-12 text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <span className="font-semibold text-white tracking-widest uppercase block text-sm">
            GARAM PRIX
          </span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <a href="#masthead" className="hover:text-white transition-colors">
            Home
          </a>
          <a href="#section-projects" className="hover:text-white transition-colors">
            Games
          </a>
          <a href="#section-standings" className="hover:text-white transition-colors">
            Standings
          </a>
          <a href="#section-roster" className="hover:text-white transition-colors">
            Roster
          </a>
          <button
            onClick={onOpenRules}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Rules & Tiers
          </button>
        </div>

        <div className="text-slate-500 text-[11px]">
          © 2026 Garam Prix
        </div>
      </div>
    </footer>
  );
};
