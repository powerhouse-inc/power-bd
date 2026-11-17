import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";

/**
 * The decisions that gate a record. A lead is gated by its decision references;
 * an opportunity by its blocked decision and by each condition's decision ids.
 * One rule, used by what's slipping and by decision impact.
 */
export function gatingDecisions(kind: "lead", s: LeadState): string[];
export function gatingDecisions(
  kind: "opportunity",
  s: OpportunityState,
): string[];
export function gatingDecisions(
  kind: "lead" | "opportunity",
  s: LeadState | OpportunityState,
): string[] {
  if (kind === "lead")
    return s.references
      .filter((r) => r.kind === "DECISION")
      .map((r) => r.documentId);
  const o = s as OpportunityState;
  return [
    o.blocked?.decisionId,
    ...o.conditions.flatMap((c) => c.decisionIds),
  ].filter((x): x is string => !!x);
}
