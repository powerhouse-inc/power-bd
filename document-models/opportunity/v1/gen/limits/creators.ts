/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  ClearAttemptLimitInputSchema,
  SetApplyingEntityInputSchema,
  SetAttemptLimitInputSchema,
} from "../schema/zod.js";
import type {
  ClearAttemptLimitInput,
  SetApplyingEntityInput,
  SetAttemptLimitInput,
} from "../types.js";
import type {
  ClearAttemptLimitAction,
  SetApplyingEntityAction,
  SetAttemptLimitAction,
} from "./actions.js";

export const setAttemptLimit = (input: SetAttemptLimitInput) =>
  createAction<SetAttemptLimitAction>(
    "SET_ATTEMPT_LIMIT",
    { ...input },
    undefined,
    SetAttemptLimitInputSchema,
    "global",
  );

export const clearAttemptLimit = (input: ClearAttemptLimitInput = {}) =>
  createAction<ClearAttemptLimitAction>(
    "CLEAR_ATTEMPT_LIMIT",
    { ...input },
    undefined,
    ClearAttemptLimitInputSchema,
    "global",
  );

export const setApplyingEntity = (input: SetApplyingEntityInput) =>
  createAction<SetApplyingEntityAction>(
    "SET_APPLYING_ENTITY",
    { ...input },
    undefined,
    SetApplyingEntityInputSchema,
    "global",
  );
