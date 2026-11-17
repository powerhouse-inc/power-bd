import type { DecisionDetailsOperations } from "document-models/decision/v1";

export const decisionDetailsOperations: DecisionDetailsOperations = {
  setQuestionOperation(state, action) {
    const { question, context } = action.input;
    state.question = question;
    if (context !== undefined) state.context = context;
  },
  setDecisionOwnerOperation(state, action) {
    const { owner } = action.input;
    if (owner !== undefined) state.owner = owner;
  },
  setDecideByOperation(state, action) {
    const { decideBy } = action.input;
    if (decideBy !== undefined) state.decideBy = decideBy;
  },
};
