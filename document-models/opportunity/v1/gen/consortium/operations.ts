/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
import type {
  AddPartnerAction,
  RemovePartnerAction,
  SetCoordinatorAction,
  UpdatePartnerAction,
} from "./actions.js";

export interface OpportunityConsortiumOperations {
  setCoordinatorOperation: (
    state: OpportunityGlobalState,
    action: SetCoordinatorAction,
    dispatch?: SignalDispatch,
  ) => void;
  addPartnerOperation: (
    state: OpportunityGlobalState,
    action: AddPartnerAction,
    dispatch?: SignalDispatch,
  ) => void;
  updatePartnerOperation: (
    state: OpportunityGlobalState,
    action: UpdatePartnerAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePartnerOperation: (
    state: OpportunityGlobalState,
    action: RemovePartnerAction,
    dispatch?: SignalDispatch,
  ) => void;
}
