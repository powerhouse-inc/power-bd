/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddPaymentStepInputSchema,
  RemovePaymentStepInputSchema,
  UpdatePaymentStepInputSchema,
} from "../schema/zod.js";
import type {
  AddPaymentStepInput,
  RemovePaymentStepInput,
  UpdatePaymentStepInput,
} from "../types.js";
import type {
  AddPaymentStepAction,
  RemovePaymentStepAction,
  UpdatePaymentStepAction,
} from "./actions.js";

export const addPaymentStep = (input: AddPaymentStepInput) =>
  createAction<AddPaymentStepAction>(
    "ADD_PAYMENT_STEP",
    { ...input },
    undefined,
    AddPaymentStepInputSchema,
    "global",
  );

export const updatePaymentStep = (input: UpdatePaymentStepInput) =>
  createAction<UpdatePaymentStepAction>(
    "UPDATE_PAYMENT_STEP",
    { ...input },
    undefined,
    UpdatePaymentStepInputSchema,
    "global",
  );

export const removePaymentStep = (input: RemovePaymentStepInput) =>
  createAction<RemovePaymentStepAction>(
    "REMOVE_PAYMENT_STEP",
    { ...input },
    undefined,
    RemovePaymentStepInputSchema,
    "global",
  );
