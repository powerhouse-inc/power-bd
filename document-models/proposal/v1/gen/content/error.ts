export type ErrorCode =
  | "PROPOSAL_NOT_DRAFT"
  | "DUPLICATE_SECTION_ID"
  | "SECTION_KIND_TAKEN"
  | "SECTION_NOT_FOUND"
  | "SECTION_ORDER_MISMATCH"
  | "DUPLICATE_CLAUSE_ID"
  | "CLAUSE_NOT_FOUND"
  | "CLAUSE_ORDER_MISMATCH"
  | "DUPLICATE_ANNEX_ID"
  | "ANNEX_NOT_FOUND"
  | "DUPLICATE_FIGURE_ID"
  | "FIGURE_ANCHOR_NOT_FOUND"
  | "FILE_NAME_REQUIRED"
  | "FILE_TYPE_REQUIRED"
  | "FIGURE_NOT_FOUND"
  | "FIGURE_ORDER_MISMATCH";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class ProposalNotDraftError extends Error implements ReducerError {
  errorCode = "PROPOSAL_NOT_DRAFT" as ErrorCode;
  constructor(message = "ProposalNotDraftError") {
    super(message);
  }
}

export class DuplicateSectionIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_SECTION_ID" as ErrorCode;
  constructor(message = "DuplicateSectionIdError") {
    super(message);
  }
}

export class SectionKindTakenError extends Error implements ReducerError {
  errorCode = "SECTION_KIND_TAKEN" as ErrorCode;
  constructor(message = "SectionKindTakenError") {
    super(message);
  }
}

export class SectionNotFoundError extends Error implements ReducerError {
  errorCode = "SECTION_NOT_FOUND" as ErrorCode;
  constructor(message = "SectionNotFoundError") {
    super(message);
  }
}

export class SectionOrderMismatchError extends Error implements ReducerError {
  errorCode = "SECTION_ORDER_MISMATCH" as ErrorCode;
  constructor(message = "SectionOrderMismatchError") {
    super(message);
  }
}

export class DuplicateClauseIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_CLAUSE_ID" as ErrorCode;
  constructor(message = "DuplicateClauseIdError") {
    super(message);
  }
}

export class ClauseNotFoundError extends Error implements ReducerError {
  errorCode = "CLAUSE_NOT_FOUND" as ErrorCode;
  constructor(message = "ClauseNotFoundError") {
    super(message);
  }
}

export class ClauseOrderMismatchError extends Error implements ReducerError {
  errorCode = "CLAUSE_ORDER_MISMATCH" as ErrorCode;
  constructor(message = "ClauseOrderMismatchError") {
    super(message);
  }
}

export class DuplicateAnnexIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_ANNEX_ID" as ErrorCode;
  constructor(message = "DuplicateAnnexIdError") {
    super(message);
  }
}

export class AnnexNotFoundError extends Error implements ReducerError {
  errorCode = "ANNEX_NOT_FOUND" as ErrorCode;
  constructor(message = "AnnexNotFoundError") {
    super(message);
  }
}

export class DuplicateFigureIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_FIGURE_ID" as ErrorCode;
  constructor(message = "DuplicateFigureIdError") {
    super(message);
  }
}

export class FigureAnchorNotFoundError extends Error implements ReducerError {
  errorCode = "FIGURE_ANCHOR_NOT_FOUND" as ErrorCode;
  constructor(message = "FigureAnchorNotFoundError") {
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

export class FigureNotFoundError extends Error implements ReducerError {
  errorCode = "FIGURE_NOT_FOUND" as ErrorCode;
  constructor(message = "FigureNotFoundError") {
    super(message);
  }
}

export class FigureOrderMismatchError extends Error implements ReducerError {
  errorCode = "FIGURE_ORDER_MISMATCH" as ErrorCode;
  constructor(message = "FigureOrderMismatchError") {
    super(message);
  }
}

export const errors = {
  AddSection: {
    ProposalNotDraftError,
    DuplicateSectionIdError,
    SectionKindTakenError,
  },

  UpdateSection: { ProposalNotDraftError, SectionNotFoundError },

  RemoveSection: { ProposalNotDraftError, SectionNotFoundError },

  ReorderSections: { ProposalNotDraftError, SectionOrderMismatchError },

  AddClause: { ProposalNotDraftError, DuplicateClauseIdError },

  UpdateClause: { ProposalNotDraftError, ClauseNotFoundError },

  RemoveClause: { ProposalNotDraftError, ClauseNotFoundError },

  ReorderClauses: { ProposalNotDraftError, ClauseOrderMismatchError },

  AddAnnex: { ProposalNotDraftError, DuplicateAnnexIdError },

  UpdateAnnex: { ProposalNotDraftError, AnnexNotFoundError },

  RemoveAnnex: { ProposalNotDraftError, AnnexNotFoundError },

  AddFigure: {
    ProposalNotDraftError,
    DuplicateFigureIdError,
    FigureAnchorNotFoundError,
    FileNameRequiredError,
    FileTypeRequiredError,
  },

  UpdateFigure: {
    ProposalNotDraftError,
    FigureNotFoundError,
    FileNameRequiredError,
    FileTypeRequiredError,
  },

  RemoveFigure: { ProposalNotDraftError, FigureNotFoundError },

  ReorderFigures: { ProposalNotDraftError, FigureOrderMismatchError },
};
