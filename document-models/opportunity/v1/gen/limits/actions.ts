/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  ClearAttemptLimitInput,
  SetApplyingEntityInput,
  SetAttemptLimitInput,
} from "../types.js";

export type SetAttemptLimitAction = Action & {
  type: "SET_ATTEMPT_LIMIT";
  input: SetAttemptLimitInput;
};
export type ClearAttemptLimitAction = Action & {
  type: "CLEAR_ATTEMPT_LIMIT";
  input: ClearAttemptLimitInput;
};
export type SetApplyingEntityAction = Action & {
  type: "SET_APPLYING_ENTITY";
  input: SetApplyingEntityInput;
};

export type OpportunityLimitsAction =
  | SetAttemptLimitAction
  | ClearAttemptLimitAction
  | SetApplyingEntityAction;
