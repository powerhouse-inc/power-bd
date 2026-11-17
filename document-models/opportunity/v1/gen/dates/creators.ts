/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddStepInputSchema,
  RemoveStepInputSchema,
  TargetCutOffInputSchema,
  UpdateStepInputSchema,
} from "../schema/zod.js";
import type {
  AddStepInput,
  RemoveStepInput,
  TargetCutOffInput,
  UpdateStepInput,
} from "../types.js";
import type {
  AddStepAction,
  RemoveStepAction,
  TargetCutOffAction,
  UpdateStepAction,
} from "./actions.js";

export const addStep = (input: AddStepInput) =>
  createAction<AddStepAction>(
    "ADD_STEP",
    { ...input },
    undefined,
    AddStepInputSchema,
    "global",
  );

export const updateStep = (input: UpdateStepInput) =>
  createAction<UpdateStepAction>(
    "UPDATE_STEP",
    { ...input },
    undefined,
    UpdateStepInputSchema,
    "global",
  );

export const removeStep = (input: RemoveStepInput) =>
  createAction<RemoveStepAction>(
    "REMOVE_STEP",
    { ...input },
    undefined,
    RemoveStepInputSchema,
    "global",
  );

export const targetCutOff = (input: TargetCutOffInput) =>
  createAction<TargetCutOffAction>(
    "TARGET_CUT_OFF",
    { ...input },
    undefined,
    TargetCutOffInputSchema,
    "global",
  );
