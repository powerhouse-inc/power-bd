export type ErrorCode =
  | "SIZE_NOT_DRAFT"
  | "NOTHING_COUNTED"
  | "SOURCE_MISSING"
  | "SIZE_NOT_APPROVED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class SizeNotDraftError extends Error implements ReducerError {
  errorCode = "SIZE_NOT_DRAFT" as ErrorCode;
  constructor(message = "SizeNotDraftError") {
    super(message);
  }
}

export class NothingCountedError extends Error implements ReducerError {
  errorCode = "NOTHING_COUNTED" as ErrorCode;
  constructor(message = "NothingCountedError") {
    super(message);
  }
}

export class SourceMissingError extends Error implements ReducerError {
  errorCode = "SOURCE_MISSING" as ErrorCode;
  constructor(message = "SourceMissingError") {
    super(message);
  }
}

export class SizeNotApprovedError extends Error implements ReducerError {
  errorCode = "SIZE_NOT_APPROVED" as ErrorCode;
  constructor(message = "SizeNotApprovedError") {
    super(message);
  }
}

export const errors = {
  ApproveSize: { SizeNotDraftError, NothingCountedError, SourceMissingError },

  ReopenSize: { SizeNotApprovedError },
};
