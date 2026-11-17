/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type { SetLeadDetailsInput, SetOwnerInput } from "../types.js";

export type SetLeadDetailsAction = Action & {
  type: "SET_LEAD_DETAILS";
  input: SetLeadDetailsInput;
};
export type SetOwnerAction = Action & {
  type: "SET_OWNER";
  input: SetOwnerInput;
};

export type LeadDetailsAction = SetLeadDetailsAction | SetOwnerAction;
