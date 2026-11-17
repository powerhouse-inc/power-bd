/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AnswerDecisionInputSchema,
  ReopenDecisionInputSchema,
  WithdrawDecisionInputSchema,
} from "../schema/zod.js";
import type {
  AnswerDecisionInput,
  ReopenDecisionInput,
  WithdrawDecisionInput,
} from "../types.js";
import type {
  AnswerDecisionAction,
  ReopenDecisionAction,
  WithdrawDecisionAction,
} from "./actions.js";

export const answerDecision = (input: AnswerDecisionInput) =>
  createAction<AnswerDecisionAction>(
    "ANSWER_DECISION",
    { ...input },
    undefined,
    AnswerDecisionInputSchema,
    "global",
  );

export const reopenDecision = (input: ReopenDecisionInput) =>
  createAction<ReopenDecisionAction>(
    "REOPEN_DECISION",
    { ...input },
    undefined,
    ReopenDecisionInputSchema,
    "global",
  );

export const withdrawDecision = (input: WithdrawDecisionInput) =>
  createAction<WithdrawDecisionAction>(
    "WITHDRAW_DECISION",
    { ...input },
    undefined,
    WithdrawDecisionInputSchema,
    "global",
  );
