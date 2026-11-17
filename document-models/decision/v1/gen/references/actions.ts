/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type { AddReferenceInput, RemoveReferenceInput } from "../types.js";

export type AddReferenceAction = Action & {
  type: "ADD_REFERENCE";
  input: AddReferenceInput;
};
export type RemoveReferenceAction = Action & {
  type: "REMOVE_REFERENCE";
  input: RemoveReferenceInput;
};

export type DecisionReferencesAction =
  | AddReferenceAction
  | RemoveReferenceAction;
