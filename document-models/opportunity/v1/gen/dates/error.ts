export type ErrorCode =
  | "DUPLICATE_STEP_ID"
  | "INVALID_TIME_ZONE"
  | "SOURCE_REQUIRED"
  | "CHECKED_DATE_REQUIRED"
  | "STEP_NOT_FOUND"
  | "STEP_IN_USE"
  | "NOT_ACUT_OFF";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateStepIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_STEP_ID" as ErrorCode;
  constructor(message = "DuplicateStepIdError") {
    super(message);
  }
}

export class InvalidTimeZoneError extends Error implements ReducerError {
  errorCode = "INVALID_TIME_ZONE" as ErrorCode;
  constructor(message = "InvalidTimeZoneError") {
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

export class StepNotFoundError extends Error implements ReducerError {
  errorCode = "STEP_NOT_FOUND" as ErrorCode;
  constructor(message = "StepNotFoundError") {
    super(message);
  }
}

export class StepInUseError extends Error implements ReducerError {
  errorCode = "STEP_IN_USE" as ErrorCode;
  constructor(message = "StepInUseError") {
    super(message);
  }
}

export class NotACutOffError extends Error implements ReducerError {
  errorCode = "NOT_ACUT_OFF" as ErrorCode;
  constructor(message = "NotACutOffError") {
    super(message);
  }
}

export const errors = {
  AddStep: {
    DuplicateStepIdError,
    InvalidTimeZoneError,
    SourceRequiredError,
    CheckedDateRequiredError,
  },

  UpdateStep: {
    StepNotFoundError,
    InvalidTimeZoneError,
    SourceRequiredError,
    CheckedDateRequiredError,
  },

  RemoveStep: { StepNotFoundError, StepInUseError },

  TargetCutOff: { StepNotFoundError, NotACutOffError },
};
