export type ErrorCode =
  | "OPPORTUNITY_CLOSED"
  | "GO_NO_GO_DECISION_REQUIRED"
  | "INVALID_STATUS_MOVE"
  | "OWNER_REQUIRED"
  | "CLOSING_REASON_REQUIRED"
  | "SUBMISSION_REQUIRED"
  | "GO_NO_GO_NOT_ALLOWED"
  | "DECIDER_REQUIRED"
  | "DECISION_REASON_REQUIRED"
  | "NOT_PREPARING"
  | "BLOCKER_REQUIRED"
  | "NOT_BLOCKED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class OpportunityClosedError extends Error implements ReducerError {
  errorCode = "OPPORTUNITY_CLOSED" as ErrorCode;
  constructor(message = "OpportunityClosedError") {
    super(message);
  }
}

export class GoNoGoDecisionRequiredError extends Error implements ReducerError {
  errorCode = "GO_NO_GO_DECISION_REQUIRED" as ErrorCode;
  constructor(message = "GoNoGoDecisionRequiredError") {
    super(message);
  }
}

export class InvalidStatusMoveError extends Error implements ReducerError {
  errorCode = "INVALID_STATUS_MOVE" as ErrorCode;
  constructor(message = "InvalidStatusMoveError") {
    super(message);
  }
}

export class OwnerRequiredError extends Error implements ReducerError {
  errorCode = "OWNER_REQUIRED" as ErrorCode;
  constructor(message = "OwnerRequiredError") {
    super(message);
  }
}

export class ClosingReasonRequiredError extends Error implements ReducerError {
  errorCode = "CLOSING_REASON_REQUIRED" as ErrorCode;
  constructor(message = "ClosingReasonRequiredError") {
    super(message);
  }
}

export class SubmissionRequiredError extends Error implements ReducerError {
  errorCode = "SUBMISSION_REQUIRED" as ErrorCode;
  constructor(message = "SubmissionRequiredError") {
    super(message);
  }
}

export class GoNoGoNotAllowedError extends Error implements ReducerError {
  errorCode = "GO_NO_GO_NOT_ALLOWED" as ErrorCode;
  constructor(message = "GoNoGoNotAllowedError") {
    super(message);
  }
}

export class DeciderRequiredError extends Error implements ReducerError {
  errorCode = "DECIDER_REQUIRED" as ErrorCode;
  constructor(message = "DeciderRequiredError") {
    super(message);
  }
}

export class DecisionReasonRequiredError extends Error implements ReducerError {
  errorCode = "DECISION_REASON_REQUIRED" as ErrorCode;
  constructor(message = "DecisionReasonRequiredError") {
    super(message);
  }
}

export class NotPreparingError extends Error implements ReducerError {
  errorCode = "NOT_PREPARING" as ErrorCode;
  constructor(message = "NotPreparingError") {
    super(message);
  }
}

export class BlockerRequiredError extends Error implements ReducerError {
  errorCode = "BLOCKER_REQUIRED" as ErrorCode;
  constructor(message = "BlockerRequiredError") {
    super(message);
  }
}

export class NotBlockedError extends Error implements ReducerError {
  errorCode = "NOT_BLOCKED" as ErrorCode;
  constructor(message = "NotBlockedError") {
    super(message);
  }
}

export const errors = {
  SetOpportunityStatus: {
    OpportunityClosedError,
    GoNoGoDecisionRequiredError,
    InvalidStatusMoveError,
    OwnerRequiredError,
    ClosingReasonRequiredError,
    SubmissionRequiredError,
  },

  DecideGoNoGo: {
    GoNoGoNotAllowedError,
    OwnerRequiredError,
    DeciderRequiredError,
    DecisionReasonRequiredError,
  },

  SetBlocked: { NotPreparingError, BlockerRequiredError },

  ClearBlocked: { NotBlockedError },
};
