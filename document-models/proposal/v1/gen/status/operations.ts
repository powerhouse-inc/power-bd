/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type {
  ApproveProposalAction,
  MarkProposalSentAction,
  RecordProposalAnswerAction,
  ReopenProposalAction,
  SetSentCopyAction,
  SetSignedCopyAction,
  SupersedeProposalAction,
  WithdrawProposalAction,
} from "./actions.js";

export interface ProposalStatusOperations {
  approveProposalOperation: (
    state: ProposalGlobalState,
    action: ApproveProposalAction,
    dispatch?: SignalDispatch,
  ) => void;
  reopenProposalOperation: (
    state: ProposalGlobalState,
    action: ReopenProposalAction,
    dispatch?: SignalDispatch,
  ) => void;
  markProposalSentOperation: (
    state: ProposalGlobalState,
    action: MarkProposalSentAction,
    dispatch?: SignalDispatch,
  ) => void;
  setSentCopyOperation: (
    state: ProposalGlobalState,
    action: SetSentCopyAction,
    dispatch?: SignalDispatch,
  ) => void;
  recordProposalAnswerOperation: (
    state: ProposalGlobalState,
    action: RecordProposalAnswerAction,
    dispatch?: SignalDispatch,
  ) => void;
  setSignedCopyOperation: (
    state: ProposalGlobalState,
    action: SetSignedCopyAction,
    dispatch?: SignalDispatch,
  ) => void;
  withdrawProposalOperation: (
    state: ProposalGlobalState,
    action: WithdrawProposalAction,
    dispatch?: SignalDispatch,
  ) => void;
  supersedeProposalOperation: (
    state: ProposalGlobalState,
    action: SupersedeProposalAction,
    dispatch?: SignalDispatch,
  ) => void;
}
