export type { OnErrors } from "../useRun.js";
export { dispatchWith, useRun } from "../useRun.js";
export { ErrorLine } from "../ErrorLine.js";
export type Option = { value: string; label: string };

export const newDay = (day: string) => `${day}T00:00:00.000Z`;

/** "Fri 20 Nov" for a stored day or instant (a whole day is 00:00 UTC). */
export function fmtDay(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

/** "Wed 18 Nov, 15:00 Europe/Berlin" for an instant shown in its own time zone. */
export function fmtInstant(value: string, timeZone?: string | null): string {
  const tz = timeZone || "UTC";
  const text = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: tz,
  }).format(new Date(value));
  return `${text} ${tz}`;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

/** Section frame: title with a count, and an action at the right. */
export function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-section">
      <div className="pb-section__head">
        <h2 className="pb-section__title">
          {title}
          {count ? <span className="pb-count">{count}</span> : null}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}
