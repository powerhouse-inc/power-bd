/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { LeadAction } from "./actions.js";
import type { LeadState as LeadGlobalState } from "./schema/types.js";

type LeadLocalState = Record<PropertyKey, never>;

type LeadPHState = PHBaseState & {
  global: LeadGlobalState;
  local: LeadLocalState;
};
type LeadDocument = PHDocument<LeadPHState>;

export * from "./schema/types.js";

export type {
  LeadAction,
  LeadDocument,
  LeadGlobalState,
  LeadLocalState,
  LeadPHState,
};
