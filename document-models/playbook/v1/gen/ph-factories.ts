/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating PlaybookDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  PlaybookDocument,
  PlaybookGlobalState,
  PlaybookLocalState,
  PlaybookPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): PlaybookGlobalState {
  return { positioning: [], proofCases: [], neverClaims: [] };
}

export function defaultLocalState(): PlaybookLocalState {
  return {};
}

export function defaultPHState(): PlaybookPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<PlaybookGlobalState>,
): PlaybookGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<PlaybookLocalState>,
): PlaybookLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as PlaybookLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<PlaybookGlobalState>,
  localState?: Partial<PlaybookLocalState>,
): PlaybookPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a PlaybookDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createPlaybookDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<PlaybookGlobalState>;
    local?: Partial<PlaybookLocalState>;
  }>,
): PlaybookDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
