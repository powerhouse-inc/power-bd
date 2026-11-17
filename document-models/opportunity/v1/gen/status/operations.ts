/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
import type {
  ClearBlockedAction,
  DecideGoNoGoAction,
  SetBlockedAction,
  SetDecideByAction,
  SetExpectedOpeningAction,
  SetOpportunityStatusAction,
} from "./actions.js";

export interface OpportunityStatusOperations {
  setOpportunityStatusOperation: (
    state: OpportunityGlobalState,
    action: SetOpportunityStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  decideGoNoGoOperation: (
    state: OpportunityGlobalState,
    action: DecideGoNoGoAction,
    dispatch?: SignalDispatch,
  ) => void;
  setBlockedOperation: (
    state: OpportunityGlobalState,
    action: SetBlockedAction,
    dispatch?: SignalDispatch,
  ) => void;
  clearBlockedOperation: (
    state: OpportunityGlobalState,
    action: ClearBlockedAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDecideByOperation: (
    state: OpportunityGlobalState,
    action: SetDecideByAction,
    dispatch?: SignalDispatch,
  ) => void;
  setExpectedOpeningOperation: (
    state: OpportunityGlobalState,
    action: SetExpectedOpeningAction,
    dispatch?: SignalDispatch,
  ) => void;
}
