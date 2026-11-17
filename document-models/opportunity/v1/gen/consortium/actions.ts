/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddPartnerInput,
  RemovePartnerInput,
  SetCoordinatorInput,
  UpdatePartnerInput,
} from "../types.js";

export type SetCoordinatorAction = Action & {
  type: "SET_COORDINATOR";
  input: SetCoordinatorInput;
};
export type AddPartnerAction = Action & {
  type: "ADD_PARTNER";
  input: AddPartnerInput;
};
export type UpdatePartnerAction = Action & {
  type: "UPDATE_PARTNER";
  input: UpdatePartnerInput;
};
export type RemovePartnerAction = Action & {
  type: "REMOVE_PARTNER";
  input: RemovePartnerInput;
};

export type OpportunityConsortiumAction =
  | SetCoordinatorAction
  | AddPartnerAction
  | UpdatePartnerAction
  | RemovePartnerAction;
