/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddNeverClaimInputSchema,
  RemoveNeverClaimInputSchema,
  UpdateNeverClaimInputSchema,
} from "../schema/zod.js";
import type {
  AddNeverClaimInput,
  RemoveNeverClaimInput,
  UpdateNeverClaimInput,
} from "../types.js";
import type {
  AddNeverClaimAction,
  RemoveNeverClaimAction,
  UpdateNeverClaimAction,
} from "./actions.js";

export const addNeverClaim = (input: AddNeverClaimInput) =>
  createAction<AddNeverClaimAction>(
    "ADD_NEVER_CLAIM",
    { ...input },
    undefined,
    AddNeverClaimInputSchema,
    "global",
  );

export const updateNeverClaim = (input: UpdateNeverClaimInput) =>
  createAction<UpdateNeverClaimAction>(
    "UPDATE_NEVER_CLAIM",
    { ...input },
    undefined,
    UpdateNeverClaimInputSchema,
    "global",
  );

export const removeNeverClaim = (input: RemoveNeverClaimInput) =>
  createAction<RemoveNeverClaimAction>(
    "REMOVE_NEVER_CLAIM",
    { ...input },
    undefined,
    RemoveNeverClaimInputSchema,
    "global",
  );
