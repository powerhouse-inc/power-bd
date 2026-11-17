/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating DecisionDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  DecisionDocument,
  DecisionGlobalState,
  DecisionLocalState,
  DecisionPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): DecisionGlobalState {
  return {
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
}

export function defaultLocalState(): DecisionLocalState {
  return {};
}

export function defaultPHState(): DecisionPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<DecisionGlobalState>,
): DecisionGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<DecisionLocalState>,
): DecisionLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as DecisionLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<DecisionGlobalState>,
  localState?: Partial<DecisionLocalState>,
): DecisionPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a DecisionDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createDecisionDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<DecisionGlobalState>;
    local?: Partial<DecisionLocalState>;
  }>,
): DecisionDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
