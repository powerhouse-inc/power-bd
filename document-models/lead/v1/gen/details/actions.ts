/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  SetExpectedCloseInput,
  SetLeadDetailsInput,
  SetLeadSourceInput,
  SetOwnerInput,
} from "../types.js";

export type SetLeadDetailsAction = Action & {
  type: "SET_LEAD_DETAILS";
  input: SetLeadDetailsInput;
};
export type SetOwnerAction = Action & {
  type: "SET_OWNER";
  input: SetOwnerInput;
};
export type SetLeadSourceAction = Action & {
  type: "SET_LEAD_SOURCE";
  input: SetLeadSourceInput;
};
export type SetExpectedCloseAction = Action & {
  type: "SET_EXPECTED_CLOSE";
  input: SetExpectedCloseInput;
};

export type LeadDetailsAction =
  | SetLeadDetailsAction
  | SetOwnerAction
  | SetLeadSourceAction
  | SetExpectedCloseAction;
