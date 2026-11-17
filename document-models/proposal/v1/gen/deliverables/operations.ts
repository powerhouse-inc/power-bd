/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type {
  AddDeliverableAction,
  RemoveDeliverableAction,
  ReorderDeliverablesAction,
  SetDeliverablePriceAction,
  UpdateDeliverableAction,
} from "./actions.js";

export interface ProposalDeliverablesOperations {
  addDeliverableOperation: (
    state: ProposalGlobalState,
    action: AddDeliverableAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateDeliverableOperation: (
    state: ProposalGlobalState,
    action: UpdateDeliverableAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDeliverablePriceOperation: (
    state: ProposalGlobalState,
    action: SetDeliverablePriceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeDeliverableOperation: (
    state: ProposalGlobalState,
    action: RemoveDeliverableAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderDeliverablesOperation: (
    state: ProposalGlobalState,
    action: ReorderDeliverablesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
