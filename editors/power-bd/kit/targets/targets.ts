import type { BdSettingsState } from "document-models/bd-settings";
import type { ProposalState } from "document-models/proposal";
import { quarterOf } from "../forecast/index.js";
import { valueOf } from "../overview/proposals.js";
import { localTime } from "../overview/time.js";

// Settings stored before targets existed have no list, so the field may be empty.
export type Target = NonNullable<BdSettingsState["targets"]>[number];
export type TargetMetric = Target["metric"];
export const METRICS: readonly TargetMetric[] = ["MEETINGS_HELD", "PROPOSALS_SENT", "VALUE_PROPOSED", "LEADS_WON"];

/** The targets of settings stored before targets existed: none. */
export const targetsOf = (s: Pick<BdSettingsState, "targets"> | null | undefined): Target[] =>
  s?.targets ?? [];

/** "Q4 2026" for "2026-Q4". */
export const quarterLabel = (quarter: string): string => {
  const [year, q] = quarter.split("-");
  return `${q} ${year}`;
};

/** This quarter and the next ones: "2026-Q4", "2027-Q1", … */
export function quartersFrom(today: string, count: number): string[] {
  const [y, q] = quarterOf(today).split("-Q").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const n = q - 1 + i;
    return `${y + Math.floor(n / 4)}-Q${(n % 4) + 1}`;
  });
}

type Interaction = { kind: string; status: string; at?: string | null };
export type ActualsInput = {
  leads: readonly { state: { status: string; closedAt?: string | null; interactions: readonly Interaction[] } }[];
  opportunities: readonly { state: { interactions: readonly Interaction[] } }[];
  proposals: readonly { state: ProposalState }[];
};

export type Actual = {
  metric: TargetMetric;
  target: number | null;
  /** The count, or for value proposed the amount when it is in one currency. */
  actual: number;
  /** Value proposed per currency, never converted. */
  amounts: { currency: string; amount: number }[];
  /** Actual over target; null without a target, or when value proposed is in several currencies. */
  share: number | null;
};

/**
 * This quarter's actuals, from the records, beside its targets: meetings held
 * (held meetings on leads and funding), proposals sent and the value they
 * proposed (the lower end of a range), and leads won. Days are the team's.
 */
export function quarterActuals(input: ActualsInput, quarter: string, targets: readonly Target[], zone: string): Actual[] {
  const inQuarter = (at: string | null | undefined) => !!at && quarterOf(localTime(at, zone).day) === quarter;
  const meetings = [...input.leads, ...input.opportunities]
    .flatMap((r) => r.state.interactions)
    .filter((i) => i.kind === "MEETING" && i.status === "HELD" && inQuarter(i.at)).length;
  const sent = input.proposals.filter((p) => inQuarter(p.state.sentAt));
  const amounts = new Map<string, number>();
  for (const { state: p } of sent) {
    const v = p.currency ? valueOf(p) : null;
    if (v && p.currency) amounts.set(p.currency, Math.round(((amounts.get(p.currency) ?? 0) + v.low) * 100) / 100);
  }
  const won = input.leads.filter((l) => l.state.status === "WON" && inQuarter(l.state.closedAt)).length;
  const counts: Record<TargetMetric, number> = {
    MEETINGS_HELD: meetings,
    PROPOSALS_SENT: sent.length,
    VALUE_PROPOSED: amounts.size === 1 ? [...amounts.values()][0] : 0,
    LEADS_WON: won,
  };
  return METRICS.map((metric) => {
    const target = targets.find((t) => t.quarter === quarter && t.metric === metric)?.value ?? null;
    const comparable = metric !== "VALUE_PROPOSED" || amounts.size <= 1;
    return {
      metric,
      target,
      actual: counts[metric],
      amounts: metric === "VALUE_PROPOSED" ? [...amounts].map(([currency, amount]) => ({ currency, amount })) : [],
      share: target && target > 0 && comparable ? counts[metric] / target : null,
    };
  });
}
