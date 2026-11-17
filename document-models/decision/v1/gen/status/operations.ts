/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { DecisionGlobalState } from "../types.js";
import type {
  AnswerDecisionAction,
  ReopenDecisionAction,
  WithdrawDecisionAction,
} from "./actions.js";

export interface DecisionStatusOperations {
  answerDecisionOperation: (
    state: DecisionGlobalState,
    action: AnswerDecisionAction,
    dispatch?: SignalDispatch,
  ) => void;
  reopenDecisionOperation: (
    state: DecisionGlobalState,
    action: ReopenDecisionAction,
    dispatch?: SignalDispatch,
  ) => void;
  withdrawDecisionOperation: (
    state: DecisionGlobalState,
    action: WithdrawDecisionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
