/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating OpportunityDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  OpportunityDocument,
  OpportunityGlobalState,
  OpportunityLocalState,
  OpportunityPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): OpportunityGlobalState {
  return {
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
}

export function defaultLocalState(): OpportunityLocalState {
  return {};
}

export function defaultPHState(): OpportunityPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<OpportunityGlobalState>,
): OpportunityGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<OpportunityLocalState>,
): OpportunityLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as OpportunityLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<OpportunityGlobalState>,
  localState?: Partial<OpportunityLocalState>,
): OpportunityPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a OpportunityDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createOpportunityDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<OpportunityGlobalState>;
    local?: Partial<OpportunityLocalState>;
  }>,
): OpportunityDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
