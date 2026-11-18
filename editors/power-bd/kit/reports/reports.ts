import type { LeadState } from "document-models/lead";
import { localTime } from "../overview/time.js";

type Status = LeadState["status"];

/** What the reports read from a lead: its state, and when its record was added and last changed. */
export type ReportLead = {
  id: string;
  name: string;
  kind: LeadState["kind"];
  owner: string | null;
  status: Status;
  parkedFrom: Status | null;
  statusReason: string | null;
  closedAt: string | null;
  /** When the lead was added: the record's creation. */
  createdAt: string;
  /** When the record last changed, whatever changed. */
  changedAt: string;
  /** Where the lead came from; absent on leads recorded before sources existed. */
  source?: LeadState["source"];
};

export type Period = "quarter" | "90days" | "all";

export const PERIODS: readonly { value: Period; label: string }[] = [
  { value: "quarter", label: "This quarter" },
  { value: "90days", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

/** Below this many, a share is not shown: two leads make no rate. */
export const MIN_SAMPLE = 3;

const DAY = 86_400_000;
const dayOf = (instant: string, zone: string) => localTime(instant, zone).day;
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);

/** The first day a period counts (`YYYY-MM-DD`, inclusive), or null for all time. */
export function periodStart(period: Period, today: string): string | null {
  if (period === "all") return null;
  if (period === "90days") {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 89);
    return d.toISOString().slice(0, 10);
  }
  const [y, m] = today.split("-").map(Number);
  const first = Math.floor((m - 1) / 3) * 3 + 1;
  return `${y}-${String(first).padStart(2, "0")}-01`;
}

const inPeriod = (instant: string | null, start: string | null, zone: string) =>
  instant !== null && (start === null || dayOf(instant, zone) >= start);

/** The statuses a lead passes through on the way to won, in order. */
export const FUNNEL_STAGES: readonly Status[] = [
  "TO_CONTACT",
  "IN_TOUCH",
  "MEETING_SET",
  "MET",
  "PROPOSAL",
  "WON",
];
const OPEN: readonly Status[] = ["TO_CONTACT", "IN_TOUCH", "MEETING_SET", "MET", "PROPOSAL"];

/** How far a lead got, as an index in FUNNEL_STAGES; null when the app does not know (lost, or parked without a stage). */
function reach(l: ReportLead): number | null {
  if (l.status === "LOST") return null;
  if (l.status === "PARKED")
    return l.parkedFrom ? FUNNEL_STAGES.indexOf(l.parkedFrom) : null;
  return FUNNEL_STAGES.indexOf(l.status);
}

export type FunnelStep = {
  status: Status;
  /** Leads that got at least this far. */
  reached: number;
  /** Of those that got to the stage before, the share that got this far; null for the first stage or below MIN_SAMPLE. */
  fromPrevious: number | null;
};

export type Funnel = {
  /** Leads added in the period. */
  entered: number;
  steps: FunnelStep[];
  /** Leads whose stage is not recorded: lost ones, and parked ones without a stage. */
  unknown: number;
};

/**
 * How far the leads added in a period got, and the share that went on from
 * each stage. A lost lead's stage is not recorded, so lost leads count as
 * entered but stay out of the steps. Investor leads stop at met, so the steps
 * into proposal and won count only the other kinds.
 */
export function funnel(
  leads: readonly ReportLead[],
  start: string | null,
  zone: string,
): Funnel {
  const cohort = leads.filter((l) => inPeriod(l.createdAt, start, zone));
  const known = cohort
    .map((l) => ({ l, at: reach(l) }))
    .filter((x): x is { l: ReportLead; at: number } => x.at !== null);
  const steps = FUNNEL_STAGES.map((status, k) => {
    const reached = known.filter((x) => x.at >= k).length;
    if (k === 0) return { status, reached, fromPrevious: null };
    const pool = k >= 4 ? known.filter((x) => x.l.kind !== "INVESTOR") : known;
    const before = pool.filter((x) => x.at >= k - 1).length;
    const after = pool.filter((x) => x.at >= k).length;
    return { status, reached, fromPrevious: before >= MIN_SAMPLE ? after / before : null };
  });
  return { entered: cohort.length, steps, unknown: cohort.length - known.length };
}

export type Outcomes = {
  won: number;
  lost: number;
  /** Won of won and lost, closed in the period; null below MIN_SAMPLE. */
  winRate: number | null;
  /** Median days from being added to won, for leads won in the period; null below MIN_SAMPLE. */
  medianDaysToWin: number | null;
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/** Leads won and lost in a period, by the day they were closed. */
export function outcomes(
  leads: readonly ReportLead[],
  start: string | null,
  zone: string,
): Outcomes {
  const closed = leads.filter(
    (l) => (l.status === "WON" || l.status === "LOST") && inPeriod(l.closedAt, start, zone),
  );
  const won = closed.filter((l) => l.status === "WON");
  const lost = closed.length - won.length;
  const days = won.map((l) =>
    Math.max(0, daysBetween(dayOf(l.createdAt, zone), dayOf(l.closedAt ?? l.createdAt, zone))),
  );
  return {
    won: won.length,
    lost,
    winRate: closed.length >= MIN_SAMPLE ? won.length / closed.length : null,
    medianDaysToWin: days.length >= MIN_SAMPLE ? median(days) : null,
  };
}

/** A reason with the lead it was given for. */
export type Reason = { leadId: string; leadName: string; text: string };

export type ReasonGroup = {
  label: string;
  /** True for one of the named themes; false for reasons grouped only by the same wording. */
  theme: boolean;
  reasons: Reason[];
};

/**
 * Themes a reason joins only when its words name one theme and no other:
 * "waiting for their budget round" names timing and budget, so it stays as
 * written. Kept short on purpose: a wrong grouping hides what was said.
 */
export const REASON_THEMES: readonly { label: string; words: readonly string[] }[] = [
  { label: "Budget or price", words: ["budget", "price", "pricing", "cost", "costs", "expensive", "afford"] },
  { label: "Timing", words: ["timing", "later", "not now", "next year", "next quarter", "postpone", "postponed", "on hold", "wait", "waiting"] },
  { label: "Chose someone else", words: ["competitor", "chose", "went with", "another vendor", "other vendor", "in-house", "in house"] },
  { label: "No response", words: ["no response", "no reply", "no answer", "unresponsive", "ghosted", "not responding"] },
  { label: "Not a fit", words: ["not a fit", "no fit", "not relevant", "not interested", "no need", "no interest"] },
];

const normal = (text: string) =>
  text.toLowerCase().replace(/\s+/g, " ").trim().replace(/^[\s.,;:!?"'()-]+|[\s.,;:!?"'()-]+$/g, "");
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const names = (word: string, text: string) => new RegExp(`(^|\\W)${escape(word)}(\\W|$)`).test(text);

/** Reasons grouped by theme where the wording is clear, else by the same wording; largest group first. */
export function groupReasons(reasons: readonly Reason[]): ReasonGroup[] {
  const groups = new Map<string, ReasonGroup>();
  for (const r of reasons) {
    const text = normal(r.text);
    if (text === "") continue;
    const themes = REASON_THEMES.filter((t) => t.words.some((w) => names(w, text)));
    const key = themes.length === 1 ? `theme:${themes[0].label}` : `text:${text}`;
    const group =
      groups.get(key) ??
      { label: themes.length === 1 ? themes[0].label : r.text.trim(), theme: themes.length === 1, reasons: [] };
    group.reasons.push({ ...r, text: r.text.trim() });
    groups.set(key, group);
  }
  return [...groups.values()].sort(
    (a, b) => b.reasons.length - a.reasons.length || a.label.localeCompare(b.label),
  );
}

/** Why leads closed in the period were lost. */
export const lostReasons = (leads: readonly ReportLead[], start: string | null, zone: string) =>
  groupReasons(
    leads
      .filter((l) => l.status === "LOST" && inPeriod(l.closedAt, start, zone))
      .map((l) => ({ leadId: l.id, leadName: l.name, text: l.statusReason ?? "" })),
  );

/** Why the leads parked now were parked: a parked lead keeps no date, so this is never limited to a period. */
export const parkedReasons = (leads: readonly ReportLead[]) =>
  groupReasons(
    leads
      .filter((l) => l.status === "PARKED")
      .map((l) => ({ leadId: l.id, leadName: l.name, text: l.statusReason ?? "" })),
  );

export type QuietStage = {
  status: Status;
  leads: { id: string; name: string; days: number }[];
};

/**
 * Open leads whose record has not changed for `days` or more, by status: where
 * deals go quiet. Any change counts, a note as much as a status, so a lead
 * listed here has had nothing at all for that long.
 */
export function quietLeads(
  leads: readonly ReportLead[],
  today: string,
  zone: string,
  days = 30,
): QuietStage[] {
  return OPEN.map((status) => ({
    status,
    leads: leads
      .filter((l) => l.status === status)
      .map((l) => ({ id: l.id, name: l.name, days: daysBetween(dayOf(l.changedAt, zone), today) }))
      .filter((l) => l.days >= days)
      .sort((a, b) => b.days - a.days || a.name.localeCompare(b.name)),
  })).filter((s) => s.leads.length > 0);
}

export type SplitRow = {
  key: string;
  /** Added in the period. */
  entered: number;
  /** Open now, whenever added. */
  open: number;
  /** Won and lost in the period. */
  won: number;
  lost: number;
  winRate: number | null;
};

/** The same counts per owner or per kind; the most active first. */
export function splitBy(
  leads: readonly ReportLead[],
  keyOf: (l: ReportLead) => string,
  start: string | null,
  zone: string,
): SplitRow[] {
  const rows = new Map<string, SplitRow>();
  for (const l of leads) {
    const key = keyOf(l);
    const row = rows.get(key) ?? { key, entered: 0, open: 0, won: 0, lost: 0, winRate: null };
    if (inPeriod(l.createdAt, start, zone)) row.entered++;
    if (OPEN.includes(l.status) || l.status === "PARKED") row.open++;
    if (inPeriod(l.closedAt, start, zone)) {
      if (l.status === "WON") row.won++;
      if (l.status === "LOST") row.lost++;
    }
    rows.set(key, row);
  }
  return [...rows.values()]
    .map((r) => ({ ...r, winRate: r.won + r.lost >= MIN_SAMPLE ? r.won / (r.won + r.lost) : null }))
    .sort((a, b) => b.entered + b.won + b.lost - (a.entered + a.won + a.lost) || a.key.localeCompare(b.key));
}

/** The same counts per source; "" for leads whose source is not recorded. */
export const bySource = (leads: readonly ReportLead[], start: string | null, zone: string): SplitRow[] =>
  splitBy(leads, (l) => l.source ?? "", start, zone);

/** A share as a whole percentage: "67%". */
export const percent = (share: number) => `${Math.round(share * 100)}%`;
