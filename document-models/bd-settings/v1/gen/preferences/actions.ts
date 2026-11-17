/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  SetDueWindowInput,
  SetRetentionInput,
  SetTimeZoneInput,
  SetVaultDriveInput,
} from "../types.js";

export type SetTimeZoneAction = Action & {
  type: "SET_TIME_ZONE";
  input: SetTimeZoneInput;
};
export type SetDueWindowAction = Action & {
  type: "SET_DUE_WINDOW";
  input: SetDueWindowInput;
};
export type SetVaultDriveAction = Action & {
  type: "SET_VAULT_DRIVE";
  input: SetVaultDriveInput;
};
export type SetRetentionAction = Action & {
  type: "SET_RETENTION";
  input: SetRetentionInput;
};

export type BdSettingsPreferencesAction =
  | SetTimeZoneAction
  | SetDueWindowAction
  | SetVaultDriveAction
  | SetRetentionAction;
