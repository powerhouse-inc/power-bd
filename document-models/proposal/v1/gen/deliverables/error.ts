export type ErrorCode =
  | "PROPOSAL_NOT_DRAFT"
  | "DUPLICATE_DELIVERABLE_ID"
  | "DUPLICATE_DELIVERABLE_CODE"
  | "PACKAGE_NOT_FOUND"
  | "DELIVERABLE_NOT_FOUND"
  | "PACKAGE_PRICED_TWICE"
  | "AMOUNT_REQUIRED"
  | "INCLUDED_HAS_NO_AMOUNT"
  | "PERIOD_REQUIRED"
  | "UNIT_REQUIRED"
  | "UPPER_AMOUNT_BELOW_AMOUNT"
  | "CURRENCY_NOT_SET"
  | "AMOUNT_CURRENCY_MISMATCH"
  | "DELIVERABLE_ORDER_MISMATCH";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class DuplicateDeliverableIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_DELIVERABLE_ID" as ErrorCode;
  constructor(message = "DuplicateDeliverableIdError") {
    super(message);
  }
}

export class DuplicateDeliverableCodeError
  extends Error
  implements ReducerError
{
  errorCode = "DUPLICATE_DELIVERABLE_CODE" as ErrorCode;
  constructor(message = "DuplicateDeliverableCodeError") {
    super(message);
  }
}

export class PackageNotFoundError extends Error implements ReducerError {
  errorCode = "PACKAGE_NOT_FOUND" as ErrorCode;
  constructor(message = "PackageNotFoundError") {
    super(message);
  }
}

export class DeliverableNotFoundError extends Error implements ReducerError {
  errorCode = "DELIVERABLE_NOT_FOUND" as ErrorCode;
  constructor(message = "DeliverableNotFoundError") {
    super(message);
  }
}

export class PackagePricedTwiceError extends Error implements ReducerError {
  errorCode = "PACKAGE_PRICED_TWICE" as ErrorCode;
  constructor(message = "PackagePricedTwiceError") {
    super(message);
  }
}

export class AmountRequiredError extends Error implements ReducerError {
  errorCode = "AMOUNT_REQUIRED" as ErrorCode;
  constructor(message = "AmountRequiredError") {
    super(message);
  }
}

export class IncludedHasNoAmountError extends Error implements ReducerError {
  errorCode = "INCLUDED_HAS_NO_AMOUNT" as ErrorCode;
  constructor(message = "IncludedHasNoAmountError") {
    super(message);
  }
}

export class PeriodRequiredError extends Error implements ReducerError {
  errorCode = "PERIOD_REQUIRED" as ErrorCode;
  constructor(message = "PeriodRequiredError") {
    super(message);
  }
}

export class UnitRequiredError extends Error implements ReducerError {
  errorCode = "UNIT_REQUIRED" as ErrorCode;
  constructor(message = "UnitRequiredError") {
    super(message);
  }
}

export class UpperAmountBelowAmountError extends Error implements ReducerError {
  errorCode = "UPPER_AMOUNT_BELOW_AMOUNT" as ErrorCode;
  constructor(message = "UpperAmountBelowAmountError") {
    super(message);
  }
}

export class CurrencyNotSetError extends Error implements ReducerError {
  errorCode = "CURRENCY_NOT_SET" as ErrorCode;
  constructor(message = "CurrencyNotSetError") {
    super(message);
  }
}

export class AmountCurrencyMismatchError extends Error implements ReducerError {
  errorCode = "AMOUNT_CURRENCY_MISMATCH" as ErrorCode;
  constructor(message = "AmountCurrencyMismatchError") {
    super(message);
  }
}

export class DeliverableOrderMismatchError
  extends Error
  implements ReducerError
{
  errorCode = "DELIVERABLE_ORDER_MISMATCH" as ErrorCode;
  constructor(message = "DeliverableOrderMismatchError") {
    super(message);
  }
}

export const errors = {
  AddDeliverable: {
    ProposalNotDraftError,
    DuplicateDeliverableIdError,
    DuplicateDeliverableCodeError,
    PackageNotFoundError,
  },

  UpdateDeliverable: {
    ProposalNotDraftError,
    DeliverableNotFoundError,
    DuplicateDeliverableCodeError,
    PackageNotFoundError,
    PackagePricedTwiceError,
  },

  SetDeliverablePrice: {
    ProposalNotDraftError,
    DeliverableNotFoundError,
    AmountRequiredError,
    IncludedHasNoAmountError,
    PeriodRequiredError,
    UnitRequiredError,
    UpperAmountBelowAmountError,
    CurrencyNotSetError,
    AmountCurrencyMismatchError,
    PackagePricedTwiceError,
  },

  RemoveDeliverable: { ProposalNotDraftError, DeliverableNotFoundError },

  ReorderDeliverables: { ProposalNotDraftError, DeliverableOrderMismatchError },
};
