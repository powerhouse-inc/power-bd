import type { DatedItem } from "../overview/index.js";
import { addDays, zonedInstant } from "../overview/index.js";

/** The days a month view shows: whole weeks, Monday first, from the week of the 1st to the week of the last day. */
export function monthGrid(month: string): string[][] {
  const first = `${month}-01`;
  const last = addDays(addMonths(month, 1) + "-01", -1);
  const weeks: string[][] = [];
  for (let day = weekStart(first); day <= last; day = addDays(day, 7))
    weeks.push(weekDays(day));
  return weeks;
}

/** The Monday of a day's week. */
export function weekStart(day: string): string {
  const weekday = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
  return addDays(day, -weekday);
}

/** The seven days, Monday to Sunday, of a day's week. */
export function weekDays(day: string): string[] {
  const monday = weekStart(day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** `YYYY-MM` of a day. */
export const monthOf = (day: string): string => day.slice(0, 7);

/** The month `n` months after a `YYYY-MM` month. */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

/** Whole days from one `YYYY-MM-DD` to another. */
export const dayDistance = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** The items of each shown day: whole-day items first, then timed ones by our time. */
export function itemsByDay(
  items: readonly DatedItem[],
  days: readonly string[],
): Map<string, DatedItem[]> {
  const out = new Map(days.map((d) => [d, [] as DatedItem[]]));
  for (const i of items) out.get(i.day)?.push(i);
  for (const list of out.values())
    list.sort((a, b) => (a.ourTime ?? "").localeCompare(b.ourTime ?? ""));
  return out;
}

/** The change that moves an item to another day, as the record page makes it. */
/** The kind of record a next step or meeting sits in: both have them. */
export type Relationship = "lead" | "opportunity";

export type Reschedule =
  | {
      act: "NEXT_STEP";
      documentId: string;
      record: Relationship;
      stepId: string;
      dueDate: string;
    }
  | {
      act: "MEETING";
      documentId: string;
      record: Relationship;
      interactionId: string;
      at: string;
    }
  | {
      act: "DECIDE_BY";
      documentId: string;
      record: "opportunity" | "decision";
      decideBy: string;
    }
  | { act: "EXPECTED_OPENING"; documentId: string; expectedOpening: string };

/** What dropping an item on a day does. */
export type DayMove =
  | { kind: "stay" }
  | { kind: "set"; reschedule: Reschedule }
  | { kind: "confirm"; reschedule: Reschedule; reassurance: string }
  | { kind: "refused"; why: string; open: boolean };

const refused = (why: string, open = false): DayMove => ({
  kind: "refused",
  why,
  open,
});
/** A whole day as the records store it: 00:00 UTC. */
const wholeDay = (day: string) => `${day}T00:00:00.000Z`;

export const MEETING_REASSURANCE =
  "Only Power BD's record moves: nothing is sent to the people invited. Tell them yourself.";

/**
 * What putting an item on another day does. The team's own dates move: next
 * steps, decide-by dates and the expected opening at once, a meeting after a
 * confirmation, keeping its clock time in its own time zone. Dates someone
 * else set stay: a funder's step is changed on the opportunity's page when the
 * funder changes it, and a sent proposal's valid-until is what the client has.
 * Nothing is moved into the past.
 */
export function dayMove(item: DatedItem, to: string, today: string): DayMove {
  if (to === item.day) return { kind: "stay" };
  if (to < today) return refused("Pick today or a later day");
  const documentId = item.source.id;
  const record: Relationship =
    item.source.kind === "opportunity" ? "opportunity" : "lead";
  switch (item.due) {
    case "NEXT_STEP":
      return item.itemId
        ? {
            kind: "set",
            reschedule: {
              act: "NEXT_STEP",
              documentId,
              record,
              stepId: item.itemId,
              dueDate: wholeDay(to),
            },
          }
        : refused("Open the record to change this date", true);
    case "MEETING": {
      if (!item.itemId || !item.theirDay || !item.theirTime || !item.theirTimeZone)
        return refused("Open the record to change this meeting", true);
      const at = zonedInstant(
        addDays(item.theirDay, dayDistance(item.day, to)),
        item.theirTime,
        item.theirTimeZone,
      );
      return {
        kind: "confirm",
        reschedule: {
          act: "MEETING",
          documentId,
          record,
          interactionId: item.itemId,
          at,
        },
        reassurance: MEETING_REASSURANCE,
      };
    }
    case "DECIDE_BY":
      return {
        kind: "set",
        reschedule: {
          act: "DECIDE_BY",
          documentId,
          record: item.source.kind === "decision" ? "decision" : "opportunity",
          decideBy: wholeDay(to),
        },
      };
    case "EXPECTED_OPENING":
      return {
        kind: "set",
        reschedule: { act: "EXPECTED_OPENING", documentId, expectedOpening: wholeDay(to) },
      };
    case "OPPORTUNITY_STEP":
      return refused(
        "The funder sets this date. If it changed, change it on the opportunity's page",
        true,
      );
    case "PROPOSAL_VALID_UNTIL":
      return refused("The client has this date in the proposal they received");
  }
}

/** True when some day could take the item: it is worth picking up. */
export const canReschedule = (item: DatedItem, today: string): boolean =>
  dayMove(item, addDays(item.day < today ? today : item.day, 1), today).kind !== "refused";

/** One short line for a day while an item is over it: what a drop does, or why it is refused. */
export function dayHint(move: DayMove): string {
  switch (move.kind) {
    case "stay":
      return "";
    case "set":
      return "Moves here";
    case "confirm":
      return "Moves here · asks to confirm";
    case "refused":
      return move.why;
  }
}

/** An item's line on a day: the step or meeting itself, or what the date is for and whose it is. */
export function itemLine(item: DatedItem): string {
  const name = item.source.name || "Untitled";
  switch (item.due) {
    case "NEXT_STEP":
    case "MEETING":
      return item.label;
    case "OPPORTUNITY_STEP":
      return `${item.label}: ${name}`;
    case "DECIDE_BY":
      return `Decide: ${name}`;
    case "EXPECTED_OPENING":
      return `Opens: ${name}`;
    case "PROPOSAL_VALID_UNTIL":
      return `Valid until: ${name}`;
  }
}

/** True for a next step whose day has passed: it is late, not just due. */
export const isLate = (item: DatedItem, today: string): boolean =>
  item.due === "NEXT_STEP" && item.day < today;

const utc = (day: string) => new Date(`${day}T00:00:00Z`);

/** "November 2026". */
export const monthTitle = (month: string): string =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(utc(`${month}-01`));

/** "16 – 22 Nov 2026", or "30 Nov – 6 Dec 2026" across months. */
export function weekTitle(days: readonly string[]): string {
  const first = days[0], last = days[days.length - 1];
  const fmt = (day: string, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { ...o, timeZone: "UTC" }).format(utc(day));
  const end = fmt(last, { day: "numeric", month: "short", year: "numeric" });
  const start = first.slice(0, 7) === last.slice(0, 7)
    ? fmt(first, { day: "numeric" })
    : first.slice(0, 4) === last.slice(0, 4)
      ? fmt(first, { day: "numeric", month: "short" })
      : fmt(first, { day: "numeric", month: "short", year: "numeric" });
  return `${start} – ${end}`;
}

/** A record something can be added to from the calendar. */
export type Addable = { id: string; name: string; kind: Relationship };

/** The open leads and funding opportunities, by name: where a next step or meeting can be added. */
export function addableRecords(input: {
  leads: readonly { id: string; state: { name?: string | null; status: string } }[];
  opportunities: readonly { id: string; state: { name?: string | null; status: string } }[];
}): Addable[] {
  const closedLead = new Set(["WON", "LOST"]);
  const closedOpp = new Set(["AWARDED", "REJECTED", "WITHDRAWN", "NO_GO"]);
  const byName = (a: Addable, b: Addable) => a.name.localeCompare(b.name);
  return [
    ...input.leads
      .filter((l) => !closedLead.has(l.state.status))
      .map((l) => ({ id: l.id, name: l.state.name || "Untitled lead", kind: "lead" as const }))
      .sort(byName),
    ...input.opportunities
      .filter((o) => !closedOpp.has(o.state.status))
      .map((o) => ({ id: o.id, name: o.state.name || "Untitled opportunity", kind: "opportunity" as const }))
      .sort(byName),
  ];
}
