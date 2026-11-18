/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetExpectedCloseInputSchema,
  SetLeadDetailsInputSchema,
  SetLeadSourceInputSchema,
  SetOwnerInputSchema,
} from "../schema/zod.js";
import type {
  SetExpectedCloseInput,
  SetLeadDetailsInput,
  SetLeadSourceInput,
  SetOwnerInput,
} from "../types.js";
import type {
  SetExpectedCloseAction,
  SetLeadDetailsAction,
  SetLeadSourceAction,
  SetOwnerAction,
} from "./actions.js";

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

export const setLeadSource = (input: SetLeadSourceInput) =>
  createAction<SetLeadSourceAction>(
    "SET_LEAD_SOURCE",
    { ...input },
    undefined,
    SetLeadSourceInputSchema,
    "global",
  );

export const setExpectedClose = (input: SetExpectedCloseInput) =>
  createAction<SetExpectedCloseAction>(
    "SET_EXPECTED_CLOSE",
    { ...input },
    undefined,
    SetExpectedCloseInputSchema,
    "global",
  );
