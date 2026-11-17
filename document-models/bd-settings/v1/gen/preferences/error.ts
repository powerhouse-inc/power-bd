export type ErrorCode =
  | "INVALID_TIME_ZONE"
  | "INVALID_DUE_WINDOW"
  | "VAULT_DRIVE_REQUIRED"
  | "INVALID_RETENTION";

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

export const errors = {
  SetTimeZone: { InvalidTimeZoneError },

  SetDueWindow: { InvalidDueWindowError },

  SetVaultDrive: { VaultDriveRequiredError },

  SetRetention: { InvalidRetentionError },
};
