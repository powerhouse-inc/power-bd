/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddReferenceInputSchema,
  RemoveReferenceInputSchema,
} from "../schema/zod.js";
import type { AddReferenceInput, RemoveReferenceInput } from "../types.js";
import type { AddReferenceAction, RemoveReferenceAction } from "./actions.js";

export const addReference = (input: AddReferenceInput) =>
  createAction<AddReferenceAction>(
    "ADD_REFERENCE",
    { ...input },
    undefined,
    AddReferenceInputSchema,
    "global",
  );

export const removeReference = (input: RemoveReferenceInput) =>
  createAction<RemoveReferenceAction>(
    "REMOVE_REFERENCE",
    { ...input },
    undefined,
    RemoveReferenceInputSchema,
    "global",
  );
