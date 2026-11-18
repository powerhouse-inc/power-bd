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
import { marketUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsMarketDocument,
  assertIsMarketState,
  isMarketDocument,
  isMarketState,
} from "./document-schema.js";
import { marketDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  MarketGlobalState,
  MarketLocalState,
  MarketPHState,
} from "./types.js";

export const initialGlobalState: MarketGlobalState = {
  name: null,
  description: null,
  geography: null,
  currency: "EUR",
  horizonYears: 3,
  segments: [],
  publishedFigures: [],
  axes: null,
  players: [],
  us: null,
  sizeStatus: "DRAFT",
  sizeApprovedBy: null,
  sizeApprovedAt: null,
};
export const initialLocalState: MarketLocalState = {};

export const utils: DocumentModelUtils<MarketPHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, marketDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: marketUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isMarketState(state);
  },
  assertIsStateOfType(state) {
    return assertIsMarketState(state);
  },
  isDocumentOfType(document) {
    return isMarketDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsMarketDocument(document);
  },
};
