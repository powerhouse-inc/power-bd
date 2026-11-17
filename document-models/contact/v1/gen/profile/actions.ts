/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddTagInput,
  RemoveTagInput,
  SetAddressInput,
  SetProfileInput,
} from "../types.js";

export type SetProfileAction = Action & {
  type: "SET_PROFILE";
  input: SetProfileInput;
};
export type SetAddressAction = Action & {
  type: "SET_ADDRESS";
  input: SetAddressInput;
};
export type AddTagAction = Action & { type: "ADD_TAG"; input: AddTagInput };
export type RemoveTagAction = Action & {
  type: "REMOVE_TAG";
  input: RemoveTagInput;
};

export type ContactProfileAction =
  | SetProfileAction
  | SetAddressAction
  | AddTagAction
  | RemoveTagAction;
