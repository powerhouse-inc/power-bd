/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  ClearBlockedInput,
  DecideGoNoGoInput,
  SetBlockedInput,
  SetDecideByInput,
  SetExpectedOpeningInput,
  SetOpportunityStatusInput,
} from "../types.js";

export type SetOpportunityStatusAction = Action & {
  type: "SET_OPPORTUNITY_STATUS";
  input: SetOpportunityStatusInput;
};
export type DecideGoNoGoAction = Action & {
  type: "DECIDE_GO_NO_GO";
  input: DecideGoNoGoInput;
};
export type SetBlockedAction = Action & {
  type: "SET_BLOCKED";
  input: SetBlockedInput;
};
export type ClearBlockedAction = Action & {
  type: "CLEAR_BLOCKED";
  input: ClearBlockedInput;
};
export type SetDecideByAction = Action & {
  type: "SET_DECIDE_BY";
  input: SetDecideByInput;
};
export type SetExpectedOpeningAction = Action & {
  type: "SET_EXPECTED_OPENING";
  input: SetExpectedOpeningInput;
};

export type OpportunityStatusAction =
  | SetOpportunityStatusAction
  | DecideGoNoGoAction
  | SetBlockedAction
  | ClearBlockedAction
  | SetDecideByAction
  | SetExpectedOpeningAction;
