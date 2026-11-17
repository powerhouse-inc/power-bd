import type { DecisionStatusOperations } from "document-models/decision/v1";
import {
  AnswerRequiredError,
  DecisionNotAnsweredError,
  DecisionNotOpenError,
} from "../../gen/status/error.js";

export const decisionStatusOperations: DecisionStatusOperations = {
  answerDecisionOperation(state, action) {
    const { answer, answeredBy, answeredAt } = action.input;
    if (state.status !== "OPEN")
      throw new DecisionNotOpenError("Only an open decision can be answered");
    if (answer.trim() === "")
      throw new AnswerRequiredError("The answer needs text");
    state.status = "ANSWERED";
    state.answer = answer;
    state.answeredBy = answeredBy;
    state.answeredAt = answeredAt;
  },
  reopenDecisionOperation(state, action) {
    if (state.status !== "ANSWERED")
      throw new DecisionNotAnsweredError(
        "Only an answered decision can be reopened",
      );
    state.status = "OPEN";
    state.answer = null;
    state.answeredBy = null;
    state.answeredAt = null;
    state.reason = action.input.reason ?? null;
  },
  withdrawDecisionOperation(state, action) {
    if (state.status !== "OPEN")
      throw new DecisionNotOpenError("Only an open decision can be withdrawn");
    state.status = "WITHDRAWN";
    state.reason = action.input.reason ?? null;
  },
};
