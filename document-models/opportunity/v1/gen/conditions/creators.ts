/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddConditionInputSchema,
  MarkConditionInputSchema,
  RemoveConditionInputSchema,
  UpdateConditionInputSchema,
} from "../schema/zod.js";
import type {
  AddConditionInput,
  MarkConditionInput,
  RemoveConditionInput,
  UpdateConditionInput,
} from "../types.js";
import type {
  AddConditionAction,
  MarkConditionAction,
  RemoveConditionAction,
  UpdateConditionAction,
} from "./actions.js";

export const addCondition = (input: AddConditionInput) =>
  createAction<AddConditionAction>(
    "ADD_CONDITION",
    { ...input },
    undefined,
    AddConditionInputSchema,
    "global",
  );

export const updateCondition = (input: UpdateConditionInput) =>
  createAction<UpdateConditionAction>(
    "UPDATE_CONDITION",
    { ...input },
    undefined,
    UpdateConditionInputSchema,
    "global",
  );

export const removeCondition = (input: RemoveConditionInput) =>
  createAction<RemoveConditionAction>(
    "REMOVE_CONDITION",
    { ...input },
    undefined,
    RemoveConditionInputSchema,
    "global",
  );

export const markCondition = (input: MarkConditionInput) =>
  createAction<MarkConditionAction>(
    "MARK_CONDITION",
    { ...input },
    undefined,
    MarkConditionInputSchema,
    "global",
  );
