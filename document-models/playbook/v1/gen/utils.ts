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
import { playbookUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsPlaybookDocument,
  assertIsPlaybookState,
  isPlaybookDocument,
  isPlaybookState,
} from "./document-schema.js";
import { playbookDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  PlaybookGlobalState,
  PlaybookLocalState,
  PlaybookPHState,
} from "./types.js";

export const initialGlobalState: PlaybookGlobalState = {
  positioning: [],
  proofCases: [],
  neverClaims: [],
};
export const initialLocalState: PlaybookLocalState = {};

export const utils: DocumentModelUtils<PlaybookPHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, playbookDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: playbookUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isPlaybookState(state);
  },
  assertIsStateOfType(state) {
    return assertIsPlaybookState(state);
  },
  isDocumentOfType(document) {
    return isPlaybookDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsPlaybookDocument(document);
  },
};
