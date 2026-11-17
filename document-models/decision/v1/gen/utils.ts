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
import { decisionUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsDecisionDocument,
  assertIsDecisionState,
  isDecisionDocument,
  isDecisionState,
} from "./document-schema.js";
import { decisionDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  DecisionGlobalState,
  DecisionLocalState,
  DecisionPHState,
} from "./types.js";

export const initialGlobalState: DecisionGlobalState = {
  question: null,
  context: null,
  owner: null,
  decideBy: null,
  status: "OPEN",
  answer: null,
  answeredBy: null,
  answeredAt: null,
  reason: null,
  references: [],
};
export const initialLocalState: DecisionLocalState = {};

export const utils: DocumentModelUtils<DecisionPHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, decisionDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: decisionUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isDecisionState(state);
  },
  assertIsStateOfType(state) {
    return assertIsDecisionState(state);
  },
  isDocumentOfType(document) {
    return isDecisionDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsDecisionDocument(document);
  },
};
