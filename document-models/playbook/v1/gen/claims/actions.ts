/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddNeverClaimInput,
  RemoveNeverClaimInput,
  UpdateNeverClaimInput,
} from "../types.js";

export type AddNeverClaimAction = Action & {
  type: "ADD_NEVER_CLAIM";
  input: AddNeverClaimInput;
};
export type UpdateNeverClaimAction = Action & {
  type: "UPDATE_NEVER_CLAIM";
  input: UpdateNeverClaimInput;
};
export type RemoveNeverClaimAction = Action & {
  type: "REMOVE_NEVER_CLAIM";
  input: RemoveNeverClaimInput;
};

export type PlaybookClaimsAction =
  | AddNeverClaimAction
  | UpdateNeverClaimAction
  | RemoveNeverClaimAction;
