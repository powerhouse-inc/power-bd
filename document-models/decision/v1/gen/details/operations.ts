/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { DecisionGlobalState } from "../types.js";
import type {
  SetDecideByAction,
  SetDecisionOwnerAction,
  SetQuestionAction,
} from "./actions.js";

export interface DecisionDetailsOperations {
  setQuestionOperation: (
    state: DecisionGlobalState,
    action: SetQuestionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDecisionOwnerOperation: (
    state: DecisionGlobalState,
    action: SetDecisionOwnerAction,
    dispatch?: SignalDispatch,
  ) => void;
  setDecideByOperation: (
    state: DecisionGlobalState,
    action: SetDecideByAction,
    dispatch?: SignalDispatch,
  ) => void;
}
