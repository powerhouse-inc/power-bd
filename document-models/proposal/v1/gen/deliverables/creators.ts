/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddDeliverableInputSchema,
  RemoveDeliverableInputSchema,
  ReorderDeliverablesInputSchema,
  SetDeliverablePriceInputSchema,
  UpdateDeliverableInputSchema,
} from "../schema/zod.js";
import type {
  AddDeliverableInput,
  RemoveDeliverableInput,
  ReorderDeliverablesInput,
  SetDeliverablePriceInput,
  UpdateDeliverableInput,
} from "../types.js";
import type {
  AddDeliverableAction,
  RemoveDeliverableAction,
  ReorderDeliverablesAction,
  SetDeliverablePriceAction,
  UpdateDeliverableAction,
} from "./actions.js";

export const addDeliverable = (input: AddDeliverableInput) =>
  createAction<AddDeliverableAction>(
    "ADD_DELIVERABLE",
    { ...input },
    undefined,
    AddDeliverableInputSchema,
    "global",
  );

export const updateDeliverable = (input: UpdateDeliverableInput) =>
  createAction<UpdateDeliverableAction>(
    "UPDATE_DELIVERABLE",
    { ...input },
    undefined,
    UpdateDeliverableInputSchema,
    "global",
  );

export const setDeliverablePrice = (input: SetDeliverablePriceInput) =>
  createAction<SetDeliverablePriceAction>(
    "SET_DELIVERABLE_PRICE",
    { ...input },
    undefined,
    SetDeliverablePriceInputSchema,
    "global",
  );

export const removeDeliverable = (input: RemoveDeliverableInput) =>
  createAction<RemoveDeliverableAction>(
    "REMOVE_DELIVERABLE",
    { ...input },
    undefined,
    RemoveDeliverableInputSchema,
    "global",
  );

export const reorderDeliverables = (input: ReorderDeliverablesInput) =>
  createAction<ReorderDeliverablesAction>(
    "REORDER_DELIVERABLES",
    { ...input },
    undefined,
    ReorderDeliverablesInputSchema,
    "global",
  );
