import { addDays } from "../overview/time.js";
import type { DueItem, DueKind } from "../overview/index.js";
import { daysBetween } from "./when.js";

/** What a due item is to the person reading: a date that will not move, a meeting, or their own next step. */
export type DueClass = "deadline" | "meeting" | "step";

const DUE_CLASS: Record<DueKind, DueClass> = {
  NEXT_STEP: "step",
  MEETING: "meeting",
  OPPORTUNITY_STEP: "deadline",
  DECIDE_BY: "deadline",
  EXPECTED_OPENING: "deadline",
  PROPOSAL_VALID_UNTIL: "deadline",
};

export const dueClass = (due: DueKind): DueClass => DUE_CLASS[due];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** One day of the "Coming up" strip. */
export type StripDay = {
  /** `YYYY-MM-DD`. */
  day: string;
  /** Day of the month. */
  date: number;
  weekday: (typeof WEEKDAYS)[number];
  weekend: boolean;
  today: boolean;
  /** A Monday after the first day: where a new week begins. */
  weekStart: boolean;
  /** Days from today. */
  distance: number;
  counts: Record<DueClass, number>;
  total: number;
};

/** Every day from today to the end of the due window, each with what is due on it by class. */
export function dueStrip(
  due: DueItem[],
  today: string,
  windowDays: number,
): StripDay[] {
  const days: StripDay[] = [];
  for (let i = 0; i <= windowDays; i++) {
    const day = addDays(today, i);
    const wd = new Date(`${day}T00:00:00Z`).getUTCDay();
    days.push({
      day,
      date: Number(day.slice(8)),
      weekday: WEEKDAYS[wd],
      weekend: wd === 0 || wd === 6,
      today: i === 0,
      weekStart: wd === 1 && i > 0,
      distance: i,
      counts: { deadline: 0, meeting: 0, step: 0 },
      total: 0,
    });
  }
  for (const d of due) {
    const at = daysBetween(today, d.day);
    const cell = at >= 0 ? days.at(at) : undefined;
    if (!cell) continue;
    cell.counts[dueClass(d.due)] += 1;
    cell.total += 1;
  }
  return days;
}

/** The three classes in the order their marks stack, with their words. */
export const DUE_CLASSES: { value: DueClass; one: string; many: string }[] = [
  { value: "deadline", one: "deadline", many: "deadlines" },
  { value: "meeting", one: "meeting", many: "meetings" },
  { value: "step", one: "next step", many: "next steps" },
];

/** What is due on a strip day, in words: "1 deadline, 2 next steps", or "nothing due". */
export function stripDayText(day: StripDay): string {
  const parts = DUE_CLASSES.filter((c) => day.counts[c.value] > 0).map(
    (c) =>
      `${day.counts[c.value]} ${day.counts[c.value] === 1 ? c.one : c.many}`,
  );
  return parts.length > 0 ? parts.join(", ") : "nothing due";
}

/** The marks of a strip day, deadlines first: at most three, and how many more there are. */
export function stripMarks(day: StripDay): { marks: DueClass[]; more: number } {
  const all = DUE_CLASSES.flatMap((c) =>
    Array.from({ length: day.counts[c.value] }, () => c.value),
  );
  return { marks: all.slice(0, 3), more: Math.max(all.length - 3, 0) };
}
