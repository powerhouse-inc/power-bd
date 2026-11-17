/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetDueWindowInputSchema,
  SetRetentionInputSchema,
  SetTimeZoneInputSchema,
  SetVaultDriveInputSchema,
} from "../schema/zod.js";
import type {
  SetDueWindowInput,
  SetRetentionInput,
  SetTimeZoneInput,
  SetVaultDriveInput,
} from "../types.js";
import type {
  SetDueWindowAction,
  SetRetentionAction,
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
