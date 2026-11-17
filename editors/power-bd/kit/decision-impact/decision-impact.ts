import { gatingDecisions } from "../overview/gating.js";
import { isClosedLead, isClosedOpportunity } from "../overview/status.js";
import type { DecisionImpact, DecisionImpactInput } from "./types.js";

const CLOSED_PROPOSAL = ["ACCEPTED", "DECLINED", "WITHDRAWN", "SUPERSEDED"];

/**
 * What a decision gates. The gating follows the slipping rule of the overview:
 * a lead is gated by a decision reference, an opportunity by its blocked
 * decision or a condition's decision ids.
 */
export function decisionImpact(input: DecisionImpactInput): DecisionImpact {
  const d = input.decisionId;
  const refs = (r: { kind: string; documentId: string }[]) =>
    r.some((x) => x.kind === "DECISION" && x.documentId === d);
  const out: DecisionImpact = {
    conditions: [],
    blocked: [],
    leads: [],
    opportunities: [],
    proposals: [],
  };

  for (const { id, state: s } of input.leads)
    if (gatingDecisions("lead", s).includes(d))
      out.leads.push({
        id,
        name: s.name ?? "",
        closed: isClosedLead(s.status),
      });

  for (const { id, state: s } of input.opportunities) {
    const at = {
      id,
      name: s.name ?? "",
      closed: isClosedOpportunity(s.status),
    };
    if (gatingDecisions("opportunity", s).includes(d)) {
      if (s.blocked?.decisionId === d) out.blocked.push(at);
      for (const c of s.conditions)
        if (c.decisionIds.includes(d))
          out.conditions.push({ ...at, conditionId: c.id, text: c.text });
    }
    if (refs(s.references)) out.opportunities.push(at);
  }

  for (const { id, state: s } of input.proposals)
    if (refs(s.references))
      out.proposals.push({
        id,
        name: s.title ?? "",
        closed: CLOSED_PROPOSAL.includes(s.status),
      });

  return out;
}
