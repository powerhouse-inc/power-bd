/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddAngleInputSchema,
  RemoveAngleInputSchema,
  UpdateAngleInputSchema,
} from "../schema/zod.js";
import type {
  AddAngleInput,
  RemoveAngleInput,
  UpdateAngleInput,
} from "../types.js";
import type {
  AddAngleAction,
  RemoveAngleAction,
  UpdateAngleAction,
} from "./actions.js";

export const addAngle = (input: AddAngleInput) =>
  createAction<AddAngleAction>(
    "ADD_ANGLE",
    { ...input },
    undefined,
    AddAngleInputSchema,
    "global",
  );

export const updateAngle = (input: UpdateAngleInput) =>
  createAction<UpdateAngleAction>(
    "UPDATE_ANGLE",
    { ...input },
    undefined,
    UpdateAngleInputSchema,
    "global",
  );

export const removeAngle = (input: RemoveAngleInput) =>
  createAction<RemoveAngleAction>(
    "REMOVE_ANGLE",
    { ...input },
    undefined,
    RemoveAngleInputSchema,
    "global",
  );
