/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddDeliverableInput,
  RemoveDeliverableInput,
  ReorderDeliverablesInput,
  SetDeliverablePriceInput,
  UpdateDeliverableInput,
} from "../types.js";

export type AddDeliverableAction = Action & {
  type: "ADD_DELIVERABLE";
  input: AddDeliverableInput;
};
export type UpdateDeliverableAction = Action & {
  type: "UPDATE_DELIVERABLE";
  input: UpdateDeliverableInput;
};
export type SetDeliverablePriceAction = Action & {
  type: "SET_DELIVERABLE_PRICE";
  input: SetDeliverablePriceInput;
};
export type RemoveDeliverableAction = Action & {
  type: "REMOVE_DELIVERABLE";
  input: RemoveDeliverableInput;
};
export type ReorderDeliverablesAction = Action & {
  type: "REORDER_DELIVERABLES";
  input: ReorderDeliverablesInput;
};

export type ProposalDeliverablesAction =
  | AddDeliverableAction
  | UpdateDeliverableAction
  | SetDeliverablePriceAction
  | RemoveDeliverableAction
  | ReorderDeliverablesAction;
