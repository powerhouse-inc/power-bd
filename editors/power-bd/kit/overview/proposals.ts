import { computeProposalTotals } from "../proposal-totals/proposal-totals.js";
import type { ProposalState } from "document-models/proposal";
import type { LeadValue, LiveProposal, Record_ } from "./types.js";

/** Live proposals are those that are sent or accepted. */
export const isLiveProposal = (p: ProposalState): boolean =>
  p.status === "SENT" || p.status === "ACCEPTED";

/** The chosen option's total of an accepted proposal; the range across options of any other. Null without a price. */
export function valueOf(p: ProposalState): { low: number; high: number } | null {
  const totals = computeProposalTotals(p);
  if (p.status === "ACCEPTED") {
    const chosen = totals.options.find((o) => o.optionId === p.chosenOptionId);
    return chosen ? { low: chosen.fixedTotal, high: chosen.fixedTotal } : null;
  }
  return totals.range
    ? { low: totals.range.lowest, high: totals.range.highest }
    : null;
}

/** Each lead's live proposals and its value per currency. */
export function buildProposals(proposals: Record_<ProposalState>[]): {
  leadValues: Record<string, LeadValue[]>;
  liveProposals: Record<string, LiveProposal[]>;
} {
  const live: Record<string, LiveProposal[]> = {};
  const sums = new Map<string, Map<string, { low: number; high: number }>>();
  for (const { id, state: p } of proposals) {
    if (!p.leadId || !isLiveProposal(p)) continue;
    (live[p.leadId] ??= []).push({
      id,
      title: p.title ?? "",
      status: p.status,
    });
    const v = p.currency ? valueOf(p) : null;
    if (!v || !p.currency) continue;
    const byCurrency =
      sums.get(p.leadId) ?? new Map<string, { low: number; high: number }>();
    const sum = byCurrency.get(p.currency) ?? { low: 0, high: 0 };
    byCurrency.set(p.currency, {
      low: Math.round((sum.low + v.low) * 100) / 100,
      high: Math.round((sum.high + v.high) * 100) / 100,
    });
    sums.set(p.leadId, byCurrency);
  }
  const values: Record<string, LeadValue[]> = {};
  for (const [leadId, byCurrency] of sums)
    values[leadId] = [...byCurrency].map(([currency, s]) => ({
      currency,
      amount: s.low,
      ...(s.high !== s.low ? { upper: s.high } : {}),
    }));
  return { leadValues: values, liveProposals: live };
}
