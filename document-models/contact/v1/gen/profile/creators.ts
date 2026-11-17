/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddTagInputSchema,
  RemoveTagInputSchema,
  SetAddressInputSchema,
  SetProfileInputSchema,
} from "../schema/zod.js";
import type {
  AddTagInput,
  RemoveTagInput,
  SetAddressInput,
  SetProfileInput,
} from "../types.js";
import type {
  AddTagAction,
  RemoveTagAction,
  SetAddressAction,
  SetProfileAction,
} from "./actions.js";

export const setProfile = (input: SetProfileInput) =>
  createAction<SetProfileAction>(
    "SET_PROFILE",
    { ...input },
    undefined,
    SetProfileInputSchema,
    "global",
  );

export const setAddress = (input: SetAddressInput) =>
  createAction<SetAddressAction>(
    "SET_ADDRESS",
    { ...input },
    undefined,
    SetAddressInputSchema,
    "global",
  );

export const addTag = (input: AddTagInput) =>
  createAction<AddTagAction>(
    "ADD_TAG",
    { ...input },
    undefined,
    AddTagInputSchema,
    "global",
  );

export const removeTag = (input: RemoveTagInput) =>
  createAction<RemoveTagAction>(
    "REMOVE_TAG",
    { ...input },
    undefined,
    RemoveTagInputSchema,
    "global",
  );
