/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type {
  AddPaymentStepAction,
  RemovePaymentStepAction,
  UpdatePaymentStepAction,
} from "./actions.js";

export interface ProposalPaymentOperations {
  addPaymentStepOperation: (
    state: ProposalGlobalState,
    action: AddPaymentStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  updatePaymentStepOperation: (
    state: ProposalGlobalState,
    action: UpdatePaymentStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePaymentStepOperation: (
    state: ProposalGlobalState,
    action: RemovePaymentStepAction,
    dispatch?: SignalDispatch,
  ) => void;
}
