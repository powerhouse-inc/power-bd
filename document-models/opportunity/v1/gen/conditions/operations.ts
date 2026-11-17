/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
import type {
  AddConditionAction,
  MarkConditionAction,
  RemoveConditionAction,
  UpdateConditionAction,
} from "./actions.js";

export interface OpportunityConditionsOperations {
  addConditionOperation: (
    state: OpportunityGlobalState,
    action: AddConditionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateConditionOperation: (
    state: OpportunityGlobalState,
    action: UpdateConditionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeConditionOperation: (
    state: OpportunityGlobalState,
    action: RemoveConditionAction,
    dispatch?: SignalDispatch,
  ) => void;
  markConditionOperation: (
    state: OpportunityGlobalState,
    action: MarkConditionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
