/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating ProposalDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  ProposalDocument,
  ProposalGlobalState,
  ProposalLocalState,
  ProposalPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): ProposalGlobalState {
  return {
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
}

export function defaultLocalState(): ProposalLocalState {
  return {};
}

export function defaultPHState(): ProposalPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<ProposalGlobalState>,
): ProposalGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<ProposalLocalState>,
): ProposalLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as ProposalLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<ProposalGlobalState>,
  localState?: Partial<ProposalLocalState>,
): ProposalPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a ProposalDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createProposalDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<ProposalGlobalState>;
    local?: Partial<ProposalLocalState>;
  }>,
): ProposalDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
