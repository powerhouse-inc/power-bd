/** How long ago and how far ahead, in the words the Overview uses. Pure: no clock is read. */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const count = (n: number, unit: string) =>
  `${n} ${unit}${n === 1 ? "" : "s"} ago`;

/** "just now", "45 minutes ago", "yesterday", "3 days ago", "2 weeks ago", "2 months ago"; nothing for an unreadable date. */
export function agoText(from: string, now: string): string {
  const ms = Date.parse(now) - Date.parse(from);
  if (Number.isNaN(ms)) return "";
  if (ms < MINUTE) return "just now";
  if (ms < HOUR) return count(Math.floor(ms / MINUTE), "minute");
  if (ms < DAY) return count(Math.floor(ms / HOUR), "hour");
  const days = Math.floor(ms / DAY);
  if (days === 1) return "yesterday";
  if (days < 14) return count(days, "day");
  if (days < 60) return count(Math.floor(days / 7), "week");
  return count(Math.floor(days / 30), "month");
}

/** Whole calendar days from one `YYYY-MM-DD` day to another; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY,
  );
}

/** Whole days a due day (`YYYY-MM-DD`, or a stored whole day) is past today; 0 for today and the days ahead. */
export function daysLate(due: string, today: string): number {
  return Math.max(0, daysBetween(due.slice(0, 10), today));
}

/** "1 day overdue", "7 days overdue": one wording for every date that has passed. */
export function overdueText(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"} overdue`;
}

/** "today", "tomorrow", "in 3 days", "yesterday", "7 days ago". */
export function relativeDay(day: string, today: string): string {
  const n = daysBetween(today, day);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
}
