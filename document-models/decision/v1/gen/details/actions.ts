/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  SetDecideByInput,
  SetDecisionOwnerInput,
  SetQuestionInput,
} from "../types.js";

export type SetQuestionAction = Action & {
  type: "SET_QUESTION";
  input: SetQuestionInput;
};
export type SetDecisionOwnerAction = Action & {
  type: "SET_DECISION_OWNER";
  input: SetDecisionOwnerInput;
};
export type SetDecideByAction = Action & {
  type: "SET_DECIDE_BY";
  input: SetDecideByInput;
};

export type DecisionDetailsAction =
  | SetQuestionAction
  | SetDecisionOwnerAction
  | SetDecideByAction;
