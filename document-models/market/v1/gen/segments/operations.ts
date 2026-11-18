/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { MarketGlobalState } from "../types.js";
import type {
  AddSegmentAction,
  LinkSegmentOrganisationAction,
  RemoveSegmentAction,
  SetSegmentSourceAction,
  UnlinkSegmentOrganisationAction,
  UpdateSegmentAction,
} from "./actions.js";

export interface MarketSegmentsOperations {
  addSegmentOperation: (
    state: MarketGlobalState,
    action: AddSegmentAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSegmentOperation: (
    state: MarketGlobalState,
    action: UpdateSegmentAction,
    dispatch?: SignalDispatch,
  ) => void;
  setSegmentSourceOperation: (
    state: MarketGlobalState,
    action: SetSegmentSourceAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkSegmentOrganisationOperation: (
    state: MarketGlobalState,
    action: LinkSegmentOrganisationAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkSegmentOrganisationOperation: (
    state: MarketGlobalState,
    action: UnlinkSegmentOrganisationAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeSegmentOperation: (
    state: MarketGlobalState,
    action: RemoveSegmentAction,
    dispatch?: SignalDispatch,
  ) => void;
}
