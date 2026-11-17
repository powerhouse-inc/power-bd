/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddAngleInput,
  RemoveAngleInput,
  UpdateAngleInput,
} from "../types.js";

export type AddAngleAction = Action & {
  type: "ADD_ANGLE";
  input: AddAngleInput;
};
export type UpdateAngleAction = Action & {
  type: "UPDATE_ANGLE";
  input: UpdateAngleInput;
};
export type RemoveAngleAction = Action & {
  type: "REMOVE_ANGLE";
  input: RemoveAngleInput;
};

export type LeadAnglesAction =
  | AddAngleAction
  | UpdateAngleAction
  | RemoveAngleAction;
