import type { OpportunityStatusOperations } from "document-models/opportunity/v1";
import {
  BlockerRequiredError,
  ClosingReasonRequiredError,
  DeciderRequiredError,
  DecisionReasonRequiredError,
  GoNoGoDecisionRequiredError,
  GoNoGoNotAllowedError,
  InvalidStatusMoveError,
  NotBlockedError,
  NotPreparingError,
  OpportunityClosedError,
  OwnerRequiredError,
  SubmissionRequiredError,
} from "../../gen/status/error.js";

type Status = Parameters<
  OpportunityStatusOperations["setOpportunityStatusOperation"]
>[0]["status"];

const CLOSED: Status[] = ["AWARDED", "REJECTED", "WITHDRAWN", "NO_GO"];

/** The moves by hand. Preparing for the first time and no-go are not here: only the decision reaches them. */
const MOVES: Partial<Record<Status, Status[]>> = {
  WATCHING: ["TO_EVALUATE"],
  TO_EVALUATE: ["WATCHING", "DECIDING"],
  DECIDING: ["TO_EVALUATE", "WATCHING"],
  PREPARING: ["SUBMITTED", "WITHDRAWN"],
  SUBMITTED: ["NEXT_STAGE", "AWARDED", "REJECTED", "WITHDRAWN"],
  NEXT_STAGE: ["NEXT_STAGE", "PREPARING", "AWARDED", "REJECTED", "WITHDRAWN"],
};

const NEEDS_OWNER = "An opportunity past to evaluate needs an owner";

export const opportunityStatusOperations: OpportunityStatusOperations = {
  setOpportunityStatusOperation(state, action) {
    const { status, reason, changedAt } = action.input;
    const from = state.status;
    if (CLOSED.includes(from))
      throw new OpportunityClosedError("A closed opportunity is final");
    if (
      status === "NO_GO" ||
      (status === "PREPARING" &&
        (from === "TO_EVALUATE" || from === "DECIDING"))
    )
      throw new GoNoGoDecisionRequiredError(
        "Preparing for the first time and no-go are reached only through the go-or-no-go decision",
      );
    if (!MOVES[from]?.includes(status))
      throw new InvalidStatusMoveError(
        `An opportunity cannot move from ${from} to ${status}`,
      );
    if (status !== "WATCHING" && status !== "TO_EVALUATE" && !state.owner)
      throw new OwnerRequiredError(NEEDS_OWNER);
    if (
      from === "PREPARING" &&
      status === "SUBMITTED" &&
      !state.submissions.some((s) => !s.outcome)
    )
      throw new SubmissionRequiredError(
        "Submitting needs a submission that has no outcome yet",
      );
    const closing = status === "REJECTED" || status === "WITHDRAWN";
    if (closing && !reason?.trim())
      throw new ClosingReasonRequiredError(
        "A rejected or withdrawn opportunity needs a reason",
      );

    const closes = closing || status === "AWARDED";
    state.status = status;
    state.statusReason = closes ? (reason ?? null) : null;
    state.closedAt = closes ? changedAt : null;
    if (from === "PREPARING") state.blocked = null;
  },
  decideGoNoGoOperation(state, action) {
    const { id, decision, decidedBy, reason, attemptsLeft, decidedAt } =
      action.input;
    if (state.status !== "TO_EVALUATE" && state.status !== "DECIDING")
      throw new GoNoGoNotAllowedError(
        "Go or no-go is decided while the opportunity is to evaluate or deciding",
      );
    if (!state.owner) throw new OwnerRequiredError(NEEDS_OWNER);
    if (!decidedBy)
      throw new DeciderRequiredError(
        "The go-or-no-go decision needs a decider",
      );
    if (!reason.trim())
      throw new DecisionReasonRequiredError(
        "The go-or-no-go decision needs a reason",
      );

    state.goNoGoDecisions.push({
      id,
      decision,
      decidedBy,
      reason,
      attemptsLeft: attemptsLeft ?? null,
      decidedAt,
    });
    if (decision === "GO") {
      state.status = "PREPARING";
    } else {
      state.status = "NO_GO";
      state.statusReason = reason;
      state.closedAt = decidedAt;
    }
  },
  setBlockedOperation(state, action) {
    const { decisionId, text } = action.input;
    if (state.status !== "PREPARING")
      throw new NotPreparingError(
        "An opportunity can be blocked only while preparing",
      );
    if (!decisionId && !text?.trim())
      throw new BlockerRequiredError("Blocked must name a decision or a text");
    state.blocked = { decisionId: decisionId ?? null, text: text ?? null };
  },
  clearBlockedOperation(state) {
    if (!state.blocked)
      throw new NotBlockedError("The opportunity is not blocked");
    state.blocked = null;
  },
  setDecideByOperation(state, action) {
    state.decideBy = action.input.decideBy ?? null;
  },
  setExpectedOpeningOperation(state, action) {
    state.expectedOpening = action.input.expectedOpening ?? null;
  },
};
