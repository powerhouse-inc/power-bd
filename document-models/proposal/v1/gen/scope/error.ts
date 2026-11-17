export type ErrorCode =
  | "PROPOSAL_NOT_DRAFT"
  | "DUPLICATE_ACTOR_ID"
  | "DUPLICATE_ACTOR_CODE"
  | "ACTOR_NOT_FOUND"
  | "ACTOR_IN_USE"
  | "DUPLICATE_USE_CASE_ID"
  | "DUPLICATE_USE_CASE_CODE"
  | "PACKAGE_NOT_FOUND"
  | "USE_CASE_NOT_FOUND"
  | "DUPLICATE_BOUNDARY_ID"
  | "BOUNDARY_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class DuplicateActorIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_ACTOR_ID" as ErrorCode;
  constructor(message = "DuplicateActorIdError") {
    super(message);
  }
}

export class DuplicateActorCodeError extends Error implements ReducerError {
  errorCode = "DUPLICATE_ACTOR_CODE" as ErrorCode;
  constructor(message = "DuplicateActorCodeError") {
    super(message);
  }
}

export class ActorNotFoundError extends Error implements ReducerError {
  errorCode = "ACTOR_NOT_FOUND" as ErrorCode;
  constructor(message = "ActorNotFoundError") {
    super(message);
  }
}

export class ActorInUseError extends Error implements ReducerError {
  errorCode = "ACTOR_IN_USE" as ErrorCode;
  constructor(message = "ActorInUseError") {
    super(message);
  }
}

export class DuplicateUseCaseIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_USE_CASE_ID" as ErrorCode;
  constructor(message = "DuplicateUseCaseIdError") {
    super(message);
  }
}

export class DuplicateUseCaseCodeError extends Error implements ReducerError {
  errorCode = "DUPLICATE_USE_CASE_CODE" as ErrorCode;
  constructor(message = "DuplicateUseCaseCodeError") {
    super(message);
  }
}

export class PackageNotFoundError extends Error implements ReducerError {
  errorCode = "PACKAGE_NOT_FOUND" as ErrorCode;
  constructor(message = "PackageNotFoundError") {
    super(message);
  }
}

export class UseCaseNotFoundError extends Error implements ReducerError {
  errorCode = "USE_CASE_NOT_FOUND" as ErrorCode;
  constructor(message = "UseCaseNotFoundError") {
    super(message);
  }
}

export class DuplicateBoundaryIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_BOUNDARY_ID" as ErrorCode;
  constructor(message = "DuplicateBoundaryIdError") {
    super(message);
  }
}

export class BoundaryNotFoundError extends Error implements ReducerError {
  errorCode = "BOUNDARY_NOT_FOUND" as ErrorCode;
  constructor(message = "BoundaryNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddActor: {
    ProposalNotDraftError,
    DuplicateActorIdError,
    DuplicateActorCodeError,
  },

  UpdateActor: {
    ProposalNotDraftError,
    ActorNotFoundError,
    DuplicateActorCodeError,
  },

  RemoveActor: { ProposalNotDraftError, ActorNotFoundError, ActorInUseError },

  AddUseCase: {
    ProposalNotDraftError,
    DuplicateUseCaseIdError,
    DuplicateUseCaseCodeError,
    ActorNotFoundError,
    PackageNotFoundError,
  },

  UpdateUseCase: {
    ProposalNotDraftError,
    UseCaseNotFoundError,
    DuplicateUseCaseCodeError,
    ActorNotFoundError,
    PackageNotFoundError,
  },

  RemoveUseCase: { ProposalNotDraftError, UseCaseNotFoundError },

  AddBoundary: {
    ProposalNotDraftError,
    DuplicateBoundaryIdError,
    PackageNotFoundError,
  },

  UpdateBoundary: {
    ProposalNotDraftError,
    BoundaryNotFoundError,
    PackageNotFoundError,
  },

  RemoveBoundary: { ProposalNotDraftError, BoundaryNotFoundError },
};
