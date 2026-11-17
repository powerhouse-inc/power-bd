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
import { proposalUpgradeManifest } from "../../upgrades/upgrade-manifest.js";
import {
  assertIsProposalDocument,
  assertIsProposalState,
  isProposalDocument,
  isProposalState,
} from "./document-schema.js";
import { proposalDocumentType } from "./document-type.js";
import { reducer } from "./reducer.js";
import type {
  ProposalGlobalState,
  ProposalLocalState,
  ProposalPHState,
} from "./types.js";

export const initialGlobalState: ProposalGlobalState = {
  title: null,
  code: null,
  leadId: null,
  recipient: null,
  contractingEntity: null,
  currency: null,
  validUntil: null,
  revisesProposalId: null,
  bindingOnSignature: false,
  processesPersonalData: false,
  status: "DRAFT",
  approvedBy: null,
  approvedAt: null,
  sentBy: null,
  sentAt: null,
  sentCopy: null,
  chosenOptionId: null,
  answeredAt: null,
  reason: null,
  signedCopy: null,
  supersededByProposalId: null,
  references: [],
  packages: [],
  deliverables: [],
  options: [],
  paymentSteps: [],
  actors: [],
  useCases: [],
  boundaries: [],
  sections: [],
  clauses: [],
  annexes: [],
  figures: [],
};
export const initialLocalState: ProposalLocalState = {};

export const utils: DocumentModelUtils<ProposalPHState> = {
  fileExtension: "",
  createState(state) {
    return {
      ...createBaseState(state?.auth, { version: 1, ...state?.document }),
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createDocument(state) {
    return baseCreateDocument(utils.createState, state, proposalDocumentType);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromInput(input) {
    return baseLoadFromInputVersioned(input, {
      reducers: { 1: reducer as unknown as Reducer<PHBaseState> },
      upgradeManifest: proposalUpgradeManifest,
    });
  },
  isStateOfType(state) {
    return isProposalState(state);
  },
  assertIsStateOfType(state) {
    return assertIsProposalState(state);
  },
  isDocumentOfType(document) {
    return isProposalDocument(document);
  },
  assertIsDocumentOfType(document) {
    return assertIsProposalDocument(document);
  },
};
