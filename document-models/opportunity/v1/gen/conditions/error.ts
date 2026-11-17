export type ErrorCode =
  | "DUPLICATE_CONDITION_ID"
  | "SOURCE_REQUIRED"
  | "CHECKED_DATE_REQUIRED"
  | "CONDITION_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateConditionIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_CONDITION_ID" as ErrorCode;
  constructor(message = "DuplicateConditionIdError") {
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

export class ConditionNotFoundError extends Error implements ReducerError {
  errorCode = "CONDITION_NOT_FOUND" as ErrorCode;
  constructor(message = "ConditionNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddCondition: {
    DuplicateConditionIdError,
    SourceRequiredError,
    CheckedDateRequiredError,
  },

  UpdateCondition: {
    ConditionNotFoundError,
    SourceRequiredError,
    CheckedDateRequiredError,
  },

  RemoveCondition: { ConditionNotFoundError },

  MarkCondition: { ConditionNotFoundError },
};
