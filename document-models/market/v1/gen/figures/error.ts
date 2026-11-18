export type ErrorCode =
  | "FIGURES_APPROVED"
  | "FIGURE_LABEL_REQUIRED"
  | "NEGATIVE_AMOUNT"
  | "SOURCE_TITLE_REQUIRED"
  | "SOURCE_LINK_REQUIRED"
  | "DUPLICATE_FIGURE_ID"
  | "FIGURE_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class FiguresApprovedError extends Error implements ReducerError {
  errorCode = "FIGURES_APPROVED" as ErrorCode;
  constructor(message = "FiguresApprovedError") {
    super(message);
  }
}

export class FigureLabelRequiredError extends Error implements ReducerError {
  errorCode = "FIGURE_LABEL_REQUIRED" as ErrorCode;
  constructor(message = "FigureLabelRequiredError") {
    super(message);
  }
}

export class NegativeAmountError extends Error implements ReducerError {
  errorCode = "NEGATIVE_AMOUNT" as ErrorCode;
  constructor(message = "NegativeAmountError") {
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

export class DuplicateFigureIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_FIGURE_ID" as ErrorCode;
  constructor(message = "DuplicateFigureIdError") {
    super(message);
  }
}

export class FigureNotFoundError extends Error implements ReducerError {
  errorCode = "FIGURE_NOT_FOUND" as ErrorCode;
  constructor(message = "FigureNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddPublishedFigure: {
    FiguresApprovedError,
    FigureLabelRequiredError,
    NegativeAmountError,
    SourceTitleRequiredError,
    SourceLinkRequiredError,
    DuplicateFigureIdError,
  },

  RemovePublishedFigure: { FiguresApprovedError, FigureNotFoundError },
};
