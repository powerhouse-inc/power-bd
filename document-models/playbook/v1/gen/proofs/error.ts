export type ErrorCode =
  | "DUPLICATE_PROOF_CASE_ID"
  | "PROOF_CASE_NOT_FOUND"
  | "DUPLICATE_EVIDENCE_ID"
  | "EVIDENCE_NOT_FOUND"
  | "COMPARABLE_ALREADY_LINKED"
  | "COMPARABLE_NOT_LINKED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateProofCaseIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_PROOF_CASE_ID" as ErrorCode;
  constructor(message = "DuplicateProofCaseIdError") {
    super(message);
  }
}

export class ProofCaseNotFoundError extends Error implements ReducerError {
  errorCode = "PROOF_CASE_NOT_FOUND" as ErrorCode;
  constructor(message = "ProofCaseNotFoundError") {
    super(message);
  }
}

export class DuplicateEvidenceIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_EVIDENCE_ID" as ErrorCode;
  constructor(message = "DuplicateEvidenceIdError") {
    super(message);
  }
}

export class EvidenceNotFoundError extends Error implements ReducerError {
  errorCode = "EVIDENCE_NOT_FOUND" as ErrorCode;
  constructor(message = "EvidenceNotFoundError") {
    super(message);
  }
}

export class ComparableAlreadyLinkedError
  extends Error
  implements ReducerError
{
  errorCode = "COMPARABLE_ALREADY_LINKED" as ErrorCode;
  constructor(message = "ComparableAlreadyLinkedError") {
    super(message);
  }
}

export class ComparableNotLinkedError extends Error implements ReducerError {
  errorCode = "COMPARABLE_NOT_LINKED" as ErrorCode;
  constructor(message = "ComparableNotLinkedError") {
    super(message);
  }
}

export const errors = {
  AddProofCase: { DuplicateProofCaseIdError },

  UpdateProofCase: { ProofCaseNotFoundError },

  RemoveProofCase: { ProofCaseNotFoundError },

  AddProofEvidence: { ProofCaseNotFoundError, DuplicateEvidenceIdError },

  RemoveProofEvidence: { ProofCaseNotFoundError, EvidenceNotFoundError },

  LinkProofComparable: { ProofCaseNotFoundError, ComparableAlreadyLinkedError },

  UnlinkProofComparable: { ProofCaseNotFoundError, ComparableNotLinkedError },
};
