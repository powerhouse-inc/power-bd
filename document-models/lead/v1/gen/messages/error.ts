export type ErrorCode =
  | "DUPLICATE_MESSAGE_ID"
  | "ANGLE_NOT_FOUND"
  | "MESSAGE_NOT_FOUND"
  | "MESSAGE_NOT_DRAFT"
  | "MESSAGE_NOT_APPROVED"
  | "MESSAGE_FINAL";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateMessageIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_MESSAGE_ID" as ErrorCode;
  constructor(message = "DuplicateMessageIdError") {
    super(message);
  }
}

export class AngleNotFoundError extends Error implements ReducerError {
  errorCode = "ANGLE_NOT_FOUND" as ErrorCode;
  constructor(message = "AngleNotFoundError") {
    super(message);
  }
}

export class MessageNotFoundError extends Error implements ReducerError {
  errorCode = "MESSAGE_NOT_FOUND" as ErrorCode;
  constructor(message = "MessageNotFoundError") {
    super(message);
  }
}

export class MessageNotDraftError extends Error implements ReducerError {
  errorCode = "MESSAGE_NOT_DRAFT" as ErrorCode;
  constructor(message = "MessageNotDraftError") {
    super(message);
  }
}

export class MessageNotApprovedError extends Error implements ReducerError {
  errorCode = "MESSAGE_NOT_APPROVED" as ErrorCode;
  constructor(message = "MessageNotApprovedError") {
    super(message);
  }
}

export class MessageFinalError extends Error implements ReducerError {
  errorCode = "MESSAGE_FINAL" as ErrorCode;
  constructor(message = "MessageFinalError") {
    super(message);
  }
}

export const errors = {
  DraftMessage: { DuplicateMessageIdError, AngleNotFoundError },

  UpdateMessage: {
    MessageNotFoundError,
    MessageNotDraftError,
    AngleNotFoundError,
  },

  ApproveMessage: { MessageNotFoundError, MessageNotDraftError },

  ReopenMessage: { MessageNotFoundError, MessageNotApprovedError },

  MarkMessageSent: { MessageNotFoundError, MessageNotApprovedError },

  DiscardMessage: { MessageNotFoundError, MessageFinalError },
};
