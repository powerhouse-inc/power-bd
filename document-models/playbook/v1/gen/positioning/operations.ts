/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { PlaybookGlobalState } from "../types.js";
import type {
  AddPositioningAction,
  ApprovePositioningAction,
  LinkPositioningComparableAction,
  LinkPositioningProofAction,
  RetirePositioningAction,
  UnlinkPositioningComparableAction,
  UnlinkPositioningProofAction,
  UpdatePositioningAction,
} from "./actions.js";

export interface PlaybookPositioningOperations {
  addPositioningOperation: (
    state: PlaybookGlobalState,
    action: AddPositioningAction,
    dispatch?: SignalDispatch,
  ) => void;
  updatePositioningOperation: (
    state: PlaybookGlobalState,
    action: UpdatePositioningAction,
    dispatch?: SignalDispatch,
  ) => void;
  approvePositioningOperation: (
    state: PlaybookGlobalState,
    action: ApprovePositioningAction,
    dispatch?: SignalDispatch,
  ) => void;
  retirePositioningOperation: (
    state: PlaybookGlobalState,
    action: RetirePositioningAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkPositioningComparableOperation: (
    state: PlaybookGlobalState,
    action: LinkPositioningComparableAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkPositioningComparableOperation: (
    state: PlaybookGlobalState,
    action: UnlinkPositioningComparableAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkPositioningProofOperation: (
    state: PlaybookGlobalState,
    action: LinkPositioningProofAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkPositioningProofOperation: (
    state: PlaybookGlobalState,
    action: UnlinkPositioningProofAction,
    dispatch?: SignalDispatch,
  ) => void;
}
