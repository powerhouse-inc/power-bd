export type ErrorCode =
  | "DUPLICATE_POSITIONING_ID"
  | "POSITIONING_NOT_FOUND"
  | "POSITIONING_RETIRED"
  | "POSITIONING_NOT_DRAFT"
  | "COMPARABLE_ALREADY_LINKED"
  | "COMPARABLE_NOT_LINKED"
  | "PROOF_CASE_NOT_FOUND"
  | "PROOF_CASE_ALREADY_LINKED"
  | "PROOF_CASE_NOT_LINKED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicatePositioningIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_POSITIONING_ID" as ErrorCode;
  constructor(message = "DuplicatePositioningIdError") {
    super(message);
  }
}

export class PositioningNotFoundError extends Error implements ReducerError {
  errorCode = "POSITIONING_NOT_FOUND" as ErrorCode;
  constructor(message = "PositioningNotFoundError") {
    super(message);
  }
}

export class PositioningRetiredError extends Error implements ReducerError {
  errorCode = "POSITIONING_RETIRED" as ErrorCode;
  constructor(message = "PositioningRetiredError") {
    super(message);
  }
}

export class PositioningNotDraftError extends Error implements ReducerError {
  errorCode = "POSITIONING_NOT_DRAFT" as ErrorCode;
  constructor(message = "PositioningNotDraftError") {
    super(message);
  }
}

export class ComparableAlreadyLinkedError
  extends Error
  implements ReducerError
{
  errorCode = "COMPARABLE_ALREADY_LINKED" as ErrorCode;
  constructor(message = "ComparableAlreadyLinkedError") {
    super(message);
  }
}

export class ComparableNotLinkedError extends Error implements ReducerError {
  errorCode = "COMPARABLE_NOT_LINKED" as ErrorCode;
  constructor(message = "ComparableNotLinkedError") {
    super(message);
  }
}

export class ProofCaseNotFoundError extends Error implements ReducerError {
  errorCode = "PROOF_CASE_NOT_FOUND" as ErrorCode;
  constructor(message = "ProofCaseNotFoundError") {
    super(message);
  }
}

export class ProofCaseAlreadyLinkedError extends Error implements ReducerError {
  errorCode = "PROOF_CASE_ALREADY_LINKED" as ErrorCode;
  constructor(message = "ProofCaseAlreadyLinkedError") {
    super(message);
  }
}

export class ProofCaseNotLinkedError extends Error implements ReducerError {
  errorCode = "PROOF_CASE_NOT_LINKED" as ErrorCode;
  constructor(message = "ProofCaseNotLinkedError") {
    super(message);
  }
}

export const errors = {
  AddPositioning: { DuplicatePositioningIdError },

  UpdatePositioning: { PositioningNotFoundError, PositioningRetiredError },

  ApprovePositioning: { PositioningNotFoundError, PositioningNotDraftError },

  RetirePositioning: { PositioningNotFoundError, PositioningRetiredError },

  LinkPositioningComparable: {
    PositioningNotFoundError,
    PositioningRetiredError,
    ComparableAlreadyLinkedError,
  },

  UnlinkPositioningComparable: {
    PositioningNotFoundError,
    PositioningRetiredError,
    ComparableNotLinkedError,
  },

  LinkPositioningProof: {
    PositioningNotFoundError,
    PositioningRetiredError,
    ProofCaseNotFoundError,
    ProofCaseAlreadyLinkedError,
  },

  UnlinkPositioningProof: {
    PositioningNotFoundError,
    PositioningRetiredError,
    ProofCaseNotLinkedError,
  },
};
