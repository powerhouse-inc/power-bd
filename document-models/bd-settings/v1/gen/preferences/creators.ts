/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  RemoveTargetInputSchema,
  SetDueWindowInputSchema,
  SetRetentionInputSchema,
  SetTargetInputSchema,
  SetTimeZoneInputSchema,
  SetVaultDriveInputSchema,
} from "../schema/zod.js";
import type {
  RemoveTargetInput,
  SetDueWindowInput,
  SetRetentionInput,
  SetTargetInput,
  SetTimeZoneInput,
  SetVaultDriveInput,
} from "../types.js";
import type {
  RemoveTargetAction,
  SetDueWindowAction,
  SetRetentionAction,
  SetTargetAction,
  SetTimeZoneAction,
  SetVaultDriveAction,
} from "./actions.js";

export const setTimeZone = (input: SetTimeZoneInput) =>
  createAction<SetTimeZoneAction>(
    "SET_TIME_ZONE",
    { ...input },
    undefined,
    SetTimeZoneInputSchema,
    "global",
  );

export const setDueWindow = (input: SetDueWindowInput) =>
  createAction<SetDueWindowAction>(
    "SET_DUE_WINDOW",
    { ...input },
    undefined,
    SetDueWindowInputSchema,
    "global",
  );

export const setVaultDrive = (input: SetVaultDriveInput) =>
  createAction<SetVaultDriveAction>(
    "SET_VAULT_DRIVE",
    { ...input },
    undefined,
    SetVaultDriveInputSchema,
    "global",
  );

export const setRetention = (input: SetRetentionInput) =>
  createAction<SetRetentionAction>(
    "SET_RETENTION",
    { ...input },
    undefined,
    SetRetentionInputSchema,
    "global",
  );

export const setTarget = (input: SetTargetInput) =>
  createAction<SetTargetAction>(
    "SET_TARGET",
    { ...input },
    undefined,
    SetTargetInputSchema,
    "global",
  );

export const removeTarget = (input: RemoveTargetInput) =>
  createAction<RemoveTargetAction>(
    "REMOVE_TARGET",
    { ...input },
    undefined,
    RemoveTargetInputSchema,
    "global",
  );
