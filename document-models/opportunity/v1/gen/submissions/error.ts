export type ErrorCode =
  | "DUPLICATE_SUBMISSION_ID"
  | "STEP_NOT_FOUND"
  | "SUBMISSION_NOT_FOUND"
  | "OUTCOME_ALREADY_RECORDED"
  | "AMOUNT_NEEDS_CURRENCY";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateSubmissionIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_SUBMISSION_ID" as ErrorCode;
  constructor(message = "DuplicateSubmissionIdError") {
    super(message);
  }
}

export class StepNotFoundError extends Error implements ReducerError {
  errorCode = "STEP_NOT_FOUND" as ErrorCode;
  constructor(message = "StepNotFoundError") {
    super(message);
  }
}

export class SubmissionNotFoundError extends Error implements ReducerError {
  errorCode = "SUBMISSION_NOT_FOUND" as ErrorCode;
  constructor(message = "SubmissionNotFoundError") {
    super(message);
  }
}

export class OutcomeAlreadyRecordedError extends Error implements ReducerError {
  errorCode = "OUTCOME_ALREADY_RECORDED" as ErrorCode;
  constructor(message = "OutcomeAlreadyRecordedError") {
    super(message);
  }
}

export class AmountNeedsCurrencyError extends Error implements ReducerError {
  errorCode = "AMOUNT_NEEDS_CURRENCY" as ErrorCode;
  constructor(message = "AmountNeedsCurrencyError") {
    super(message);
  }
}

export const errors = {
  MarkSubmission: { DuplicateSubmissionIdError, StepNotFoundError },

  RecordSubmissionOutcome: {
    SubmissionNotFoundError,
    OutcomeAlreadyRecordedError,
    AmountNeedsCurrencyError,
  },
};
