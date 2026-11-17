/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  ParkLeadInputSchema,
  SetLeadStatusInputSchema,
  UnparkLeadInputSchema,
} from "../schema/zod.js";
import type {
  ParkLeadInput,
  SetLeadStatusInput,
  UnparkLeadInput,
} from "../types.js";
import type {
  ParkLeadAction,
  SetLeadStatusAction,
  UnparkLeadAction,
} from "./actions.js";

export const setLeadStatus = (input: SetLeadStatusInput) =>
  createAction<SetLeadStatusAction>(
    "SET_LEAD_STATUS",
    { ...input },
    undefined,
    SetLeadStatusInputSchema,
    "global",
  );

export const parkLead = (input: ParkLeadInput) =>
  createAction<ParkLeadAction>(
    "PARK_LEAD",
    { ...input },
    undefined,
    ParkLeadInputSchema,
    "global",
  );

export const unparkLead = (input: UnparkLeadInput = {}) =>
  createAction<UnparkLeadAction>(
    "UNPARK_LEAD",
    { ...input },
    undefined,
    UnparkLeadInputSchema,
    "global",
  );
