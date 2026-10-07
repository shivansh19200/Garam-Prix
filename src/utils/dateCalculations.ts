import { Match } from '../types/tournament';

// Month abbreviation map
const MONTH_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Extracts a comparable timestamp (in ms) from a match's scheduled date or time string.
 * Priority:
 * 1. match.scheduledDate (e.g. "2026-08-15")
 * 2. Parsed from match.scheduledTime (e.g. "Aug 15 · Day 1", "15 Aug", "Aug 15–Sep 02")
 * 3. Default fallback based on initial index
 */
export function getMatchScheduleTimestamp(match: Match): number {
  if (match.scheduledDate) {
    const parsed = Date.parse(match.scheduledDate);
    if (!isNaN(parsed)) return parsed;
  }

  const timeStr = match.scheduledTime || '';

  // Match pattern like "Aug 15" or "Sep 02"
  const monthDayMatch = timeStr.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(\d{1,2})/i
  );
  if (monthDayMatch) {
    const monthKey = monthDayMatch[1].slice(0, 3).toLowerCase();
    const day = parseInt(monthDayMatch[2], 10);
    const month = MONTH_MAP[monthKey] ?? 7;
    return new Date(2026, month, day).getTime();
  }

  // Match pattern like "15 Aug" or "22-26 Aug"
  const dayMonthMatch = timeStr.match(
    /(\d{1,2})(?:[–-]\d{1,2})?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
  );
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const monthKey = dayMonthMatch[2].slice(0, 3).toLowerCase();
    const month = MONTH_MAP[monthKey] ?? 7;
    return new Date(2026, month, day).getTime();
  }

  // Match Day X pattern like "Day 1", "Day 2"
  const dayIndexMatch = timeStr.match(/Day\s*(\d+)/i);
  if (dayIndexMatch) {
    const dayOffset = parseInt(dayIndexMatch[1], 10);
    return new Date(2026, 7, 14 + dayOffset).getTime();
  }

  // Fallback to stable default order based on gameKey
  const defaultOrder: Record<string, number> = {
    smash_karts: 1,
    table_tennis: 2,
    stumble_guys: 3,
    footvolley: 4,
    badminton: 5,
    basketball: 6,
    cricket: 7,
  };

  const order = defaultOrder[match.gameKey] || 99;
  return new Date(2026, 7, 14 + order).getTime();
}

/**
 * Automatically sorts matches in chronological order based on their scheduled dates.
 */
export function sortMatchesBySchedule(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const tsA = getMatchScheduleTimestamp(a);
    const tsB = getMatchScheduleTimestamp(b);
    if (tsA !== tsB) return tsA - tsB;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Format a date string (e.g. "2026-08-20") into readable Garam Prix banner text (e.g. "Aug 20")
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parsed.getMonth()]} ${parsed.getDate()}`;
}
