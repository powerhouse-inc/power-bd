/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddAdjustmentInput,
  AddOptionInput,
  RemoveAdjustmentInput,
  RemoveOptionInput,
  UpdateOptionInput,
} from "../types.js";

export type AddOptionAction = Action & {
  type: "ADD_OPTION";
  input: AddOptionInput;
};
export type UpdateOptionAction = Action & {
  type: "UPDATE_OPTION";
  input: UpdateOptionInput;
};
export type RemoveOptionAction = Action & {
  type: "REMOVE_OPTION";
  input: RemoveOptionInput;
};
export type AddAdjustmentAction = Action & {
  type: "ADD_ADJUSTMENT";
  input: AddAdjustmentInput;
};
export type RemoveAdjustmentAction = Action & {
  type: "REMOVE_ADJUSTMENT";
  input: RemoveAdjustmentInput;
};

export type ProposalOptionsAction =
  | AddOptionAction
  | UpdateOptionAction
  | RemoveOptionAction
  | AddAdjustmentAction
  | RemoveAdjustmentAction;
