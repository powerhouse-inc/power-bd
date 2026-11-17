import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { DecisionPHState } from "document-models/decision/v1";
import type {
  SetDecideByAction,
  SetDecisionOwnerAction,
  SetQuestionAction,
} from "./details/actions.js";
import type {
  AddReferenceAction,
  RemoveReferenceAction,
} from "./references/actions.js";
import type {
  AnswerDecisionAction,
  ReopenDecisionAction,
  WithdrawDecisionAction,
} from "./status/actions.js";

import { decisionDetailsOperations } from "../src/reducers/details.js";
import { decisionReferencesOperations } from "../src/reducers/references.js";
import { decisionStatusOperations } from "../src/reducers/status.js";

import {
  AddReferenceInputSchema,
  AnswerDecisionInputSchema,
  RemoveReferenceInputSchema,
  ReopenDecisionInputSchema,
  SetDecideByInputSchema,
  SetDecisionOwnerInputSchema,
  SetQuestionInputSchema,
  WithdrawDecisionInputSchema,
} from "./schema/zod.js";

const schemaMemo = new Map<() => unknown, unknown>();

function memoizedSchema<T>(makeSchema: () => T): T {
  let schema = schemaMemo.get(makeSchema) as T | undefined;
  if (schema === undefined) {
    schema = makeSchema();
    schemaMemo.set(makeSchema, schema);
  }
  return schema;
}

const stateReducer: StateReducer<DecisionPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_QUESTION": {
      memoizedSchema(SetQuestionInputSchema).parse(action.input);

      decisionDetailsOperations.setQuestionOperation(
        state.global,
        action as SetQuestionAction,
        dispatch,
      );

      break;
    }

    case "SET_DECISION_OWNER": {
      memoizedSchema(SetDecisionOwnerInputSchema).parse(action.input);

      decisionDetailsOperations.setDecisionOwnerOperation(
        state.global,
        action as SetDecisionOwnerAction,
        dispatch,
      );

      break;
    }

    case "SET_DECIDE_BY": {
      memoizedSchema(SetDecideByInputSchema).parse(action.input);

      decisionDetailsOperations.setDecideByOperation(
        state.global,
        action as SetDecideByAction,
        dispatch,
      );

      break;
    }

    case "ANSWER_DECISION": {
      memoizedSchema(AnswerDecisionInputSchema).parse(action.input);

      decisionStatusOperations.answerDecisionOperation(
        state.global,
        action as AnswerDecisionAction,
        dispatch,
      );

      break;
    }

    case "REOPEN_DECISION": {
      memoizedSchema(ReopenDecisionInputSchema).parse(action.input);

      decisionStatusOperations.reopenDecisionOperation(
        state.global,
        action as ReopenDecisionAction,
        dispatch,
      );

      break;
    }

    case "WITHDRAW_DECISION": {
      memoizedSchema(WithdrawDecisionInputSchema).parse(action.input);

      decisionStatusOperations.withdrawDecisionOperation(
        state.global,
        action as WithdrawDecisionAction,
        dispatch,
      );

      break;
    }

    case "ADD_REFERENCE": {
      memoizedSchema(AddReferenceInputSchema).parse(action.input);

      decisionReferencesOperations.addReferenceOperation(
        state.global,
        action as AddReferenceAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_REFERENCE": {
      memoizedSchema(RemoveReferenceInputSchema).parse(action.input);

      decisionReferencesOperations.removeReferenceOperation(
        state.global,
        action as RemoveReferenceAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<DecisionPHState> = createReducer(stateReducer);
