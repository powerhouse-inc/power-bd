/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating InvestorListDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  InvestorListDocument,
  InvestorListGlobalState,
  InvestorListLocalState,
  InvestorListPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): InvestorListGlobalState {
  return { rows: [] };
}

export function defaultLocalState(): InvestorListLocalState {
  return {};
}

export function defaultPHState(): InvestorListPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<InvestorListGlobalState>,
): InvestorListGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<InvestorListLocalState>,
): InvestorListLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as InvestorListLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<InvestorListGlobalState>,
  localState?: Partial<InvestorListLocalState>,
): InvestorListPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a InvestorListDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createInvestorListDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<InvestorListGlobalState>;
    local?: Partial<InvestorListLocalState>;
  }>,
): InvestorListDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
