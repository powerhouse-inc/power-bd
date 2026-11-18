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
export type Reschedule =
  | { act: "NEXT_STEP"; documentId: string; stepId: string; dueDate: string }
  | { act: "MEETING"; documentId: string; interactionId: string; at: string }
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
  switch (item.due) {
    case "NEXT_STEP":
      return item.itemId
        ? {
            kind: "set",
            reschedule: {
              act: "NEXT_STEP",
              documentId,
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
        reschedule: { act: "MEETING", documentId, interactionId: item.itemId, at },
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
