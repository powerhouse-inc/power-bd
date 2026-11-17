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
import { investorListUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsInvestorListDocument,
  assertIsInvestorListState,
  isInvestorListDocument,
  isInvestorListState,
} from "./document-schema.js";
import { investorListDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  InvestorListGlobalState,
  InvestorListLocalState,
  InvestorListPHState,
} from "./types.js";

export const initialGlobalState: InvestorListGlobalState = { rows: [] };
export const initialLocalState: InvestorListLocalState = {};

export const utils: DocumentModelUtils<InvestorListPHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(
      utils.createState,
      state,
      investorListDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: investorListUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isInvestorListState(state);
  },
  assertIsStateOfType(state) {
    return assertIsInvestorListState(state);
  },
  isDocumentOfType(document) {
    return isInvestorListDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsInvestorListDocument(document);
  },
};
