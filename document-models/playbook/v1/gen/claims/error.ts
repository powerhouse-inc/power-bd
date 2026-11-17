export type ErrorCode = "DUPLICATE_NEVER_CLAIM_ID" | "NEVER_CLAIM_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateNeverClaimIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_NEVER_CLAIM_ID" as ErrorCode;
  constructor(message = "DuplicateNeverClaimIdError") {
    super(message);
  }
}

export class NeverClaimNotFoundError extends Error implements ReducerError {
  errorCode = "NEVER_CLAIM_NOT_FOUND" as ErrorCode;
  constructor(message = "NeverClaimNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddNeverClaim: { DuplicateNeverClaimIdError },

  UpdateNeverClaim: { NeverClaimNotFoundError },

  RemoveNeverClaim: { NeverClaimNotFoundError },
};
