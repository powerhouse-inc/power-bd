/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
import type {
  AddStepAction,
  RemoveStepAction,
  TargetCutOffAction,
  UpdateStepAction,
} from "./actions.js";

export interface OpportunityDatesOperations {
  addStepOperation: (
    state: OpportunityGlobalState,
    action: AddStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateStepOperation: (
    state: OpportunityGlobalState,
    action: UpdateStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeStepOperation: (
    state: OpportunityGlobalState,
    action: RemoveStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  targetCutOffOperation: (
    state: OpportunityGlobalState,
    action: TargetCutOffAction,
    dispatch?: SignalDispatch,
  ) => void;
}
