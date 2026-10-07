import React, { useState } from 'react';
import {
  Match,
  Team,
  DetailedCricketSeries,
  DetailedBasketballRace30,
  DetailedSmashKartsSeries,
  DetailedBadmintonSeries,
  DetailedFootvolleySeries,
  DetailedTableTennisSeries,
  DetailedStumbleGuysSeries,
} from '../types/tournament';
import { Radio, RotateCw, ArrowRight, Trophy, CheckCircle2 } from 'lucide-react';

interface MichskyProjectCardProps {
  match: Match;
  team1: Team;
  team2: Team;
  onOpenScoreboard: (match: Match) => void;
}

export const MichskyProjectCard: React.FC<MichskyProjectCardProps> = ({
  match,
  team1,
  team2,
  onOpenScoreboard,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Type safe helpers for each series type
  const cricketSeries: DetailedCricketSeries | null =
    match.detailedScore?.type === 'cricket_series' ? match.detailedScore.data : null;

  const bballRace: DetailedBasketballRace30 | null =
    match.detailedScore?.type === 'basketball_race30' ? match.detailedScore.data : null;

  const smashSeries: DetailedSmashKartsSeries | null =
    match.detailedScore?.type === 'smash_karts_series' ? match.detailedScore.data : null;

  const badmintonSeries: DetailedBadmintonSeries | null =
    match.detailedScore?.type === 'badminton_series' ? match.detailedScore.data : null;

  const footvolleySeries: DetailedFootvolleySeries | null =
    match.detailedScore?.type === 'footvolley_series' ? match.detailedScore.data : null;

  const tableTennisSeries: DetailedTableTennisSeries | null =
    match.detailedScore?.type === 'table_tennis_series' ? match.detailedScore.data : null;

  const stumbleGuysSeries: DetailedStumbleGuysSeries | null =
    match.detailedScore?.type === 'stumble_guys_series' ? match.detailedScore.data : null;

  // Completed status & Winner details
  const isCompleted = match.status === 'completed';
  const winningTeam = match.winnerTeamId === 'team1' ? team1 : match.winnerTeamId === 'team2' ? team2 : null;
  const losingTeam = match.winnerTeamId === 'team1' ? team2 : match.winnerTeamId === 'team2' ? team1 : null;

  // Derive series / duel scores matching the exact format from user image.png
  let t1SeriesScore = '0';
  let t2SeriesScore = '0';
  let seriesRuleLabel = match.subtitleTag;
  let seriesStatusNote = '';
  let finalScoreText = '';

  if (cricketSeries) {
    t1SeriesScore = String(cricketSeries.team1SeriesWins);
    t2SeriesScore = String(cricketSeries.team2SeriesWins);
    seriesRuleLabel = '5-Match Test Series';
    finalScoreText = `${cricketSeries.team1SeriesWins} - ${cricketSeries.team2SeriesWins}`;
    seriesStatusNote =
      cricketSeries.team1SeriesWins > cricketSeries.team2SeriesWins
        ? `${team1.name} leads ${t1SeriesScore}-${t2SeriesScore}`
        : cricketSeries.team2SeriesWins > cricketSeries.team1SeriesWins
        ? `${team2.name} leads ${t2SeriesScore}-${t1SeriesScore}`
        : 'Series level 0-0';
  } else if (bballRace) {
    t1SeriesScore = String(bballRace.team1Points);
    t2SeriesScore = String(bballRace.team2Points);
    seriesRuleLabel = 'First to 30 Points Wins';
    finalScoreText = `${bballRace.team1Points} - ${bballRace.team2Points}`;
    seriesStatusNote = bballRace.winnerTeamId
      ? `${bballRace.winnerTeamId === 'team1' ? team1.name : team2.name} won race`
      : 'In progress · Target 30';
  } else if (smashSeries) {
    t1SeriesScore = String(smashSeries.team1SeriesWins);
    t2SeriesScore = String(smashSeries.team2SeriesWins);
    seriesRuleLabel = '7-Game Series · First to 4 Wins';
    finalScoreText = `${smashSeries.team1SeriesWins} - ${smashSeries.team2SeriesWins}`;
    seriesStatusNote =
      smashSeries.team1SeriesWins >= 4
        ? `${team1.name} won series 4-${smashSeries.team2SeriesWins}`
        : smashSeries.team2SeriesWins >= 4
        ? `${team2.name} won series 4-${smashSeries.team1SeriesWins}`
        : smashSeries.team1SeriesWins > smashSeries.team2SeriesWins
        ? `${team1.name} leads ${t1SeriesScore}-${t2SeriesScore}`
        : smashSeries.team2SeriesWins > smashSeries.team1SeriesWins
        ? `${team2.name} leads ${t2SeriesScore}-${t1SeriesScore}`
        : 'Series level';
  } else if (badmintonSeries) {
    t1SeriesScore = String(badmintonSeries.team1SeriesWins);
    t2SeriesScore = String(badmintonSeries.team2SeriesWins);
    seriesRuleLabel = '3-Game Series · First to 2 Wins';
    finalScoreText = `${badmintonSeries.team1SeriesWins} - ${badmintonSeries.team2SeriesWins}`;
    seriesStatusNote =
      badmintonSeries.team1SeriesWins >= 2
        ? `${team1.name} won series`
        : badmintonSeries.team2SeriesWins >= 2
        ? `${team2.name} won series`
        : badmintonSeries.team1SeriesWins > badmintonSeries.team2SeriesWins
        ? `${team1.name} leads ${t1SeriesScore}-${t2SeriesScore}`
        : badmintonSeries.team2SeriesWins > badmintonSeries.team1SeriesWins
        ? `${team2.name} leads ${t2SeriesScore}-${t1SeriesScore}`
        : 'Series level';
  } else if (footvolleySeries) {
    t1SeriesScore = String(footvolleySeries.team1SeriesWins);
    t2SeriesScore = String(footvolleySeries.team2SeriesWins);
    seriesRuleLabel = '3-Game Series · 25 Pts Each';
    finalScoreText = `${footvolleySeries.team1SeriesWins} - ${footvolleySeries.team2SeriesWins}`;
    seriesStatusNote =
      footvolleySeries.team1SeriesWins >= 2
        ? `${team1.name} won series`
        : footvolleySeries.team2SeriesWins >= 2
        ? `${team2.name} won series`
        : footvolleySeries.team1SeriesWins > footvolleySeries.team2SeriesWins
        ? `${team1.name} leads ${t1SeriesScore}-${t2SeriesScore}`
        : footvolleySeries.team2SeriesWins > footvolleySeries.team1SeriesWins
        ? `${team2.name} leads ${t2SeriesScore}-${t1SeriesScore}`
        : 'Series tied';
  } else if (tableTennisSeries) {
    t1SeriesScore = String(tableTennisSeries.team1SeriesWins);
    t2SeriesScore = String(tableTennisSeries.team2SeriesWins);
    seriesRuleLabel = '3-Game Series · 21 Pts Sets';
    finalScoreText = `${tableTennisSeries.team1SeriesWins} - ${tableTennisSeries.team2SeriesWins}`;
    seriesStatusNote =
      tableTennisSeries.team1SeriesWins >= 2
        ? `${team1.name} won series ${t1SeriesScore}-${t2SeriesScore}`
        : tableTennisSeries.team2SeriesWins >= 2
        ? `${team2.name} won series ${t2SeriesScore}-${t1SeriesScore}`
        : tableTennisSeries.team1SeriesWins > tableTennisSeries.team2SeriesWins
        ? `${team1.name} leads ${t1SeriesScore}-${t2SeriesScore}`
        : tableTennisSeries.team2SeriesWins > tableTennisSeries.team1SeriesWins
        ? `${team2.name} leads ${t2SeriesScore}-${t1SeriesScore}`
        : 'Series level 0-0';
  } else if (stumbleGuysSeries) {
    t1SeriesScore = String(stumbleGuysSeries.team1SeriesWins);
    t2SeriesScore = String(stumbleGuysSeries.team2SeriesWins);
    seriesRuleLabel = '5-Game Series · First to 3 Wins';
    finalScoreText = `${stumbleGuysSeries.team1SeriesWins} - ${stumbleGuysSeries.team2SeriesWins}`;
    seriesStatusNote =
      stumbleGuysSeries.team1SeriesWins >= 3
        ? `${team1.name} won series ${t1SeriesScore}-${t2SeriesScore}`
        : stumbleGuysSeries.team2SeriesWins >= 3
        ? `${team2.name} won series ${t2SeriesScore}-${t1SeriesScore}`
        : stumbleGuysSeries.team1SeriesWins > stumbleGuysSeries.team2SeriesWins
        ? `${team1.name} leads ${t1SeriesScore}-${t2SeriesScore}`
        : stumbleGuysSeries.team2SeriesWins > stumbleGuysSeries.team1SeriesWins
        ? `${team2.name} leads ${t2SeriesScore}-${t1SeriesScore}`
        : 'Series level 0-0';
  } else {
    t1SeriesScore = match.team1ScoreDisplay || '0';
    t2SeriesScore = match.team2ScoreDisplay || '0';
    seriesRuleLabel = match.subtitleTag;
    finalScoreText = match.team1ScoreDisplay && match.team2ScoreDisplay ? `${match.team1ScoreDisplay} - ${match.team2ScoreDisplay}` : '';
    seriesStatusNote = match.status === 'completed' ? 'Final Score' : 'Score';
  }

  const getBannerTheme = () => {
    switch (match.gameKey) {
      case 'cricket':
        return {
          bg: 'bg-gradient-to-b from-[#17202a] via-[#10141d] to-[#0c0e14]',
          accent: 'text-[#64b4ff]',
          subAccent: 'text-[#ff6b6b]',
          tag: 'Platinum',
          yearOrPts: '10 PTS',
        };
      case 'basketball':
        return {
          bg: 'bg-gradient-to-b from-[#2a1e17] via-[#1a1410] to-[#0c0e14]',
          accent: 'text-[#ff9f43]',
          subAccent: 'text-[#ffd32a]',
          tag: 'Platinum',
          yearOrPts: '10 PTS',
        };
      case 'stumble_guys':
        return {
          bg: 'bg-gradient-to-b from-[#22172a] via-[#16101d] to-[#0c0e14]',
          accent: 'text-[#a55eea]',
          subAccent: 'text-[#45aaf2]',
          tag: 'Gold',
          yearOrPts: '7 PTS',
        };
      case 'table_tennis':
        return {
          bg: 'bg-gradient-to-b from-[#13242a] via-[#0d171d] to-[#0c0e14]',
          accent: 'text-[#2bcbba]',
          subAccent: 'text-[#64b4ff]',
          tag: 'Gold',
          yearOrPts: '7 PTS',
        };
      case 'footvolley':
        return {
          bg: 'bg-gradient-to-b from-[#172a23] via-[#101d18] to-[#0c0e14]',
          accent: 'text-[#26de81]',
          subAccent: 'text-[#fed330]',
          tag: 'Gold',
          yearOrPts: '7 PTS',
        };
      case 'badminton':
        return {
          bg: 'bg-gradient-to-b from-[#171d2a] via-[#10141d] to-[#0c0e14]',
          accent: 'text-[#4b7bec]',
          subAccent: 'text-[#3867d6]',
          tag: 'Silver',
          yearOrPts: '5 PTS',
        };
      case 'smash_karts':
        return {
          bg: 'bg-gradient-to-b from-[#2a1717] via-[#1d1010] to-[#0c0e14]',
          accent: 'text-[#fc5c65]',
          subAccent: 'text-[#fd9644]',
          tag: 'Silver',
          yearOrPts: '5 PTS',
        };
      default:
        return {
          bg: 'bg-[#12151e]',
          accent: 'text-white',
          subAccent: 'text-slate-400',
          tag: 'Standard',
          yearOrPts: 'PTS',
        };
    }
  };

  const theme = getBannerTheme();

  return (
    <div className="figure-project flex flex-col transition-all duration-300">
      {/* 3D Flip Card Container */}
      <div className="card-flip-container w-full h-[250px] mb-4">
        <div className={`card-flip-inner ${isFlipped ? 'card-flipped' : ''}`}>
          {/* ======================================================== */}
          {/* FRONT SIDE: Editorial Michsky Artwork Banner             */}
          {/* ======================================================== */}
          <div
            onClick={() => setIsFlipped(true)}
            className={`card-face ${
              isCompleted
                ? 'bg-gradient-to-b from-[#0e2744] via-[#091a2e] to-[#06101d] border-sky-400/60 shadow-[0_0_35px_rgba(56,189,248,0.22)] ring-1 ring-sky-400/40 hover:border-sky-300'
                : `${theme.bg} border-white/[0.08] hover:border-white/25 shadow-lg`
            } p-5 flex flex-col justify-between cursor-pointer transition-all group`}
          >
            {/* Top Status */}
            <div className="flex items-center justify-between">
              <span className="text-2xl drop-shadow">{match.emoji}</span>
              <div>
                {match.status === 'live' && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-black/60 border border-red-500/40 px-2.5 py-0.5 rounded-full animate-pulse">
                    <Radio className="w-2.5 h-2.5" />
                    LIVE
                  </span>
                )}
                {match.status === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-sky-200 bg-sky-500/25 border border-sky-400/60 px-3 py-0.5 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.35)] backdrop-blur-md">
                    <CheckCircle2 className="w-3 h-3 text-sky-300" />
                    <span>Completed</span>
                  </span>
                )}
                {match.status === 'upcoming' && (
                  <span className="text-[10px] font-medium uppercase text-slate-400 bg-black/60 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Upcoming
                  </span>
                )}
              </div>
            </div>

            {/* Center Typography & Winner Information */}
            <div className="text-center my-auto transform group-hover:scale-105 transition-transform duration-500">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase">
                <span className={theme.subAccent}>{match.gameName.split(' ')[0]}</span>{' '}
                <span className={theme.accent}>
                  {match.gameName.split(' ').slice(1).join(' ')}
                </span>
              </div>
              <div className="text-[10px] font-medium tracking-[0.25em] text-slate-400 uppercase mt-1">
                {match.subtitleTag}
              </div>

              {/* Completed Event Winner Showcase */}
              {isCompleted && winningTeam && (
                <div className="mt-2.5 inline-flex flex-col items-center gap-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 text-xs shadow-[0_0_15px_rgba(56,189,248,0.2)] backdrop-blur-sm">
                    <Trophy className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                    <span className="font-bold text-white tracking-wide">
                      {winningTeam.name} Won
                    </span>
                    {finalScoreText && (
                      <span className="font-bold text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded text-[11px]">
                        {finalScoreText}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-300">
                    <span className="text-emerald-400 font-semibold">+{match.basePoints} PTS</span>
                    {match.consolationPoints > 0 && losingTeam && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="text-amber-300">+{match.consolationPoints} PTS {losingTeam.name}</span>
                      </>
                    )}
                    {match.mvpPlayerName && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="text-slate-200 font-light">MVP: {match.mvpPlayerName}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Front Status */}
            <div className="text-center pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                {theme.tag} · {theme.yearOrPts}
              </span>
              {isCompleted && winningTeam ? (
                <span className="text-[11px] text-sky-300 font-medium flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${match.winnerTeamId === 'team1' ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'}`} />
                  <span>{winningTeam.name} Claimed Event</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* BACK SIDE: EXACT Replica of image.png Scoreboard Layout  */}
          {/* ======================================================== */}
          <div
            onClick={(e) => {
              // Click background to flip back
              if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                setIsFlipped(false);
              }
            }}
            className="card-face card-back bg-[#0e121a] border border-white/20 p-5 flex flex-col justify-between shadow-2xl cursor-pointer"
          >
            {/* Top Bar on Back */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
              <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                {match.emoji} {match.gameName}
              </span>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
                {seriesRuleLabel}
              </span>
            </div>

            {/* CENTER: EXACT VISUAL REPLICA OF USER UPLOADED image.png */}
            <div className="my-auto py-2">
              <div className="grid grid-cols-2 items-center text-center max-w-[240px] mx-auto">
                {/* Team 1: Slate label on top, big red score below */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-normal tracking-wide">
                    {team1.name}
                  </div>
                  <div className="text-4xl sm:text-5xl font-light text-[#ff5c5c] leading-none select-none">
                    {t1SeriesScore}
                  </div>
                </div>

                {/* Team 2: Slate label on top, big cyan/blue score below */}
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-normal tracking-wide">
                    {team2.name}
                  </div>
                  <div className="text-4xl sm:text-5xl font-light text-[#00b4d8] leading-none select-none">
                    {t2SeriesScore}
                  </div>
                </div>
              </div>

              {/* Sub-note */}
              {seriesStatusNote && (
                <div className="text-center text-[11px] text-slate-400 mt-2 font-light">
                  {seriesStatusNote}
                </div>
              )}
            </div>

            {/* Bottom Actions on Back Side */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-2.5 h-2.5" />
                <span>Flip Back</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenScoreboard(match);
                }}
                className="px-3.5 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>See Individual Matches</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Line: Category —————— Pts */}
      <div className="flex items-center text-xs text-slate-400 mb-2">
        <span className="text-slate-300 uppercase tracking-wider">{theme.tag}</span>
        <div className="h-[1px] bg-white/20 flex-1 mx-3" />
        <span className="text-slate-400">{theme.yearOrPts}</span>
      </div>

      {/* Project Title with Animated Underline */}
      <div
        onClick={() => onOpenScoreboard(match)}
        className="flex items-baseline justify-between gap-2 cursor-pointer group/title"
      >
        <h3 className="text-xl sm:text-2xl font-normal text-white tracking-tight">
          <span className="underline-hover__target">{match.gameName}</span>
        </h3>
        <span className="text-xs text-slate-400 group-hover/title:text-white transition-colors">
          View Match →
        </span>
      </div>
    </div>
  );
};
