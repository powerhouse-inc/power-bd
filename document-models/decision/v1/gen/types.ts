/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { DecisionAction } from "./actions.js";
import type { DecisionState as DecisionGlobalState } from "./schema/types.js";

type DecisionLocalState = Record<PropertyKey, never>;

type DecisionPHState = PHBaseState & {
  global: DecisionGlobalState;
  local: DecisionLocalState;
};
type DecisionDocument = PHDocument<DecisionPHState>;

export * from "./schema/types.js";

export type {
  DecisionAction,
  DecisionDocument,
  DecisionGlobalState,
  DecisionLocalState,
  DecisionPHState,
};
