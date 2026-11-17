/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { BdSettingsPreferencesAction } from "./preferences/actions.js";
import type { BdSettingsTeamAction } from "./team/actions.js";

export * from "./preferences/actions.js";
export * from "./team/actions.js";

export type BdSettingsAction =
  | BdSettingsTeamAction
  | BdSettingsPreferencesAction;
