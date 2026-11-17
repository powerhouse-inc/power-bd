/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { ProposalAction } from "./actions.js";
import type { ProposalState as ProposalGlobalState } from "./schema/types.js";

type ProposalLocalState = Record<PropertyKey, never>;

type ProposalPHState = PHBaseState & {
  global: ProposalGlobalState;
  local: ProposalLocalState;
};
type ProposalDocument = PHDocument<ProposalPHState>;

export * from "./schema/types.js";

export type {
  ProposalAction,
  ProposalDocument,
  ProposalGlobalState,
  ProposalLocalState,
  ProposalPHState,
};
