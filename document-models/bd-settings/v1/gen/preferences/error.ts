export type ErrorCode =
  | "INVALID_TIME_ZONE"
  | "INVALID_DUE_WINDOW"
  | "VAULT_DRIVE_REQUIRED"
  | "INVALID_RETENTION"
  | "INVALID_QUARTER"
  | "NEGATIVE_TARGET"
  | "TARGET_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidTimeZoneError extends Error implements ReducerError {
  errorCode = "INVALID_TIME_ZONE" as ErrorCode;
  constructor(message = "InvalidTimeZoneError") {
    super(message);
  }
}

export class InvalidDueWindowError extends Error implements ReducerError {
  errorCode = "INVALID_DUE_WINDOW" as ErrorCode;
  constructor(message = "InvalidDueWindowError") {
    super(message);
  }
}

export class VaultDriveRequiredError extends Error implements ReducerError {
  errorCode = "VAULT_DRIVE_REQUIRED" as ErrorCode;
  constructor(message = "VaultDriveRequiredError") {
    super(message);
  }
}

export class InvalidRetentionError extends Error implements ReducerError {
  errorCode = "INVALID_RETENTION" as ErrorCode;
  constructor(message = "InvalidRetentionError") {
    super(message);
  }
}

export class InvalidQuarterError extends Error implements ReducerError {
  errorCode = "INVALID_QUARTER" as ErrorCode;
  constructor(message = "InvalidQuarterError") {
    super(message);
  }
}

export class NegativeTargetError extends Error implements ReducerError {
  errorCode = "NEGATIVE_TARGET" as ErrorCode;
  constructor(message = "NegativeTargetError") {
    super(message);
  }
}

export class TargetNotFoundError extends Error implements ReducerError {
  errorCode = "TARGET_NOT_FOUND" as ErrorCode;
  constructor(message = "TargetNotFoundError") {
    super(message);
  }
}

export const errors = {
  SetTimeZone: { InvalidTimeZoneError },

  SetDueWindow: { InvalidDueWindowError },

  SetVaultDrive: { VaultDriveRequiredError },

  SetRetention: { InvalidRetentionError },

  SetTarget: { InvalidQuarterError, NegativeTargetError },

  RemoveTarget: { TargetNotFoundError },
};
