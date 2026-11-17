/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type {
  AddAdjustmentAction,
  AddOptionAction,
  RemoveAdjustmentAction,
  RemoveOptionAction,
  UpdateOptionAction,
} from "./actions.js";

export interface ProposalOptionsOperations {
  addOptionOperation: (
    state: ProposalGlobalState,
    action: AddOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateOptionOperation: (
    state: ProposalGlobalState,
    action: UpdateOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeOptionOperation: (
    state: ProposalGlobalState,
    action: RemoveOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  addAdjustmentOperation: (
    state: ProposalGlobalState,
    action: AddAdjustmentAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAdjustmentOperation: (
    state: ProposalGlobalState,
    action: RemoveAdjustmentAction,
    dispatch?: SignalDispatch,
  ) => void;
}
