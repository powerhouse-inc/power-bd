/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddPaymentStepInput,
  RemovePaymentStepInput,
  UpdatePaymentStepInput,
} from "../types.js";

export type AddPaymentStepAction = Action & {
  type: "ADD_PAYMENT_STEP";
  input: AddPaymentStepInput;
};
export type UpdatePaymentStepAction = Action & {
  type: "UPDATE_PAYMENT_STEP";
  input: UpdatePaymentStepInput;
};
export type RemovePaymentStepAction = Action & {
  type: "REMOVE_PAYMENT_STEP";
  input: RemovePaymentStepInput;
};

export type ProposalPaymentAction =
  | AddPaymentStepAction
  | UpdatePaymentStepAction
  | RemovePaymentStepAction;
