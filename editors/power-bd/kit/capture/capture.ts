import { localTime, zonedInstant } from "../overview/index.js";

/** A lead or funding opportunity something can be logged on. */
export type CaptureRecord = {
  id: string;
  kind: "lead" | "opportunity";
  name: string;
  owner: string | null;
  /** When the record last changed: recent ones come first. */
  changedAt: string | null;
};

const CLOSED_LEAD = new Set(["WON", "LOST"]);
const CLOSED_OPP = new Set(["AWARDED", "REJECTED", "WITHDRAWN", "NO_GO"]);

/** The open leads and funding opportunities, as capture lists them. */
export function captureRecords(input: {
  leads: readonly { id: string; changedAt: string | null; state: { name?: string | null; status: string; owner?: string | null } }[];
  opportunities: readonly { id: string; changedAt: string | null; state: { name?: string | null; status: string; owner?: string | null } }[];
}): CaptureRecord[] {
  return [
    ...input.leads
      .filter((l) => !CLOSED_LEAD.has(l.state.status))
      .map((l) => ({ id: l.id, kind: "lead" as const, name: l.state.name || "Untitled lead", owner: l.state.owner ?? null, changedAt: l.changedAt })),
    ...input.opportunities
      .filter((o) => !CLOSED_OPP.has(o.state.status))
      .map((o) => ({ id: o.id, kind: "opportunity" as const, name: o.state.name || "Untitled opportunity", owner: o.state.owner ?? null, changedAt: o.changedAt })),
  ];
}

/**
 * The records to offer, a few at a time: with nothing typed, mine first, then
 * the most recently changed; with a search, the names that match, those
 * starting with it first, then the same order.
 */
export function captureCandidates(
  records: readonly CaptureRecord[],
  me: string | null,
  query: string,
  limit = 6,
): CaptureRecord[] {
  const q = query.trim().toLowerCase();
  const mine = (r: CaptureRecord) => !!me && r.owner?.toLowerCase() === me.toLowerCase();
  const starts = (r: CaptureRecord) => !!q && r.name.toLowerCase().startsWith(q);
  return records
    .filter((r) => !q || r.name.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        Number(starts(b)) - Number(starts(a)) ||
        Number(mine(b)) - Number(mine(a)) ||
        (b.changedAt ?? "").localeCompare(a.changedAt ?? "") ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

/** The kinds of contact capture offers, in the order people pick them. */
export const CAPTURE_KINDS = ["MEETING", "CALL", "EMAIL", "MESSAGE"] as const;
export type CaptureKind = (typeof CAPTURE_KINDS)[number];

/** Now, as a day and a clock time in the team's time zone: when it happened, unless changed. */
export function captureNow(now: string, zone: string): { day: string; time: string } {
  return localTime(now, zone);
}

export type CaptureForm = {
  recordId: string | null;
  kind: CaptureKind;
  day: string;
  time: string;
  what: string;
  nextStep: string;
  nextDay: string;
  /** How it went, if the person says; it is saved with the interaction. */
  outcome: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;
};

/** What saving still waits for, in the order of the form; empty when it can be saved. */
export function captureMissing(form: CaptureForm): string[] {
  const missing: string[] = [];
  if (!form.recordId) missing.push("Pick a lead or funding opportunity");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.day) || !/^\d{2}:\d{2}$/.test(form.time)) missing.push("Say when it happened");
  if (form.what.trim() === "") missing.push("Say what happened, in a line");
  if (form.nextDay && form.nextStep.trim() === "") missing.push("Say what the next step is, or clear its date");
  return missing;
}

/** The interaction and the optional next step, as the record page adds them. Ids come from the caller. */
export function captureInputs(
  form: CaptureForm,
  zone: string,
  me: string | null,
  ids: { interaction: string; step: string },
) {
  const step = form.nextStep.trim();
  return {
    interaction: {
      id: ids.interaction,
      kind: form.kind,
      status: "HELD" as const,
      at: zonedInstant(form.day, form.time, zone),
      timeZone: zone,
      summary: form.what.trim(),
      teamMembers: me ? [me] : [],
    },
    step: step
      ? { id: ids.step, text: step, owner: me ?? undefined, dueDate: form.nextDay ? `${form.nextDay}T00:00:00.000Z` : undefined }
      : null,
    outcome: form.outcome ? { id: ids.interaction, outcome: form.outcome } : null,
  };
}
