import type { DecisionImpact } from "../decision-impact/index.js";

const DAY = 86_400_000;
const dayOf = (value: string) => Date.parse(value.slice(0, 10));

/** An open decision whose decide-by day has passed. */
export function isOverdue(
  status: string,
  decideBy: string | null | undefined,
  today: string,
): boolean {
  return status === "OPEN" && !!decideBy && dayOf(decideBy) < dayOf(today);
}

export function daysOverdue(decideBy: string, today: string): number {
  return Math.max(0, Math.round((dayOf(today) - dayOf(decideBy)) / DAY));
}

/** Open first (overdue, then soonest, then undated), then answered, then withdrawn. */
export function sortDecisions<
  T extends { status: string; decideBy?: string | null },
>(list: readonly T[], today: string): T[] {
  const rank = (x: T) =>
    x.status === "OPEN"
      ? isOverdue(x.status, x.decideBy, today)
        ? 0
        : 1
      : x.status === "ANSWERED"
        ? 2
        : 3;
  const when = (x: T) => (x.decideBy ? dayOf(x.decideBy) : Infinity);
  return [...list].sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r) return r;
    const w = when(a) - when(b);
    return w === 0 || Number.isNaN(w) ? 0 : w < 0 ? -1 : 1;
  });
}

export type GatedRow = {
  key: string;
  id: string;
  name: string;
  sub: string;
  closed: boolean;
};

/** Everything the decision gates, one row per reason, each carrying the record to open. */
export function gatedRows(impact: DecisionImpact): GatedRow[] {
  const rows: GatedRow[] = [];
  for (const b of impact.blocked)
    rows.push({
      key: `b-${b.id}`,
      id: b.id,
      name: b.name,
      sub: "Blocked",
      closed: b.closed,
    });
  for (const c of impact.conditions)
    rows.push({
      key: `c-${c.conditionId}`,
      id: c.id,
      name: c.name,
      sub: `Condition: ${c.text}`,
      closed: c.closed,
    });
  for (const l of impact.leads)
    rows.push({
      key: `l-${l.id}`,
      id: l.id,
      name: l.name,
      sub: "Lead linked to this decision",
      closed: l.closed,
    });
  for (const o of impact.opportunities)
    rows.push({
      key: `o-${o.id}`,
      id: o.id,
      name: o.name,
      sub: "Funding opportunity linked to this decision",
      closed: o.closed,
    });
  for (const p of impact.proposals)
    rows.push({
      key: `p-${p.id}`,
      id: p.id,
      name: p.name,
      sub: "Proposal linked to this decision",
      closed: p.closed,
    });
  return rows;
}

/** How many records the decision gates (a record counts once). */
export function gatedTotal(impact: DecisionImpact): number {
  return new Set(gatedRows(impact).map((r) => r.id)).size;
}
