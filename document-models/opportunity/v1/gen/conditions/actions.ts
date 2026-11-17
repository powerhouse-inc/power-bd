/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddConditionInput,
  MarkConditionInput,
  RemoveConditionInput,
  UpdateConditionInput,
} from "../types.js";

export type AddConditionAction = Action & {
  type: "ADD_CONDITION";
  input: AddConditionInput;
};
export type UpdateConditionAction = Action & {
  type: "UPDATE_CONDITION";
  input: UpdateConditionInput;
};
export type RemoveConditionAction = Action & {
  type: "REMOVE_CONDITION";
  input: RemoveConditionInput;
};
export type MarkConditionAction = Action & {
  type: "MARK_CONDITION";
  input: MarkConditionInput;
};

export type OpportunityConditionsAction =
  | AddConditionAction
  | UpdateConditionAction
  | RemoveConditionAction
  | MarkConditionAction;
