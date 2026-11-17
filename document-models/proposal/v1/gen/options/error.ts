export type ErrorCode =
  | "PROPOSAL_NOT_DRAFT"
  | "DUPLICATE_OPTION_ID"
  | "UNKNOWN_OPTION_PACKAGE"
  | "DUPLICATE_OPTION_PACKAGE"
  | "OPTION_NOT_FOUND"
  | "DUPLICATE_ADJUSTMENT_ID"
  | "CURRENCY_NOT_SET"
  | "AMOUNT_CURRENCY_MISMATCH"
  | "ADJUSTMENT_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class DuplicateOptionIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_OPTION_ID" as ErrorCode;
  constructor(message = "DuplicateOptionIdError") {
    super(message);
  }
}

export class UnknownOptionPackageError extends Error implements ReducerError {
  errorCode = "UNKNOWN_OPTION_PACKAGE" as ErrorCode;
  constructor(message = "UnknownOptionPackageError") {
    super(message);
  }
}

export class DuplicateOptionPackageError extends Error implements ReducerError {
  errorCode = "DUPLICATE_OPTION_PACKAGE" as ErrorCode;
  constructor(message = "DuplicateOptionPackageError") {
    super(message);
  }
}

export class OptionNotFoundError extends Error implements ReducerError {
  errorCode = "OPTION_NOT_FOUND" as ErrorCode;
  constructor(message = "OptionNotFoundError") {
    super(message);
  }
}

export class DuplicateAdjustmentIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_ADJUSTMENT_ID" as ErrorCode;
  constructor(message = "DuplicateAdjustmentIdError") {
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

export class AdjustmentNotFoundError extends Error implements ReducerError {
  errorCode = "ADJUSTMENT_NOT_FOUND" as ErrorCode;
  constructor(message = "AdjustmentNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddOption: {
    ProposalNotDraftError,
    DuplicateOptionIdError,
    UnknownOptionPackageError,
    DuplicateOptionPackageError,
  },

  UpdateOption: {
    ProposalNotDraftError,
    OptionNotFoundError,
    UnknownOptionPackageError,
    DuplicateOptionPackageError,
  },

  RemoveOption: { ProposalNotDraftError, OptionNotFoundError },

  AddAdjustment: {
    ProposalNotDraftError,
    OptionNotFoundError,
    DuplicateAdjustmentIdError,
    CurrencyNotSetError,
    AmountCurrencyMismatchError,
  },

  RemoveAdjustment: {
    ProposalNotDraftError,
    OptionNotFoundError,
    AdjustmentNotFoundError,
  },
};
