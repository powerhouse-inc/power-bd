/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetFitInputSchema,
  SetOpportunityDetailsInputSchema,
  SetOwnerInputSchema,
} from "../schema/zod.js";
import type {
  SetFitInput,
  SetOpportunityDetailsInput,
  SetOwnerInput,
} from "../types.js";
import type {
  SetFitAction,
  SetOpportunityDetailsAction,
  SetOwnerAction,
} from "./actions.js";

export const setOpportunityDetails = (input: SetOpportunityDetailsInput) =>
  createAction<SetOpportunityDetailsAction>(
    "SET_OPPORTUNITY_DETAILS",
    { ...input },
    undefined,
    SetOpportunityDetailsInputSchema,
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

export const setFit = (input: SetFitInput) =>
  createAction<SetFitAction>(
    "SET_FIT",
    { ...input },
    undefined,
    SetFitInputSchema,
    "global",
  );
