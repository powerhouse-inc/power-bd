/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating MarketDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  MarketDocument,
  MarketGlobalState,
  MarketLocalState,
  MarketPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): MarketGlobalState {
  return {
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
}

export function defaultLocalState(): MarketLocalState {
  return {};
}

export function defaultPHState(): MarketPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<MarketGlobalState>,
): MarketGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<MarketLocalState>,
): MarketLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as MarketLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<MarketGlobalState>,
  localState?: Partial<MarketLocalState>,
): MarketPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a MarketDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createMarketDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<MarketGlobalState>;
    local?: Partial<MarketLocalState>;
  }>,
): MarketDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
