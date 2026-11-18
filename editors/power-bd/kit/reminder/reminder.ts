/** A day a parked lead comes back, and how the team says it. */
export type ReminderChoice = { label: string; day: string };

/** `YYYY-MM-DD`, `months` calendar months after a day; a day the target month lacks becomes its last (31 Jan → 28 Feb). */
export function addMonthsToDay(day: string, months: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(d, last));
  return first.toISOString().slice(0, 10);
}

/** The quick picks for when a parked lead should come back: in one, three or six months. */
export function reminderChoices(today: string): ReminderChoice[] {
  return [1, 3, 6].map((months) => ({
    label: months === 1 ? "In 1 month" : `In ${months} months`,
    day: addMonthsToDay(today, months),
  }));
}

/**
 * The next step that brings a parked lead back: "Check back: <why it was
 * parked>", due on the chosen day (a whole day, stored at 00:00 UTC as the
 * app stores days), owned by the lead's owner so it shows as theirs.
 */
export function reminderStep(input: {
  id: string;
  reason: string;
  day: string;
  owner: string | null;
}): { id: string; text: string; owner?: string; dueDate: string } {
  const why = input.reason.trim();
  return {
    id: input.id,
    text: why ? `Check back: ${why}` : "Check back",
    ...(input.owner ? { owner: input.owner } : {}),
    dueDate: `${input.day}T00:00:00.000Z`,
  };
}

/**
 * Why only a parked lead gets a reminder: a lost lead is closed, and the
 * calendar, Coming up and the slipping checks leave closed leads out, so a
 * step on it would never show.
 */
export const LOST_REMINDER_NOTE =
  "A lost lead leaves the calendar. To check back later, park it with a reminder instead.";
