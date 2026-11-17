/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { DecisionGlobalState } from "../types.js";
import type { AddReferenceAction, RemoveReferenceAction } from "./actions.js";

export interface DecisionReferencesOperations {
  addReferenceOperation: (
    state: DecisionGlobalState,
    action: AddReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeReferenceOperation: (
    state: DecisionGlobalState,
    action: RemoveReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
}
