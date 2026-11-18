export type ErrorCode = "INVALID_HORIZON" | "FIGURES_APPROVED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class InvalidHorizonError extends Error implements ReducerError {
  errorCode = "INVALID_HORIZON" as ErrorCode;
  constructor(message = "InvalidHorizonError") {
    super(message);
  }
}

export class FiguresApprovedError extends Error implements ReducerError {
  errorCode = "FIGURES_APPROVED" as ErrorCode;
  constructor(message = "FiguresApprovedError") {
    super(message);
  }
}

export const errors = {
  SetMarketDetails: { InvalidHorizonError, FiguresApprovedError },
};
