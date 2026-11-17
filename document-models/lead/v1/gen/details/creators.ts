/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetLeadDetailsInputSchema,
  SetOwnerInputSchema,
} from "../schema/zod.js";
import type { SetLeadDetailsInput, SetOwnerInput } from "../types.js";
import type { SetLeadDetailsAction, SetOwnerAction } from "./actions.js";

export const setLeadDetails = (input: SetLeadDetailsInput) =>
  createAction<SetLeadDetailsAction>(
    "SET_LEAD_DETAILS",
    { ...input },
    undefined,
    SetLeadDetailsInputSchema,
    "global",
  );

export const setOwner = (input: SetOwnerInput) =>
  createAction<SetOwnerAction>(
    "SET_OWNER",
    { ...input },
    undefined,
    SetOwnerInputSchema,
    "global",
  );
