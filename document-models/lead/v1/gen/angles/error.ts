export type ErrorCode = "DUPLICATE_ANGLE_ID" | "ANGLE_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateAngleIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_ANGLE_ID" as ErrorCode;
  constructor(message = "DuplicateAngleIdError") {
    super(message);
  }
}

export class AngleNotFoundError extends Error implements ReducerError {
  errorCode = "ANGLE_NOT_FOUND" as ErrorCode;
  constructor(message = "AngleNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddAngle: { DuplicateAngleIdError },

  UpdateAngle: { AngleNotFoundError },

  RemoveAngle: { AngleNotFoundError },
};
