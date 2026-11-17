/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
import type {
  SetFitAction,
  SetOpportunityDetailsAction,
  SetOwnerAction,
} from "./actions.js";

export interface OpportunityDetailsOperations {
  setOpportunityDetailsOperation: (
    state: OpportunityGlobalState,
    action: SetOpportunityDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOwnerOperation: (
    state: OpportunityGlobalState,
    action: SetOwnerAction,
    dispatch?: SignalDispatch,
  ) => void;
  setFitOperation: (
    state: OpportunityGlobalState,
    action: SetFitAction,
    dispatch?: SignalDispatch,
  ) => void;
}
