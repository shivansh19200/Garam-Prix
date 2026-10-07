import React, { useState, useEffect, useMemo } from 'react';
import { TournamentState, Match } from './types/tournament';
import {
  loadTournamentState,
  saveTournamentState,
  resetTournamentState,
  calculateTournamentStats,
} from './utils/storage';
import { recalculateMatchOutcome } from './utils/seriesCalculations';
import { hasActiveAdminSession, clearAdminSession } from './utils/cryptoAuth';
import { MichskyHeader } from './components/MichskyHeader';
import { MichskyHero } from './components/MichskyHero';
import { MichskyGrid } from './components/MichskyGrid';
import { MichskyTimeline } from './components/MichskyTimeline';
import { MichskyStandings } from './components/MichskyStandings';
import { MichskyMvpLeaderboard } from './components/MichskyMvpLeaderboard';
import { MichskyRoster } from './components/MichskyRoster';
import { MichskyFooter } from './components/MichskyFooter';
import { GameScoreDetailModal } from './components/GameScoreDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { RulesTierModal } from './components/RulesTierModal';

export default function App() {
  const [tournamentState, setTournamentState] = useState<TournamentState>(loadTournamentState);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Derive fresh, live selected match from state so it's always up to date
  const selectedMatch = useMemo(() => {
    if (!selectedMatchId) return null;
    return tournamentState.matches.find((m) => m.id === selectedMatchId) || null;
  }, [tournamentState.matches, selectedMatchId]);

  // Active section tracking for header underline
  const [activeSection, setActiveSection] = useState<string>('home');

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(hasActiveAdminSession);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Recalculate tournament stats on state change
  const stats = useMemo(() => calculateTournamentStats(tournamentState), [tournamentState]);

  // Persist state updates with match recalculation
  const handleUpdateTournamentState = (newState: TournamentState) => {
    const normalizedState: TournamentState = {
      ...newState,
      matches: newState.matches.map((m) => recalculateMatchOutcome(m)),
    };
    setTournamentState(normalizedState);
    saveTournamentState(normalizedState);
  };

  // Match score/update callback
  const handleUpdateMatch = (updatedMatch: Match) => {
    const recalculated = recalculateMatchOutcome(updatedMatch);
    const updatedMatches = tournamentState.matches.map((m) =>
      m.id === recalculated.id ? recalculated : m
    );
    const newState: TournamentState = {
      ...tournamentState,
      matches: updatedMatches,
    };
    handleUpdateTournamentState(newState);
  };

  // Match delete callback
  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = tournamentState.matches.filter((m) => m.id !== matchId);
    const newState: TournamentState = {
      ...tournamentState,
      matches: updatedMatches,
    };
    handleUpdateTournamentState(newState);
    if (selectedMatchId === matchId) {
      setSelectedMatchId(null);
    }
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsAdmin(false);
  };

  // Scroll spy to highlight active nav link
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const sections = [
        { id: 'masthead', key: 'home' },
        { id: 'section-projects', key: 'projects' },
        { id: 'section-timeline', key: 'timeline' },
        { id: 'section-standings', key: 'standings' },
        { id: 'section-mvp', key: 'mvp' },
        { id: 'section-roster', key: 'roster' },
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].key);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col selection:bg-white selection:text-black">
      {/* Exact Michsky Header with Section Indicators */}
      <MichskyHeader
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
        onAdminLogout={handleAdminLogout}
        team1Score={stats.team1TotalPoints}
        team2Score={stats.team2TotalPoints}
        activeSection={activeSection}
      />

      <main className="flex-1 w-full">
        {/* Masthead / Hero with Live Countdown */}
        <MichskyHero
          state={tournamentState}
          stats={stats}
          isAdmin={isAdmin}
          onOpenAdminSchedule={() => {
            const el = document.getElementById('admin-countdown-config');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              const adminSection = document.getElementById('section-admin');
              if (adminSection) adminSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Projects / Games Grid (Exact layout from image.png with 3D flashcard animation) */}
        <MichskyGrid
          state={tournamentState}
          onOpenModal={(m) => setSelectedMatchId(m.id)}
        />

        {/* Chronological Schedule Timeline */}
        <MichskyTimeline
          state={tournamentState}
          onOpenModal={(m) => setSelectedMatchId(m.id)}
        />

        {/* Official Standings (Championship Points Table) */}
        <MichskyStandings state={tournamentState} stats={stats} />

        {/* Separate MVP Leaderboard Section */}
        <MichskyMvpLeaderboard
          state={tournamentState}
          isAdmin={isAdmin}
          onOpenAdminPanel={() => {
            const el = document.getElementById('admin-mvp-config');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              const adminSection = document.getElementById('section-admin');
              if (adminSection) adminSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* The 8 Contenders Rosters with detailed write-ups (no price tags) */}
        <MichskyRoster state={tournamentState} />

        {/* Admin Section (Revealed when logged in) */}
        {isAdmin && (
          <section id="section-admin" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/[0.08]">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-red-400 block mb-2 font-medium">
                  CONTROL ROOM
                </span>
                <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white uppercase">
                  Tournament Admin
                </h2>
              </div>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                Log Out
              </button>
            </div>

            <AdminPanel
              state={tournamentState}
              onUpdateState={handleUpdateTournamentState}
              onResetToDefault={() => {
                const fresh = resetTournamentState();
                setTournamentState(fresh);
              }}
            />
          </section>
        )}
      </main>

      {/* Footer without email alert */}
      <MichskyFooter onOpenRules={() => setShowRulesModal(true)} />

      {/* Sport Scorekeeper & Updates Modal (Editing access restricted to admin) */}
      <GameScoreDetailModal
        match={selectedMatch}
        team1={tournamentState.teams.team1}
        team2={tournamentState.teams.team2}
        players={tournamentState.players}
        isAdmin={isAdmin}
        onClose={() => setSelectedMatchId(null)}
        onUpdateMatch={handleUpdateMatch}
        onDeleteMatch={handleDeleteMatch}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
      />

      {/* Admin Login Modal (SHA-256 verification of RsR@admin@19) */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          const el = document.getElementById('section-admin');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Rules & Constitution Modal */}
      <RulesTierModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}
