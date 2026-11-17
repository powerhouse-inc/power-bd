export type ErrorCode =
  | "DECISION_NOT_OPEN"
  | "ANSWER_REQUIRED"
  | "DECISION_NOT_ANSWERED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DecisionNotOpenError extends Error implements ReducerError {
  errorCode = "DECISION_NOT_OPEN" as ErrorCode;
  constructor(message = "DecisionNotOpenError") {
    super(message);
  }
}

export class AnswerRequiredError extends Error implements ReducerError {
  errorCode = "ANSWER_REQUIRED" as ErrorCode;
  constructor(message = "AnswerRequiredError") {
    super(message);
  }
}

export class DecisionNotAnsweredError extends Error implements ReducerError {
  errorCode = "DECISION_NOT_ANSWERED" as ErrorCode;
  constructor(message = "DecisionNotAnsweredError") {
    super(message);
  }
}

export const errors = {
  AnswerDecision: { DecisionNotOpenError, AnswerRequiredError },

  ReopenDecision: { DecisionNotAnsweredError },

  WithdrawDecision: { DecisionNotOpenError },
};
