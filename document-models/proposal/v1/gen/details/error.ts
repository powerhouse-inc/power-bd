export type ErrorCode = "PROPOSAL_NOT_DRAFT" | "CURRENCY_LOCKED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class CurrencyLockedError extends Error implements ReducerError {
  errorCode = "CURRENCY_LOCKED" as ErrorCode;
  constructor(message = "CurrencyLockedError") {
    super(message);
  }
}

export const errors = {
  SetProposalDetails: { ProposalNotDraftError, CurrencyLockedError },

  SetProposalParties: { ProposalNotDraftError },
};
