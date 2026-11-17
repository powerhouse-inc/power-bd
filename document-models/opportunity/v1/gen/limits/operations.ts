/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
import type {
  ClearAttemptLimitAction,
  SetApplyingEntityAction,
  SetAttemptLimitAction,
} from "./actions.js";

export interface OpportunityLimitsOperations {
  setAttemptLimitOperation: (
    state: OpportunityGlobalState,
    action: SetAttemptLimitAction,
    dispatch?: SignalDispatch,
  ) => void;
  clearAttemptLimitOperation: (
    state: OpportunityGlobalState,
    action: ClearAttemptLimitAction,
    dispatch?: SignalDispatch,
  ) => void;
  setApplyingEntityOperation: (
    state: OpportunityGlobalState,
    action: SetApplyingEntityAction,
    dispatch?: SignalDispatch,
  ) => void;
}
