/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddPositioningInput,
  ApprovePositioningInput,
  LinkPositioningComparableInput,
  LinkPositioningProofInput,
  RetirePositioningInput,
  UnlinkPositioningComparableInput,
  UnlinkPositioningProofInput,
  UpdatePositioningInput,
} from "../types.js";

export type AddPositioningAction = Action & {
  type: "ADD_POSITIONING";
  input: AddPositioningInput;
};
export type UpdatePositioningAction = Action & {
  type: "UPDATE_POSITIONING";
  input: UpdatePositioningInput;
};
export type ApprovePositioningAction = Action & {
  type: "APPROVE_POSITIONING";
  input: ApprovePositioningInput;
};
export type RetirePositioningAction = Action & {
  type: "RETIRE_POSITIONING";
  input: RetirePositioningInput;
};
export type LinkPositioningComparableAction = Action & {
  type: "LINK_POSITIONING_COMPARABLE";
  input: LinkPositioningComparableInput;
};
export type UnlinkPositioningComparableAction = Action & {
  type: "UNLINK_POSITIONING_COMPARABLE";
  input: UnlinkPositioningComparableInput;
};
export type LinkPositioningProofAction = Action & {
  type: "LINK_POSITIONING_PROOF";
  input: LinkPositioningProofInput;
};
export type UnlinkPositioningProofAction = Action & {
  type: "UNLINK_POSITIONING_PROOF";
  input: UnlinkPositioningProofInput;
};

export type PlaybookPositioningAction =
  | AddPositioningAction
  | UpdatePositioningAction
  | ApprovePositioningAction
  | RetirePositioningAction
  | LinkPositioningComparableAction
  | UnlinkPositioningComparableAction
  | LinkPositioningProofAction
  | UnlinkPositioningProofAction;
