export type ErrorCode =
  | "LEAD_CLOSED"
  | "LEAD_PARKED"
  | "PARK_LEAD_REQUIRED"
  | "OWNER_REQUIRED"
  | "ORGANISATION_REQUIRED"
  | "INVESTOR_LEAD_LIMIT"
  | "LOST_REASON_REQUIRED"
  | "LEAD_ALREADY_PARKED"
  | "PARK_REASON_REQUIRED"
  | "LEAD_NOT_PARKED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class LeadClosedError extends Error implements ReducerError {
  errorCode = "LEAD_CLOSED" as ErrorCode;
  constructor(message = "LeadClosedError") {
    super(message);
  }
}

export class LeadParkedError extends Error implements ReducerError {
  errorCode = "LEAD_PARKED" as ErrorCode;
  constructor(message = "LeadParkedError") {
    super(message);
  }
}

export class ParkLeadRequiredError extends Error implements ReducerError {
  errorCode = "PARK_LEAD_REQUIRED" as ErrorCode;
  constructor(message = "ParkLeadRequiredError") {
    super(message);
  }
}

export class OwnerRequiredError extends Error implements ReducerError {
  errorCode = "OWNER_REQUIRED" as ErrorCode;
  constructor(message = "OwnerRequiredError") {
    super(message);
  }
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

export class LostReasonRequiredError extends Error implements ReducerError {
  errorCode = "LOST_REASON_REQUIRED" as ErrorCode;
  constructor(message = "LostReasonRequiredError") {
    super(message);
  }
}

export class LeadAlreadyParkedError extends Error implements ReducerError {
  errorCode = "LEAD_ALREADY_PARKED" as ErrorCode;
  constructor(message = "LeadAlreadyParkedError") {
    super(message);
  }
}

export class ParkReasonRequiredError extends Error implements ReducerError {
  errorCode = "PARK_REASON_REQUIRED" as ErrorCode;
  constructor(message = "ParkReasonRequiredError") {
    super(message);
  }
}

export class LeadNotParkedError extends Error implements ReducerError {
  errorCode = "LEAD_NOT_PARKED" as ErrorCode;
  constructor(message = "LeadNotParkedError") {
    super(message);
  }
}

export const errors = {
  SetLeadStatus: {
    LeadClosedError,
    LeadParkedError,
    ParkLeadRequiredError,
    OwnerRequiredError,
    OrganisationRequiredError,
    InvestorLeadLimitError,
    LostReasonRequiredError,
  },

  ParkLead: {
    LeadClosedError,
    LeadAlreadyParkedError,
    OwnerRequiredError,
    OrganisationRequiredError,
    ParkReasonRequiredError,
  },

  UnparkLead: { LeadNotParkedError },
};
