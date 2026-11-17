export type ErrorCode =
  | "PROPOSAL_NOT_DRAFT"
  | "DUPLICATE_PAYMENT_STEP_ID"
  | "INVALID_PERCENTAGE"
  | "PAYMENT_DATE_REQUIRED"
  | "PAYMENT_STEP_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class DuplicatePaymentStepIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_PAYMENT_STEP_ID" as ErrorCode;
  constructor(message = "DuplicatePaymentStepIdError") {
    super(message);
  }
}

export class InvalidPercentageError extends Error implements ReducerError {
  errorCode = "INVALID_PERCENTAGE" as ErrorCode;
  constructor(message = "InvalidPercentageError") {
    super(message);
  }
}

export class PaymentDateRequiredError extends Error implements ReducerError {
  errorCode = "PAYMENT_DATE_REQUIRED" as ErrorCode;
  constructor(message = "PaymentDateRequiredError") {
    super(message);
  }
}

export class PaymentStepNotFoundError extends Error implements ReducerError {
  errorCode = "PAYMENT_STEP_NOT_FOUND" as ErrorCode;
  constructor(message = "PaymentStepNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddPaymentStep: {
    ProposalNotDraftError,
    DuplicatePaymentStepIdError,
    InvalidPercentageError,
    PaymentDateRequiredError,
  },

  UpdatePaymentStep: {
    ProposalNotDraftError,
    PaymentStepNotFoundError,
    InvalidPercentageError,
    PaymentDateRequiredError,
  },

  RemovePaymentStep: { ProposalNotDraftError, PaymentStepNotFoundError },
};
