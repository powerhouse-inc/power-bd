/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { MarketGlobalState } from "../types.js";
import type {
  LinkPlayerEvidenceAction,
  MovePlayerAction,
  PlacePlayerAction,
  RemovePlayerAction,
  SetAxesAction,
  SetOurPositionAction,
  SetPlayerNoteAction,
  UnlinkPlayerEvidenceAction,
} from "./actions.js";

export interface MarketMapOperations {
  setAxesOperation: (
    state: MarketGlobalState,
    action: SetAxesAction,
    dispatch?: SignalDispatch,
  ) => void;
  placePlayerOperation: (
    state: MarketGlobalState,
    action: PlacePlayerAction,
    dispatch?: SignalDispatch,
  ) => void;
  movePlayerOperation: (
    state: MarketGlobalState,
    action: MovePlayerAction,
    dispatch?: SignalDispatch,
  ) => void;
  setPlayerNoteOperation: (
    state: MarketGlobalState,
    action: SetPlayerNoteAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkPlayerEvidenceOperation: (
    state: MarketGlobalState,
    action: LinkPlayerEvidenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkPlayerEvidenceOperation: (
    state: MarketGlobalState,
    action: UnlinkPlayerEvidenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePlayerOperation: (
    state: MarketGlobalState,
    action: RemovePlayerAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOurPositionOperation: (
    state: MarketGlobalState,
    action: SetOurPositionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
