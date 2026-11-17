/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { InvestorListAction } from "./actions.js";
import type { InvestorListState as InvestorListGlobalState } from "./schema/types.js";

type InvestorListLocalState = Record<PropertyKey, never>;

type InvestorListPHState = PHBaseState & {
  global: InvestorListGlobalState;
  local: InvestorListLocalState;
};
type InvestorListDocument = PHDocument<InvestorListPHState>;

export * from "./schema/types.js";

export type {
  InvestorListAction,
  InvestorListDocument,
  InvestorListGlobalState,
  InvestorListLocalState,
  InvestorListPHState,
};
