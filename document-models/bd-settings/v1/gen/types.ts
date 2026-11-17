/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { BdSettingsAction } from "./actions.js";
import type { BdSettingsState as BdSettingsGlobalState } from "./schema/types.js";

type BdSettingsLocalState = Record<PropertyKey, never>;

type BdSettingsPHState = PHBaseState & {
  global: BdSettingsGlobalState;
  local: BdSettingsLocalState;
};
type BdSettingsDocument = PHDocument<BdSettingsPHState>;

export * from "./schema/types.js";

export type {
  BdSettingsAction,
  BdSettingsDocument,
  BdSettingsGlobalState,
  BdSettingsLocalState,
  BdSettingsPHState,
};
