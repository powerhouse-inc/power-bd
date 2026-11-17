/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { BdSettingsGlobalState } from "../types.js";
import type {
  AddTeamMemberAction,
  DeactivateTeamMemberAction,
  ReactivateTeamMemberAction,
  UpdateTeamMemberAction,
} from "./actions.js";

export interface BdSettingsTeamOperations {
  addTeamMemberOperation: (
    state: BdSettingsGlobalState,
    action: AddTeamMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTeamMemberOperation: (
    state: BdSettingsGlobalState,
    action: UpdateTeamMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  deactivateTeamMemberOperation: (
    state: BdSettingsGlobalState,
    action: DeactivateTeamMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
  reactivateTeamMemberOperation: (
    state: BdSettingsGlobalState,
    action: ReactivateTeamMemberAction,
    dispatch?: SignalDispatch,
  ) => void;
}
