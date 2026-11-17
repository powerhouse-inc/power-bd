export type ErrorCode =
  | "INVALID_ATTEMPT_LIMIT"
  | "SOURCE_REQUIRED"
  | "CHECKED_DATE_REQUIRED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidAttemptLimitError extends Error implements ReducerError {
  errorCode = "INVALID_ATTEMPT_LIMIT" as ErrorCode;
  constructor(message = "InvalidAttemptLimitError") {
    super(message);
  }
}

export class SourceRequiredError extends Error implements ReducerError {
  errorCode = "SOURCE_REQUIRED" as ErrorCode;
  constructor(message = "SourceRequiredError") {
    super(message);
  }
}

export class CheckedDateRequiredError extends Error implements ReducerError {
  errorCode = "CHECKED_DATE_REQUIRED" as ErrorCode;
  constructor(message = "CheckedDateRequiredError") {
    super(message);
  }
}

export const errors = {
  SetAttemptLimit: {
    InvalidAttemptLimitError,
    SourceRequiredError,
    CheckedDateRequiredError,
  },
};
