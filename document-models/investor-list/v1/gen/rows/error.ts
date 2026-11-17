export type ErrorCode =
  | "REPEATED_ROW_ID"
  | "DUPLICATE_ROW_ID"
  | "ROW_NAME_REQUIRED"
  | "ROW_NOT_FOUND"
  | "ROW_ENGAGED"
  | "EXCLUSION_REASON_REQUIRED"
  | "COMPARABLE_ALREADY_LINKED"
  | "COMPARABLE_NOT_LINKED"
  | "ORGANISATION_REQUIRED"
  | "LEAD_REQUIRED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class RepeatedRowIdError extends Error implements ReducerError {
  errorCode = "REPEATED_ROW_ID" as ErrorCode;
  constructor(message = "RepeatedRowIdError") {
    super(message);
  }
}

export class DuplicateRowIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_ROW_ID" as ErrorCode;
  constructor(message = "DuplicateRowIdError") {
    super(message);
  }
}

export class RowNameRequiredError extends Error implements ReducerError {
  errorCode = "ROW_NAME_REQUIRED" as ErrorCode;
  constructor(message = "RowNameRequiredError") {
    super(message);
  }
}

export class RowNotFoundError extends Error implements ReducerError {
  errorCode = "ROW_NOT_FOUND" as ErrorCode;
  constructor(message = "RowNotFoundError") {
    super(message);
  }
}

export class RowEngagedError extends Error implements ReducerError {
  errorCode = "ROW_ENGAGED" as ErrorCode;
  constructor(message = "RowEngagedError") {
    super(message);
  }
}

export class ExclusionReasonRequiredError
  extends Error
  implements ReducerError
{
  errorCode = "EXCLUSION_REASON_REQUIRED" as ErrorCode;
  constructor(message = "ExclusionReasonRequiredError") {
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

export class OrganisationRequiredError extends Error implements ReducerError {
  errorCode = "ORGANISATION_REQUIRED" as ErrorCode;
  constructor(message = "OrganisationRequiredError") {
    super(message);
  }
}

export class LeadRequiredError extends Error implements ReducerError {
  errorCode = "LEAD_REQUIRED" as ErrorCode;
  constructor(message = "LeadRequiredError") {
    super(message);
  }
}

export const errors = {
  AddRows: { RepeatedRowIdError, DuplicateRowIdError, RowNameRequiredError },

  UpdateRow: { RowNotFoundError, RowEngagedError, RowNameRequiredError },

  ShortlistRow: { RowNotFoundError, RowEngagedError },

  ExcludeRow: {
    RowNotFoundError,
    RowEngagedError,
    ExclusionReasonRequiredError,
  },

  RelistRow: { RowNotFoundError, RowEngagedError },

  SetRowThesis: { RowNotFoundError, RowEngagedError },

  LinkRowComparable: {
    RowNotFoundError,
    RowEngagedError,
    ComparableAlreadyLinkedError,
  },

  UnlinkRowComparable: {
    RowNotFoundError,
    RowEngagedError,
    ComparableNotLinkedError,
  },

  MarkRowEngaged: {
    RowNotFoundError,
    RowEngagedError,
    OrganisationRequiredError,
    LeadRequiredError,
  },

  RemoveRow: { RowNotFoundError, RowEngagedError },
};
