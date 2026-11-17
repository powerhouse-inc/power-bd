/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { LeadGlobalState } from "../types.js";
import type {
  ParkLeadAction,
  SetLeadStatusAction,
  UnparkLeadAction,
} from "./actions.js";

export interface LeadStatusOperations {
  setLeadStatusOperation: (
    state: LeadGlobalState,
    action: SetLeadStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  parkLeadOperation: (
    state: LeadGlobalState,
    action: ParkLeadAction,
    dispatch?: SignalDispatch,
  ) => void;
  unparkLeadOperation: (
    state: LeadGlobalState,
    action: UnparkLeadAction,
    dispatch?: SignalDispatch,
  ) => void;
}
