export type ErrorCode =
  | "FIGURES_APPROVED"
  | "SEGMENT_NAME_REQUIRED"
  | "DUPLICATE_SEGMENT_ID"
  | "SEGMENT_NOT_FOUND"
  | "NEGATIVE_NUMBER"
  | "TARGET_ABOVE_ACCOUNTS"
  | "SOURCE_TITLE_REQUIRED"
  | "SOURCE_LINK_REQUIRED"
  | "ORGANISATION_ALREADY_LINKED"
  | "ORGANISATION_NOT_LINKED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class FiguresApprovedError extends Error implements ReducerError {
  errorCode = "FIGURES_APPROVED" as ErrorCode;
  constructor(message = "FiguresApprovedError") {
    super(message);
  }
}

export class SegmentNameRequiredError extends Error implements ReducerError {
  errorCode = "SEGMENT_NAME_REQUIRED" as ErrorCode;
  constructor(message = "SegmentNameRequiredError") {
    super(message);
  }
}

export class DuplicateSegmentIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_SEGMENT_ID" as ErrorCode;
  constructor(message = "DuplicateSegmentIdError") {
    super(message);
  }
}

export class SegmentNotFoundError extends Error implements ReducerError {
  errorCode = "SEGMENT_NOT_FOUND" as ErrorCode;
  constructor(message = "SegmentNotFoundError") {
    super(message);
  }
}

export class NegativeNumberError extends Error implements ReducerError {
  errorCode = "NEGATIVE_NUMBER" as ErrorCode;
  constructor(message = "NegativeNumberError") {
    super(message);
  }
}

export class TargetAboveAccountsError extends Error implements ReducerError {
  errorCode = "TARGET_ABOVE_ACCOUNTS" as ErrorCode;
  constructor(message = "TargetAboveAccountsError") {
    super(message);
  }
}

export class SourceTitleRequiredError extends Error implements ReducerError {
  errorCode = "SOURCE_TITLE_REQUIRED" as ErrorCode;
  constructor(message = "SourceTitleRequiredError") {
    super(message);
  }
}

export class SourceLinkRequiredError extends Error implements ReducerError {
  errorCode = "SOURCE_LINK_REQUIRED" as ErrorCode;
  constructor(message = "SourceLinkRequiredError") {
    super(message);
  }
}

export class OrganisationAlreadyLinkedError
  extends Error
  implements ReducerError
{
  errorCode = "ORGANISATION_ALREADY_LINKED" as ErrorCode;
  constructor(message = "OrganisationAlreadyLinkedError") {
    super(message);
  }
}

export class OrganisationNotLinkedError extends Error implements ReducerError {
  errorCode = "ORGANISATION_NOT_LINKED" as ErrorCode;
  constructor(message = "OrganisationNotLinkedError") {
    super(message);
  }
}

export const errors = {
  AddSegment: {
    FiguresApprovedError,
    SegmentNameRequiredError,
    DuplicateSegmentIdError,
  },

  UpdateSegment: {
    FiguresApprovedError,
    SegmentNotFoundError,
    SegmentNameRequiredError,
    NegativeNumberError,
    TargetAboveAccountsError,
  },

  SetSegmentSource: {
    FiguresApprovedError,
    SegmentNotFoundError,
    SourceTitleRequiredError,
    SourceLinkRequiredError,
  },

  LinkSegmentOrganisation: {
    SegmentNotFoundError,
    OrganisationAlreadyLinkedError,
  },

  UnlinkSegmentOrganisation: {
    SegmentNotFoundError,
    OrganisationNotLinkedError,
  },

  RemoveSegment: { FiguresApprovedError, SegmentNotFoundError },
};
