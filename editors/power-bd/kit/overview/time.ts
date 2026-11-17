/** Calendar day and clock time of an instant in a time zone. Pure: no clock is read. */
export type LocalTime = { day: string; time: string };

export function localTime(instant: string, timeZone: string): LocalTime {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** The calendar day `days` after a `YYYY-MM-DD` day. */
export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The calendar day (`YYYY-MM-DD`) of an instant in a time zone. */
export function today(now: string, timeZone: string): string {
  return localTime(now, timeZone).day;
}
