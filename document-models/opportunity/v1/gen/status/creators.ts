/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  ClearBlockedInputSchema,
  DecideGoNoGoInputSchema,
  SetBlockedInputSchema,
  SetDecideByInputSchema,
  SetExpectedOpeningInputSchema,
  SetOpportunityStatusInputSchema,
} from "../schema/zod.js";
import type {
  ClearBlockedInput,
  DecideGoNoGoInput,
  SetBlockedInput,
  SetDecideByInput,
  SetExpectedOpeningInput,
  SetOpportunityStatusInput,
} from "../types.js";
import type {
  ClearBlockedAction,
  DecideGoNoGoAction,
  SetBlockedAction,
  SetDecideByAction,
  SetExpectedOpeningAction,
  SetOpportunityStatusAction,
} from "./actions.js";

export const setOpportunityStatus = (input: SetOpportunityStatusInput) =>
  createAction<SetOpportunityStatusAction>(
    "SET_OPPORTUNITY_STATUS",
    { ...input },
    undefined,
    SetOpportunityStatusInputSchema,
    "global",
  );

export const decideGoNoGo = (input: DecideGoNoGoInput) =>
  createAction<DecideGoNoGoAction>(
    "DECIDE_GO_NO_GO",
    { ...input },
    undefined,
    DecideGoNoGoInputSchema,
    "global",
  );

export const setBlocked = (input: SetBlockedInput) =>
  createAction<SetBlockedAction>(
    "SET_BLOCKED",
    { ...input },
    undefined,
    SetBlockedInputSchema,
    "global",
  );

export const clearBlocked = (input: ClearBlockedInput = {}) =>
  createAction<ClearBlockedAction>(
    "CLEAR_BLOCKED",
    { ...input },
    undefined,
    ClearBlockedInputSchema,
    "global",
  );

export const setDecideBy = (input: SetDecideByInput) =>
  createAction<SetDecideByAction>(
    "SET_DECIDE_BY",
    { ...input },
    undefined,
    SetDecideByInputSchema,
    "global",
  );

export const setExpectedOpening = (input: SetExpectedOpeningInput) =>
  createAction<SetExpectedOpeningAction>(
    "SET_EXPECTED_OPENING",
    { ...input },
    undefined,
    SetExpectedOpeningInputSchema,
    "global",
  );
