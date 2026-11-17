/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AnswerDecisionInput,
  ReopenDecisionInput,
  WithdrawDecisionInput,
} from "../types.js";

export type AnswerDecisionAction = Action & {
  type: "ANSWER_DECISION";
  input: AnswerDecisionInput;
};
export type ReopenDecisionAction = Action & {
  type: "REOPEN_DECISION";
  input: ReopenDecisionInput;
};
export type WithdrawDecisionAction = Action & {
  type: "WITHDRAW_DECISION";
  input: WithdrawDecisionInput;
};

export type DecisionStatusAction =
  | AnswerDecisionAction
  | ReopenDecisionAction
  | WithdrawDecisionAction;
