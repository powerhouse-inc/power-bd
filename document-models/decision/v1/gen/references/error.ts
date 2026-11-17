export type ErrorCode =
  | "DUPLICATE_REFERENCE_ID"
  | "DUPLICATE_REFERENCE"
  | "REFERENCE_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateReferenceIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_REFERENCE_ID" as ErrorCode;
  constructor(message = "DuplicateReferenceIdError") {
    super(message);
  }
}

export class DuplicateReferenceError extends Error implements ReducerError {
  errorCode = "DUPLICATE_REFERENCE" as ErrorCode;
  constructor(message = "DuplicateReferenceError") {
    super(message);
  }
}

export class ReferenceNotFoundError extends Error implements ReducerError {
  errorCode = "REFERENCE_NOT_FOUND" as ErrorCode;
  constructor(message = "ReferenceNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddReference: { DuplicateReferenceIdError, DuplicateReferenceError },

  RemoveReference: { ReferenceNotFoundError },
};
