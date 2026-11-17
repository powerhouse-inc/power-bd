/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type { AddReferenceAction, RemoveReferenceAction } from "./actions.js";

export interface ProposalReferencesOperations {
  addReferenceOperation: (
    state: ProposalGlobalState,
    action: AddReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeReferenceOperation: (
    state: ProposalGlobalState,
    action: RemoveReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
}
