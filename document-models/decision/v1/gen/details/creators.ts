/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetDecideByInputSchema,
  SetDecisionOwnerInputSchema,
  SetQuestionInputSchema,
} from "../schema/zod.js";
import type {
  SetDecideByInput,
  SetDecisionOwnerInput,
  SetQuestionInput,
} from "../types.js";
import type {
  SetDecideByAction,
  SetDecisionOwnerAction,
  SetQuestionAction,
} from "./actions.js";

export const setQuestion = (input: SetQuestionInput) =>
  createAction<SetQuestionAction>(
    "SET_QUESTION",
    { ...input },
    undefined,
    SetQuestionInputSchema,
    "global",
  );

export const setDecisionOwner = (input: SetDecisionOwnerInput) =>
  createAction<SetDecisionOwnerAction>(
    "SET_DECISION_OWNER",
    { ...input },
    undefined,
    SetDecisionOwnerInputSchema,
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
