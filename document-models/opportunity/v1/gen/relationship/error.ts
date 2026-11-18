export type ErrorCode =
  | "DUPLICATE_NEXT_STEP_ID"
  | "NEXT_STEP_NOT_FOUND"
  | "NEXT_STEP_ALREADY_DONE"
  | "NEXT_STEP_NOT_DONE"
  | "DUPLICATE_INTERACTION_ID"
  | "MEETING_NEEDS_TIME"
  | "INVALID_TIME_ZONE"
  | "INTERACTION_NOT_FOUND"
  | "DUPLICATE_CONTACT_LINK_ID"
  | "CONTACT_LINK_NOT_FOUND"
  | "DUPLICATE_REFERENCE_ID"
  | "DUPLICATE_REFERENCE"
  | "REFERENCE_NOT_FOUND"
  | "DUPLICATE_CONFIDENTIAL_ITEM_ID"
  | "CONFIDENTIAL_ITEM_NOT_FOUND"
  | "INTERACTION_NOT_HELD";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateNextStepIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_NEXT_STEP_ID" as ErrorCode;
  constructor(message = "DuplicateNextStepIdError") {
    super(message);
  }
}

export class NextStepNotFoundError extends Error implements ReducerError {
  errorCode = "NEXT_STEP_NOT_FOUND" as ErrorCode;
  constructor(message = "NextStepNotFoundError") {
    super(message);
  }
}

export class NextStepAlreadyDoneError extends Error implements ReducerError {
  errorCode = "NEXT_STEP_ALREADY_DONE" as ErrorCode;
  constructor(message = "NextStepAlreadyDoneError") {
    super(message);
  }
}

export class NextStepNotDoneError extends Error implements ReducerError {
  errorCode = "NEXT_STEP_NOT_DONE" as ErrorCode;
  constructor(message = "NextStepNotDoneError") {
    super(message);
  }
}

export class DuplicateInteractionIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_INTERACTION_ID" as ErrorCode;
  constructor(message = "DuplicateInteractionIdError") {
    super(message);
  }
}

export class MeetingNeedsTimeError extends Error implements ReducerError {
  errorCode = "MEETING_NEEDS_TIME" as ErrorCode;
  constructor(message = "MeetingNeedsTimeError") {
    super(message);
  }
}

export class InvalidTimeZoneError extends Error implements ReducerError {
  errorCode = "INVALID_TIME_ZONE" as ErrorCode;
  constructor(message = "InvalidTimeZoneError") {
    super(message);
  }
}

export class InteractionNotFoundError extends Error implements ReducerError {
  errorCode = "INTERACTION_NOT_FOUND" as ErrorCode;
  constructor(message = "InteractionNotFoundError") {
    super(message);
  }
}

export class DuplicateContactLinkIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_CONTACT_LINK_ID" as ErrorCode;
  constructor(message = "DuplicateContactLinkIdError") {
    super(message);
  }
}

export class ContactLinkNotFoundError extends Error implements ReducerError {
  errorCode = "CONTACT_LINK_NOT_FOUND" as ErrorCode;
  constructor(message = "ContactLinkNotFoundError") {
    super(message);
  }
}

export class DuplicateReferenceIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_REFERENCE_ID" as ErrorCode;
  constructor(message = "DuplicateReferenceIdError") {
    super(message);
  }
}

export class DuplicateReferenceError extends Error implements ReducerError {
  errorCode = "DUPLICATE_REFERENCE" as ErrorCode;
  constructor(message = "DuplicateReferenceError") {
    super(message);
  }
}

export class ReferenceNotFoundError extends Error implements ReducerError {
  errorCode = "REFERENCE_NOT_FOUND" as ErrorCode;
  constructor(message = "ReferenceNotFoundError") {
    super(message);
  }
}

export class DuplicateConfidentialItemIdError
  extends Error
  implements ReducerError
{
  errorCode = "DUPLICATE_CONFIDENTIAL_ITEM_ID" as ErrorCode;
  constructor(message = "DuplicateConfidentialItemIdError") {
    super(message);
  }
}

export class ConfidentialItemNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "CONFIDENTIAL_ITEM_NOT_FOUND" as ErrorCode;
  constructor(message = "ConfidentialItemNotFoundError") {
    super(message);
  }
}

export class InteractionNotHeldError extends Error implements ReducerError {
  errorCode = "INTERACTION_NOT_HELD" as ErrorCode;
  constructor(message = "InteractionNotHeldError") {
    super(message);
  }
}

export const errors = {
  AddNextStep: { DuplicateNextStepIdError },

  UpdateNextStep: { NextStepNotFoundError },

  CompleteNextStep: { NextStepNotFoundError, NextStepAlreadyDoneError },

  ReopenNextStep: { NextStepNotFoundError, NextStepNotDoneError },

  RemoveNextStep: { NextStepNotFoundError },

  AddInteraction: {
    DuplicateInteractionIdError,
    MeetingNeedsTimeError,
    InvalidTimeZoneError,
  },

  UpdateInteraction: {
    InteractionNotFoundError,
    MeetingNeedsTimeError,
    InvalidTimeZoneError,
  },

  RemoveInteraction: { InteractionNotFoundError },

  LinkContact: { DuplicateContactLinkIdError },

  UnlinkContact: { ContactLinkNotFoundError },

  AddReference: { DuplicateReferenceIdError, DuplicateReferenceError },

  RemoveReference: { ReferenceNotFoundError },

  AddConfidentialItem: { DuplicateConfidentialItemIdError },

  RemoveConfidentialItem: { ConfidentialItemNotFoundError },

  SetInteractionOutcome: { InteractionNotFoundError, InteractionNotHeldError },
};
