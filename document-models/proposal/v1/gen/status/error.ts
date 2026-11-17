export type ErrorCode =
  | "PROPOSAL_NOT_DRAFT"
  | "LEAD_REQUIRED"
  | "CONTRACTING_ENTITY_REQUIRED"
  | "CURRENCY_REQUIRED"
  | "VALID_UNTIL_REQUIRED"
  | "APPROVAL_OPTION_REQUIRED"
  | "PROPOSAL_NOT_APPROVED"
  | "FILE_NAME_REQUIRED"
  | "FILE_TYPE_REQUIRED"
  | "SENT_COPY_NOT_ALLOWED"
  | "ANSWER_ALREADY_RECORDED"
  | "PROPOSAL_NOT_SENT"
  | "DECLINE_REASON_REQUIRED"
  | "CHOSEN_OPTION_NOT_FOUND"
  | "SIGNED_COPY_NOT_ALLOWED"
  | "PROPOSAL_FINAL"
  | "WITHDRAW_REASON_REQUIRED"
  | "PROPOSAL_NOT_SUPERSEDABLE"
  | "REPLACEMENT_REQUIRED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class LeadRequiredError extends Error implements ReducerError {
  errorCode = "LEAD_REQUIRED" as ErrorCode;
  constructor(message = "LeadRequiredError") {
    super(message);
  }
}

export class ContractingEntityRequiredError
  extends Error
  implements ReducerError
{
  errorCode = "CONTRACTING_ENTITY_REQUIRED" as ErrorCode;
  constructor(message = "ContractingEntityRequiredError") {
    super(message);
  }
}

export class CurrencyRequiredError extends Error implements ReducerError {
  errorCode = "CURRENCY_REQUIRED" as ErrorCode;
  constructor(message = "CurrencyRequiredError") {
    super(message);
  }
}

export class ValidUntilRequiredError extends Error implements ReducerError {
  errorCode = "VALID_UNTIL_REQUIRED" as ErrorCode;
  constructor(message = "ValidUntilRequiredError") {
    super(message);
  }
}

export class ApprovalOptionRequiredError extends Error implements ReducerError {
  errorCode = "APPROVAL_OPTION_REQUIRED" as ErrorCode;
  constructor(message = "ApprovalOptionRequiredError") {
    super(message);
  }
}

export class ProposalNotApprovedError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_APPROVED" as ErrorCode;
  constructor(message = "ProposalNotApprovedError") {
    super(message);
  }
}

export class FileNameRequiredError extends Error implements ReducerError {
  errorCode = "FILE_NAME_REQUIRED" as ErrorCode;
  constructor(message = "FileNameRequiredError") {
    super(message);
  }
}

export class FileTypeRequiredError extends Error implements ReducerError {
  errorCode = "FILE_TYPE_REQUIRED" as ErrorCode;
  constructor(message = "FileTypeRequiredError") {
    super(message);
  }
}

export class SentCopyNotAllowedError extends Error implements ReducerError {
  errorCode = "SENT_COPY_NOT_ALLOWED" as ErrorCode;
  constructor(message = "SentCopyNotAllowedError") {
    super(message);
  }
}

export class AnswerAlreadyRecordedError extends Error implements ReducerError {
  errorCode = "ANSWER_ALREADY_RECORDED" as ErrorCode;
  constructor(message = "AnswerAlreadyRecordedError") {
    super(message);
  }
}

export class ProposalNotSentError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_SENT" as ErrorCode;
  constructor(message = "ProposalNotSentError") {
    super(message);
  }
}

export class DeclineReasonRequiredError extends Error implements ReducerError {
  errorCode = "DECLINE_REASON_REQUIRED" as ErrorCode;
  constructor(message = "DeclineReasonRequiredError") {
    super(message);
  }
}

export class ChosenOptionNotFoundError extends Error implements ReducerError {
  errorCode = "CHOSEN_OPTION_NOT_FOUND" as ErrorCode;
  constructor(message = "ChosenOptionNotFoundError") {
    super(message);
  }
}

export class SignedCopyNotAllowedError extends Error implements ReducerError {
  errorCode = "SIGNED_COPY_NOT_ALLOWED" as ErrorCode;
  constructor(message = "SignedCopyNotAllowedError") {
    super(message);
  }
}

export class ProposalFinalError extends Error implements ReducerError {
  errorCode = "PROPOSAL_FINAL" as ErrorCode;
  constructor(message = "ProposalFinalError") {
    super(message);
  }
}

export class WithdrawReasonRequiredError extends Error implements ReducerError {
  errorCode = "WITHDRAW_REASON_REQUIRED" as ErrorCode;
  constructor(message = "WithdrawReasonRequiredError") {
    super(message);
  }
}

export class ProposalNotSupersedableError
  extends Error
  implements ReducerError
{
  errorCode = "PROPOSAL_NOT_SUPERSEDABLE" as ErrorCode;
  constructor(message = "ProposalNotSupersedableError") {
    super(message);
  }
}

export class ReplacementRequiredError extends Error implements ReducerError {
  errorCode = "REPLACEMENT_REQUIRED" as ErrorCode;
  constructor(message = "ReplacementRequiredError") {
    super(message);
  }
}

export const errors = {
  ApproveProposal: {
    ProposalNotDraftError,
    LeadRequiredError,
    ContractingEntityRequiredError,
    CurrencyRequiredError,
    ValidUntilRequiredError,
    ApprovalOptionRequiredError,
  },

  ReopenProposal: { ProposalNotApprovedError },

  MarkProposalSent: {
    ProposalNotApprovedError,
    FileNameRequiredError,
    FileTypeRequiredError,
  },

  SetSentCopy: {
    SentCopyNotAllowedError,
    FileNameRequiredError,
    FileTypeRequiredError,
  },

  RecordProposalAnswer: {
    AnswerAlreadyRecordedError,
    ProposalNotSentError,
    DeclineReasonRequiredError,
    ChosenOptionNotFoundError,
  },

  SetSignedCopy: {
    SignedCopyNotAllowedError,
    FileNameRequiredError,
    FileTypeRequiredError,
  },

  WithdrawProposal: { ProposalFinalError, WithdrawReasonRequiredError },

  SupersedeProposal: { ProposalNotSupersedableError, ReplacementRequiredError },
};
