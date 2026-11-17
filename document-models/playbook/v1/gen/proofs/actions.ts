/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddProofCaseInput,
  AddProofEvidenceInput,
  LinkProofComparableInput,
  RemoveProofCaseInput,
  RemoveProofEvidenceInput,
  UnlinkProofComparableInput,
  UpdateProofCaseInput,
} from "../types.js";

export type AddProofCaseAction = Action & {
  type: "ADD_PROOF_CASE";
  input: AddProofCaseInput;
};
export type UpdateProofCaseAction = Action & {
  type: "UPDATE_PROOF_CASE";
  input: UpdateProofCaseInput;
};
export type RemoveProofCaseAction = Action & {
  type: "REMOVE_PROOF_CASE";
  input: RemoveProofCaseInput;
};
export type AddProofEvidenceAction = Action & {
  type: "ADD_PROOF_EVIDENCE";
  input: AddProofEvidenceInput;
};
export type RemoveProofEvidenceAction = Action & {
  type: "REMOVE_PROOF_EVIDENCE";
  input: RemoveProofEvidenceInput;
};
export type LinkProofComparableAction = Action & {
  type: "LINK_PROOF_COMPARABLE";
  input: LinkProofComparableInput;
};
export type UnlinkProofComparableAction = Action & {
  type: "UNLINK_PROOF_COMPARABLE";
  input: UnlinkProofComparableInput;
};

export type PlaybookProofsAction =
  | AddProofCaseAction
  | UpdateProofCaseAction
  | RemoveProofCaseAction
  | AddProofEvidenceAction
  | RemoveProofEvidenceAction
  | LinkProofComparableAction
  | UnlinkProofComparableAction;
