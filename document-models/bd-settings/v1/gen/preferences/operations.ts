/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { BdSettingsGlobalState } from "../types.js";
import type {
  RemoveTargetAction,
  SetDueWindowAction,
  SetRetentionAction,
  SetTargetAction,
  SetTimeZoneAction,
  SetVaultDriveAction,
} from "./actions.js";

export interface BdSettingsPreferencesOperations {
  setTimeZoneOperation: (
    state: BdSettingsGlobalState,
    action: SetTimeZoneAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDueWindowOperation: (
    state: BdSettingsGlobalState,
    action: SetDueWindowAction,
    dispatch?: SignalDispatch,
  ) => void;
  setVaultDriveOperation: (
    state: BdSettingsGlobalState,
    action: SetVaultDriveAction,
    dispatch?: SignalDispatch,
  ) => void;
  setRetentionOperation: (
    state: BdSettingsGlobalState,
    action: SetRetentionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTargetOperation: (
    state: BdSettingsGlobalState,
    action: SetTargetAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeTargetOperation: (
    state: BdSettingsGlobalState,
    action: RemoveTargetAction,
    dispatch?: SignalDispatch,
  ) => void;
}
