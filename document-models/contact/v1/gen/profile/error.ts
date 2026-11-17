export type ErrorCode = "INVALID_TAG" | "DUPLICATE_TAG" | "TAG_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidTagError extends Error implements ReducerError {
  errorCode = "INVALID_TAG" as ErrorCode;
  constructor(message = "InvalidTagError") {
    super(message);
  }
}

export class DuplicateTagError extends Error implements ReducerError {
  errorCode = "DUPLICATE_TAG" as ErrorCode;
  constructor(message = "DuplicateTagError") {
    super(message);
  }
}

export class TagNotFoundError extends Error implements ReducerError {
  errorCode = "TAG_NOT_FOUND" as ErrorCode;
  constructor(message = "TagNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddTag: { InvalidTagError, DuplicateTagError },

  RemoveTag: { TagNotFoundError },
};
