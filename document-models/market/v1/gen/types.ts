/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { MarketAction } from "./actions.js";
import type { MarketState as MarketGlobalState } from "./schema/types.js";

type MarketLocalState = Record<PropertyKey, never>;

type MarketPHState = PHBaseState & {
  global: MarketGlobalState;
  local: MarketLocalState;
};
type MarketDocument = PHDocument<MarketPHState>;

export * from "./schema/types.js";

export type {
  MarketAction,
  MarketDocument,
  MarketGlobalState,
  MarketLocalState,
  MarketPHState,
};
