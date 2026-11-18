import type { LeadState } from "document-models/lead";
import type { LeadValue } from "../overview/types.js";

type Status = LeadState["status"];

/** The chance an open lead closes, by how far along it is: a default, not a measured rate. */
export const STAGE_CHANCE: Readonly<Partial<Record<Status, number>>> = {
  TO_CONTACT: 0.05,
  IN_TOUCH: 0.1,
  MEETING_SET: 0.2,
  MET: 0.3,
  PROPOSAL: 0.5,
};

/** "2026-Q4" for a day or an instant. */
export function quarterOf(day: string): string {
  const [year, month] = day.slice(0, 7).split("-").map(Number);
  return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
}

export type ForecastLead = {
  id: string;
  name: string;
  status: Status;
  kind: LeadState["kind"];
  expectedCloseDate?: string | null;
  /** Its live proposals' value per currency (the lower end of a range). */
  value: readonly LeadValue[];
};

export type ForecastRow = {
  /** The expected close quarter; null for leads with no close date. */
  quarter: string | null;
  currency: string;
  /** The sum of each lead's value times its stage's chance. */
  weighted: number;
  /** The same leads at full value. */
  full: number;
  leads: number;
};

export type Forecast = {
  rows: ForecastRow[];
  /** Open leads in the forecast: they have a proposal value. */
  counted: number;
  /** Open leads with no live proposal value yet: not in the totals. */
  noValue: { id: string; name: string }[];
  /** Counted leads without an expected close date, under "No close date". */
  noCloseDate: number;
  /** Investor leads bring funding, not revenue: never forecast. */
  investors: number;
};

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Open leads weighted by stage, from their live proposals, grouped by the
 * quarter they are expected to close in and by currency (never converted).
 * Won, lost and parked leads are not open; investor leads are left out.
 */
export function forecast(leads: readonly ForecastLead[]): Forecast {
  const rows = new Map<string, ForecastRow>();
  const out: Forecast = { rows: [], counted: 0, noValue: [], noCloseDate: 0, investors: 0 };
  for (const l of leads) {
    const chance = STAGE_CHANCE[l.status];
    if (chance === undefined) continue;
    if (l.kind === "INVESTOR") {
      out.investors++;
      continue;
    }
    if (l.value.length === 0) {
      out.noValue.push({ id: l.id, name: l.name });
      continue;
    }
    out.counted++;
    const quarter = l.expectedCloseDate ? quarterOf(l.expectedCloseDate) : null;
    if (!quarter) out.noCloseDate++;
    for (const v of l.value) {
      const key = `${quarter ?? "~"}|${v.currency}`;
      const row = rows.get(key) ?? { quarter, currency: v.currency, weighted: 0, full: 0, leads: 0 };
      row.weighted = round(row.weighted + v.amount * chance);
      row.full = round(row.full + v.amount);
      row.leads++;
      rows.set(key, row);
    }
  }
  // Quarters in order, then leads with no close date; currencies alphabetically within each.
  out.rows = [...rows.values()].sort(
    (a, b) =>
      Number(a.quarter === null) - Number(b.quarter === null) ||
      (a.quarter ?? "").localeCompare(b.quarter ?? "") ||
      a.currency.localeCompare(b.currency),
  );
  return out;
}
