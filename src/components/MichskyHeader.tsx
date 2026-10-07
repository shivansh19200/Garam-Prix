import React, { useState } from 'react';
import { Lock, Unlock, Menu, X } from 'lucide-react';

interface MichskyHeaderProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  team1Score: number;
  team2Score: number;
  activeSection: string;
}

export const MichskyHeader: React.FC<MichskyHeaderProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  activeSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        id="page-header"
        className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/[0.05]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo with 3 Vertical Bars (Exact replica of the icon in image.png) */}
          <a
            href="#masthead"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('masthead');
            }}
            className="flex items-center gap-3.5 group select-none"
          >
            <div className="w-8 h-8 rounded-full border border-white/80 flex items-center justify-center gap-[3px] p-1.5 group-hover:border-white transition-colors">
              <span className="w-[2.5px] h-3.5 bg-white rounded-full" />
              <span className="w-[2.5px] h-4.5 bg-white rounded-full" />
              <span className="w-[2.5px] h-2.5 bg-white rounded-full" />
            </div>
            <span className="font-bold text-sm tracking-[0.2em] text-white uppercase">
              GARAM PRIX
            </span>
          </a>

          {/* Desktop Navigation Links (EXACT match to image.png) */}
          <nav className="hidden md:flex items-center gap-10 text-[13px] tracking-[0.2em] font-medium text-slate-300">
            <a
              href="#masthead"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('masthead');
              }}
              className={`relative py-1 transition-colors uppercase ${
                activeSection === 'home' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>HOME</span>
              {activeSection === 'home' && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </a>

            <a
              href="#section-projects"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('section-projects');
              }}
              className={`relative py-1 transition-colors uppercase ${
                activeSection === 'projects' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>GAMES</span>
              {activeSection === 'projects' && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </a>

            <a
              href="#section-timeline"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('section-timeline');
              }}
              className={`relative py-1 transition-colors uppercase ${
                activeSection === 'timeline' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>TIMELINE</span>
              {activeSection === 'timeline' && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </a>

            <a
              href="#section-standings"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('section-standings');
              }}
              className={`relative py-1 transition-colors uppercase ${
                activeSection === 'standings' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>STANDINGS</span>
              {activeSection === 'standings' && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </a>

            <a
              href="#section-mvp"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('section-mvp');
              }}
              className={`relative py-1 transition-colors uppercase ${
                activeSection === 'mvp' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1">
                <span>MVP BOARD</span>
              </span>
              {activeSection === 'mvp' && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-amber-400 transition-all" />
              )}
            </a>

            <a
              href="#section-roster"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('section-roster');
              }}
              className={`relative py-1 transition-colors uppercase ${
                activeSection === 'roster' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>ROSTER</span>
              {activeSection === 'roster' && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-white transition-all" />
              )}
            </a>

            {/* Admin Access button */}
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <a
                  href="#section-admin"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo('section-admin');
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
                >
                  ADMIN ROOM
                </a>
                <button
                  onClick={onAdminLogout}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Log out of Admin"
                >
                  <Unlock className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>ADMIN</span>
              </button>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col justify-between p-8 pt-24 md:hidden">
          <div className="space-y-6 text-xl tracking-widest uppercase font-light text-white">
            <button
              onClick={() => scrollTo('masthead')}
              className="block w-full text-left py-2 hover:text-slate-300"
            >
              HOME
            </button>
            <button
              onClick={() => scrollTo('section-projects')}
              className="block w-full text-left py-2 hover:text-slate-300"
            >
              GAMES
            </button>
            <button
              onClick={() => scrollTo('section-timeline')}
              className="block w-full text-left py-2 hover:text-slate-300"
            >
              TIMELINE
            </button>
            <button
              onClick={() => scrollTo('section-standings')}
              className="block w-full text-left py-2 hover:text-slate-300"
            >
              STANDINGS
            </button>
            <button
              onClick={() => scrollTo('section-mvp')}
              className="block w-full text-left py-2 text-amber-300 hover:text-white flex items-center justify-between"
            >
              <span>MVP BOARD</span>
              <span className="text-xs bg-amber-400/20 px-2 py-0.5 rounded text-amber-300">TOP</span>
            </button>
            <button
              onClick={() => scrollTo('section-roster')}
              className="block w-full text-left py-2 hover:text-slate-300"
            >
              ROSTER
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isAdmin) scrollTo('section-admin');
                else onOpenAdminLogin();
              }}
              className="block w-full text-left py-2 text-red-400 font-semibold"
            >
              {isAdmin ? 'ADMIN ROOM' : 'ADMIN LOGIN'}
            </button>
          </div>

          <div className="text-xs text-slate-500 pt-6 border-t border-white/10">
            © 2026 Garam Prix
          </div>
        </div>
      )}
    </>
  );
};
