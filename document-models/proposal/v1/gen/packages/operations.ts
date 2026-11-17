/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type {
  AddPackageAction,
  RemovePackageAction,
  ReorderPackagesAction,
  UpdatePackageAction,
} from "./actions.js";

export interface ProposalPackagesOperations {
  addPackageOperation: (
    state: ProposalGlobalState,
    action: AddPackageAction,
    dispatch?: SignalDispatch,
  ) => void;
  updatePackageOperation: (
    state: ProposalGlobalState,
    action: UpdatePackageAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePackageOperation: (
    state: ProposalGlobalState,
    action: RemovePackageAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderPackagesOperation: (
    state: ProposalGlobalState,
    action: ReorderPackagesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
