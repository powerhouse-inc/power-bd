export type ErrorCode =
  | "ORGANISATION_REQUIRED"
  | "INVESTOR_LEAD_LIMIT"
  | "OWNER_REQUIRED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class OrganisationRequiredError extends Error implements ReducerError {
  errorCode = "ORGANISATION_REQUIRED" as ErrorCode;
  constructor(message = "OrganisationRequiredError") {
    super(message);
  }
}

export class InvestorLeadLimitError extends Error implements ReducerError {
  errorCode = "INVESTOR_LEAD_LIMIT" as ErrorCode;
  constructor(message = "InvestorLeadLimitError") {
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
  SetLeadDetails: { OrganisationRequiredError, InvestorLeadLimitError },

  SetOwner: { OwnerRequiredError },
};
