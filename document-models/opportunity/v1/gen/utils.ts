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
import { opportunityUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsOpportunityDocument,
  assertIsOpportunityState,
  isOpportunityDocument,
  isOpportunityState,
} from "./document-schema.js";
import { opportunityDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  OpportunityGlobalState,
  OpportunityLocalState,
  OpportunityPHState,
} from "./types.js";

export const initialGlobalState: OpportunityGlobalState = {
  name: null,
  funderId: null,
  programme: null,
  roundLabel: null,
  roundOpenedAt: null,
  instrument: null,
  amount: null,
  currency: null,
  fundingRate: null,
  whereToApply: null,
  rolling: false,
  owner: null,
  fit: null,
  fitReasoning: null,
  status: "TO_EVALUATE",
  statusReason: null,
  closedAt: null,
  expectedOpening: null,
  decideBy: null,
  blocked: null,
  goNoGoDecisions: [],
  steps: [],
  conditions: [],
  attemptLimit: null,
  applyingEntity: null,
  submissions: [],
  coordinatorId: null,
  partners: [],
  nextSteps: [],
  interactions: [],
  contactLinks: [],
  references: [],
  confidentialItems: [],
};
export const initialLocalState: OpportunityLocalState = {};

export const utils: DocumentModelUtils<OpportunityPHState> = {
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
      opportunityDocumentType,
    );
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: opportunityUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isOpportunityState(state);
  },
  assertIsStateOfType(state) {
    return assertIsOpportunityState(state);
  },
  isDocumentOfType(document) {
    return isOpportunityDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsOpportunityDocument(document);
  },
};
