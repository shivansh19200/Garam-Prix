import { TestMatchInnings } from '../types/tournament';

/**
 * Formats a cricket innings score according to standard Google Cricket Test scorecard conventions.
 * If all out (10 wickets): "114"
 * If in progress / declared: "88/8" or "312/8 d"
 */
export function formatInningsScore(innings?: TestMatchInnings, isLive?: boolean): string {
  if (!innings) return '';
  const { runs, wickets, declared, overs } = innings;

  if (runs === 0 && wickets === 0) {
    return '';
  }

  let str = '';
  if (wickets >= 10) {
    str = `${runs}`;
  } else {
    str = `${runs}/${wickets}`;
  }

  if (declared) {
    str += ' d';
  }

  if (overs && isLive) {
    str += ` (${overs} ov)`;
  }

  return str;
}

/**
 * Combines 1st and 2nd innings into the Google scorecard format:
 * e.g. "114 & 66" or "88/8 & 45/4"
 */
export function formatMatchScoreDisplay(
  inn1?: TestMatchInnings,
  inn2?: TestMatchInnings,
  isLive?: boolean
): string {
  const s1 = formatInningsScore(inn1, isLive);
  const s2 = formatInningsScore(inn2, isLive);

  if (s1 && s2) {
    return `${s1} & ${s2}`;
  }
  if (s1) {
    return s1;
  }
  return '—';
}
