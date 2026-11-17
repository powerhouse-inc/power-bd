/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  SetFitInput,
  SetOpportunityDetailsInput,
  SetOwnerInput,
} from "../types.js";

export type SetOpportunityDetailsAction = Action & {
  type: "SET_OPPORTUNITY_DETAILS";
  input: SetOpportunityDetailsInput;
};
export type SetOwnerAction = Action & {
  type: "SET_OWNER";
  input: SetOwnerInput;
};
export type SetFitAction = Action & { type: "SET_FIT"; input: SetFitInput };

export type OpportunityDetailsAction =
  | SetOpportunityDetailsAction
  | SetOwnerAction
  | SetFitAction;
