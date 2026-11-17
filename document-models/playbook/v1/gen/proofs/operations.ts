/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { PlaybookGlobalState } from "../types.js";
import type {
  AddProofCaseAction,
  AddProofEvidenceAction,
  LinkProofComparableAction,
  RemoveProofCaseAction,
  RemoveProofEvidenceAction,
  UnlinkProofComparableAction,
  UpdateProofCaseAction,
} from "./actions.js";

export interface PlaybookProofsOperations {
  addProofCaseOperation: (
    state: PlaybookGlobalState,
    action: AddProofCaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateProofCaseOperation: (
    state: PlaybookGlobalState,
    action: UpdateProofCaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeProofCaseOperation: (
    state: PlaybookGlobalState,
    action: RemoveProofCaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  addProofEvidenceOperation: (
    state: PlaybookGlobalState,
    action: AddProofEvidenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeProofEvidenceOperation: (
    state: PlaybookGlobalState,
    action: RemoveProofEvidenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkProofComparableOperation: (
    state: PlaybookGlobalState,
    action: LinkProofComparableAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkProofComparableOperation: (
    state: PlaybookGlobalState,
    action: UnlinkProofComparableAction,
    dispatch?: SignalDispatch,
  ) => void;
}
