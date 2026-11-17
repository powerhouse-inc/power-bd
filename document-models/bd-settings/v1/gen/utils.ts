/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentModelUtils, PHBaseState, Reducer } from "document-model";
import {
  baseCreateDocument,
  baseLoadFromInputVersioned,
  baseSaveToFileHandle,
  createBaseState,
} from "document-model";
import { bdSettingsUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsBdSettingsDocument,
  assertIsBdSettingsState,
  isBdSettingsDocument,
  isBdSettingsState,
} from "./document-schema.js";
import { bdSettingsDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  BdSettingsGlobalState,
  BdSettingsLocalState,
  BdSettingsPHState,
} from "./types.js";

export const initialGlobalState: BdSettingsGlobalState = {
  teamMembers: [],
  timeZone: null,
  dueWindowDays: 14,
  vaultDriveId: null,
  retentionMonths: 12,
};
export const initialLocalState: BdSettingsLocalState = {};

export const utils: DocumentModelUtils<BdSettingsPHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, bdSettingsDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: bdSettingsUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isBdSettingsState(state);
  },
  assertIsStateOfType(state) {
    return assertIsBdSettingsState(state);
  },
  isDocumentOfType(document) {
    return isBdSettingsDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsBdSettingsDocument(document);
  },
};
