/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { OpportunityAction } from "./actions.js";
import type { OpportunityState as OpportunityGlobalState } from "./schema/types.js";

type OpportunityLocalState = Record<PropertyKey, never>;

type OpportunityPHState = PHBaseState & {
  global: OpportunityGlobalState;
  local: OpportunityLocalState;
};
type OpportunityDocument = PHDocument<OpportunityPHState>;

export * from "./schema/types.js";

export type {
  OpportunityAction,
  OpportunityDocument,
  OpportunityGlobalState,
  OpportunityLocalState,
  OpportunityPHState,
};
