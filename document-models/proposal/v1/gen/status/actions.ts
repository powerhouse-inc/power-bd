/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  ApproveProposalInput,
  MarkProposalSentInput,
  RecordProposalAnswerInput,
  ReopenProposalInput,
  SetSentCopyInput,
  SetSignedCopyInput,
  SupersedeProposalInput,
  WithdrawProposalInput,
} from "../types.js";

export type ApproveProposalAction = Action & {
  type: "APPROVE_PROPOSAL";
  input: ApproveProposalInput;
};
export type ReopenProposalAction = Action & {
  type: "REOPEN_PROPOSAL";
  input: ReopenProposalInput;
};
export type MarkProposalSentAction = Action & {
  type: "MARK_PROPOSAL_SENT";
  input: MarkProposalSentInput;
};
export type SetSentCopyAction = Action & {
  type: "SET_SENT_COPY";
  input: SetSentCopyInput;
};
export type RecordProposalAnswerAction = Action & {
  type: "RECORD_PROPOSAL_ANSWER";
  input: RecordProposalAnswerInput;
};
export type SetSignedCopyAction = Action & {
  type: "SET_SIGNED_COPY";
  input: SetSignedCopyInput;
};
export type WithdrawProposalAction = Action & {
  type: "WITHDRAW_PROPOSAL";
  input: WithdrawProposalInput;
};
export type SupersedeProposalAction = Action & {
  type: "SUPERSEDE_PROPOSAL";
  input: SupersedeProposalInput;
};

export type ProposalStatusAction =
  | ApproveProposalAction
  | ReopenProposalAction
  | MarkProposalSentAction
  | SetSentCopyAction
  | RecordProposalAnswerAction
  | SetSignedCopyAction
  | WithdrawProposalAction
  | SupersedeProposalAction;
