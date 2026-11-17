/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating LeadDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  LeadDocument,
  LeadGlobalState,
  LeadLocalState,
  LeadPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): LeadGlobalState {
  return {
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
}

export function defaultLocalState(): LeadLocalState {
  return {};
}

export function defaultPHState(): LeadPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<LeadGlobalState>,
): LeadGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<LeadLocalState>,
): LeadLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as LeadLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<LeadGlobalState>,
  localState?: Partial<LeadLocalState>,
): LeadPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a LeadDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createLeadDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<LeadGlobalState>;
    local?: Partial<LeadLocalState>;
  }>,
): LeadDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
