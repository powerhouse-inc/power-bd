export type ErrorCode =
  | "AMOUNT_NEEDS_CURRENCY"
  | "INVALID_FUNDING_RATE"
  | "OWNER_REQUIRED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class AmountNeedsCurrencyError extends Error implements ReducerError {
  errorCode = "AMOUNT_NEEDS_CURRENCY" as ErrorCode;
  constructor(message = "AmountNeedsCurrencyError") {
    super(message);
  }
}

export class InvalidFundingRateError extends Error implements ReducerError {
  errorCode = "INVALID_FUNDING_RATE" as ErrorCode;
  constructor(message = "InvalidFundingRateError") {
    super(message);
  }
}

export class OwnerRequiredError extends Error implements ReducerError {
  errorCode = "OWNER_REQUIRED" as ErrorCode;
  constructor(message = "OwnerRequiredError") {
    super(message);
  }
}

export const errors = {
  SetOpportunityDetails: { AmountNeedsCurrencyError, InvalidFundingRateError },

  SetOwner: { OwnerRequiredError },
};
