/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  ParkLeadInput,
  SetLeadStatusInput,
  UnparkLeadInput,
} from "../types.js";

export type SetLeadStatusAction = Action & {
  type: "SET_LEAD_STATUS";
  input: SetLeadStatusInput;
};
export type ParkLeadAction = Action & {
  type: "PARK_LEAD";
  input: ParkLeadInput;
};
export type UnparkLeadAction = Action & {
  type: "UNPARK_LEAD";
  input: UnparkLeadInput;
};

export type LeadStatusAction =
  | SetLeadStatusAction
  | ParkLeadAction
  | UnparkLeadAction;
