/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddAdjustmentInputSchema,
  AddOptionInputSchema,
  RemoveAdjustmentInputSchema,
  RemoveOptionInputSchema,
  UpdateOptionInputSchema,
} from "../schema/zod.js";
import type {
  AddAdjustmentInput,
  AddOptionInput,
  RemoveAdjustmentInput,
  RemoveOptionInput,
  UpdateOptionInput,
} from "../types.js";
import type {
  AddAdjustmentAction,
  AddOptionAction,
  RemoveAdjustmentAction,
  RemoveOptionAction,
  UpdateOptionAction,
} from "./actions.js";

export const addOption = (input: AddOptionInput) =>
  createAction<AddOptionAction>(
    "ADD_OPTION",
    { ...input },
    undefined,
    AddOptionInputSchema,
    "global",
  );

export const updateOption = (input: UpdateOptionInput) =>
  createAction<UpdateOptionAction>(
    "UPDATE_OPTION",
    { ...input },
    undefined,
    UpdateOptionInputSchema,
    "global",
  );

export const removeOption = (input: RemoveOptionInput) =>
  createAction<RemoveOptionAction>(
    "REMOVE_OPTION",
    { ...input },
    undefined,
    RemoveOptionInputSchema,
    "global",
  );

export const addAdjustment = (input: AddAdjustmentInput) =>
  createAction<AddAdjustmentAction>(
    "ADD_ADJUSTMENT",
    { ...input },
    undefined,
    AddAdjustmentInputSchema,
    "global",
  );

export const removeAdjustment = (input: RemoveAdjustmentInput) =>
  createAction<RemoveAdjustmentAction>(
    "REMOVE_ADJUSTMENT",
    { ...input },
    undefined,
    RemoveAdjustmentInputSchema,
    "global",
  );
