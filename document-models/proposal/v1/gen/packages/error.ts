export type ErrorCode =
  | "PROPOSAL_NOT_DRAFT"
  | "DUPLICATE_PACKAGE_ID"
  | "DUPLICATE_PACKAGE_CODE"
  | "UNKNOWN_REQUIRED_PACKAGE"
  | "PACKAGE_REQUIRES_ITSELF"
  | "CURRENCY_NOT_SET"
  | "AMOUNT_CURRENCY_MISMATCH"
  | "PACKAGE_PRICED_TWICE"
  | "PACKAGE_NOT_FOUND"
  | "PACKAGE_IN_USE"
  | "PACKAGE_ORDER_MISMATCH";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class DuplicatePackageIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_PACKAGE_ID" as ErrorCode;
  constructor(message = "DuplicatePackageIdError") {
    super(message);
  }
}

export class DuplicatePackageCodeError extends Error implements ReducerError {
  errorCode = "DUPLICATE_PACKAGE_CODE" as ErrorCode;
  constructor(message = "DuplicatePackageCodeError") {
    super(message);
  }
}

export class UnknownRequiredPackageError extends Error implements ReducerError {
  errorCode = "UNKNOWN_REQUIRED_PACKAGE" as ErrorCode;
  constructor(message = "UnknownRequiredPackageError") {
    super(message);
  }
}

export class PackageRequiresItselfError extends Error implements ReducerError {
  errorCode = "PACKAGE_REQUIRES_ITSELF" as ErrorCode;
  constructor(message = "PackageRequiresItselfError") {
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

export class PackagePricedTwiceError extends Error implements ReducerError {
  errorCode = "PACKAGE_PRICED_TWICE" as ErrorCode;
  constructor(message = "PackagePricedTwiceError") {
    super(message);
  }
}

export class PackageNotFoundError extends Error implements ReducerError {
  errorCode = "PACKAGE_NOT_FOUND" as ErrorCode;
  constructor(message = "PackageNotFoundError") {
    super(message);
  }
}

export class PackageInUseError extends Error implements ReducerError {
  errorCode = "PACKAGE_IN_USE" as ErrorCode;
  constructor(message = "PackageInUseError") {
    super(message);
  }
}

export class PackageOrderMismatchError extends Error implements ReducerError {
  errorCode = "PACKAGE_ORDER_MISMATCH" as ErrorCode;
  constructor(message = "PackageOrderMismatchError") {
    super(message);
  }
}

export const errors = {
  AddPackage: {
    ProposalNotDraftError,
    DuplicatePackageIdError,
    DuplicatePackageCodeError,
    UnknownRequiredPackageError,
    PackageRequiresItselfError,
    CurrencyNotSetError,
    AmountCurrencyMismatchError,
    PackagePricedTwiceError,
  },

  UpdatePackage: {
    ProposalNotDraftError,
    PackageNotFoundError,
    DuplicatePackageCodeError,
    UnknownRequiredPackageError,
    PackageRequiresItselfError,
    CurrencyNotSetError,
    AmountCurrencyMismatchError,
    PackagePricedTwiceError,
  },

  RemovePackage: {
    ProposalNotDraftError,
    PackageNotFoundError,
    PackageInUseError,
  },

  ReorderPackages: { ProposalNotDraftError, PackageOrderMismatchError },
};
