import type { OpportunityState } from "document-models/opportunity";
import type { Record_ } from "./types.js";

type Opp = Record_<OpportunityState>;

/** Unsuccessful outcomes at any step, plus withdrawn ones when the limit counts them. */
const spent = (s: OpportunityState, withdrawnCounts: boolean) =>
  s.submissions.filter((sub) => {
    const result = sub.outcome?.result;
    return (
      result === "UNSUCCESSFUL" || (withdrawnCounts && result === "WITHDRAWN")
    );
  }).length;

/**
 * Attempts left for an opportunity: its own limit minus the unsuccessful
 * outcomes across every opportunity with the same programme and applying
 * entity (itself included). `null` when no limit or applying entity is recorded.
 */
export function attemptsLeft(target: Opp, opportunities: Opp[]): number | null {
  const { attemptLimit, applyingEntity, programme } = target.state;
  if (!attemptLimit || !applyingEntity) return null;
  const used = opportunities
    .filter(
      (o) =>
        o.state.applyingEntity?.id === applyingEntity.id &&
        (o.state.programme?.id ?? null) === (programme?.id ?? null),
    )
    .reduce((n, o) => n + spent(o.state, attemptLimit.withdrawnCounts), 0);
  return Math.max(0, attemptLimit.max - used);
}
