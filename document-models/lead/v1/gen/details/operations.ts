/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { LeadGlobalState } from "../types.js";
import type {
  SetExpectedCloseAction,
  SetLeadDetailsAction,
  SetLeadSourceAction,
  SetOwnerAction,
} from "./actions.js";

export interface LeadDetailsOperations {
  setLeadDetailsOperation: (
    state: LeadGlobalState,
    action: SetLeadDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOwnerOperation: (
    state: LeadGlobalState,
    action: SetOwnerAction,
    dispatch?: SignalDispatch,
  ) => void;
  setLeadSourceOperation: (
    state: LeadGlobalState,
    action: SetLeadSourceAction,
    dispatch?: SignalDispatch,
  ) => void;
  setExpectedCloseOperation: (
    state: LeadGlobalState,
    action: SetExpectedCloseAction,
    dispatch?: SignalDispatch,
  ) => void;
}
