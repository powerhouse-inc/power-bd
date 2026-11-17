/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type {
  AddActorAction,
  AddBoundaryAction,
  AddUseCaseAction,
  RemoveActorAction,
  RemoveBoundaryAction,
  RemoveUseCaseAction,
  UpdateActorAction,
  UpdateBoundaryAction,
  UpdateUseCaseAction,
} from "./actions.js";

export interface ProposalScopeOperations {
  addActorOperation: (
    state: ProposalGlobalState,
    action: AddActorAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateActorOperation: (
    state: ProposalGlobalState,
    action: UpdateActorAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeActorOperation: (
    state: ProposalGlobalState,
    action: RemoveActorAction,
    dispatch?: SignalDispatch,
  ) => void;
  addUseCaseOperation: (
    state: ProposalGlobalState,
    action: AddUseCaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateUseCaseOperation: (
    state: ProposalGlobalState,
    action: UpdateUseCaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeUseCaseOperation: (
    state: ProposalGlobalState,
    action: RemoveUseCaseAction,
    dispatch?: SignalDispatch,
  ) => void;
  addBoundaryOperation: (
    state: ProposalGlobalState,
    action: AddBoundaryAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateBoundaryOperation: (
    state: ProposalGlobalState,
    action: UpdateBoundaryAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeBoundaryOperation: (
    state: ProposalGlobalState,
    action: RemoveBoundaryAction,
    dispatch?: SignalDispatch,
  ) => void;
}
