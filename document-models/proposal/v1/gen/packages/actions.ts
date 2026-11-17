/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddPackageInput,
  RemovePackageInput,
  ReorderPackagesInput,
  UpdatePackageInput,
} from "../types.js";

export type AddPackageAction = Action & {
  type: "ADD_PACKAGE";
  input: AddPackageInput;
};
export type UpdatePackageAction = Action & {
  type: "UPDATE_PACKAGE";
  input: UpdatePackageInput;
};
export type RemovePackageAction = Action & {
  type: "REMOVE_PACKAGE";
  input: RemovePackageInput;
};
export type ReorderPackagesAction = Action & {
  type: "REORDER_PACKAGES";
  input: ReorderPackagesInput;
};

export type ProposalPackagesAction =
  | AddPackageAction
  | UpdatePackageAction
  | RemovePackageAction
  | ReorderPackagesAction;
