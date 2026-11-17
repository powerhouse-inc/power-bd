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
import { leadUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsLeadDocument,
  assertIsLeadState,
  isLeadDocument,
  isLeadState,
} from "./document-schema.js";
import { leadDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type { LeadGlobalState, LeadLocalState, LeadPHState } from "./types.js";

export const initialGlobalState: LeadGlobalState = {
  name: null,
  kind: null,
  organisationId: null,
  owner: null,
  status: "TO_CONTACT",
  parkedFrom: null,
  statusReason: null,
  closedAt: null,
  angles: [],
  messages: [],
  nextSteps: [],
  interactions: [],
  contactLinks: [],
  references: [],
  confidentialItems: [],
};
export const initialLocalState: LeadLocalState = {};

export const utils: DocumentModelUtils<LeadPHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, leadDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: leadUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isLeadState(state);
  },
  assertIsStateOfType(state) {
    return assertIsLeadState(state);
  },
  isDocumentOfType(document) {
    return isLeadDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsLeadDocument(document);
  },
};
