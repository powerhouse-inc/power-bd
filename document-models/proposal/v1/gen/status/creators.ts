/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  ApproveProposalInputSchema,
  MarkProposalSentInputSchema,
  RecordProposalAnswerInputSchema,
  ReopenProposalInputSchema,
  SetSentCopyInputSchema,
  SetSignedCopyInputSchema,
  SupersedeProposalInputSchema,
  WithdrawProposalInputSchema,
} from "../schema/zod.js";
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

export const approveProposal = (input: ApproveProposalInput) =>
  createAction<ApproveProposalAction>(
    "APPROVE_PROPOSAL",
    { ...input },
    undefined,
    ApproveProposalInputSchema,
    "global",
  );

export const reopenProposal = (input: ReopenProposalInput = {}) =>
  createAction<ReopenProposalAction>(
    "REOPEN_PROPOSAL",
    { ...input },
    undefined,
    ReopenProposalInputSchema,
    "global",
  );

export const markProposalSent = (input: MarkProposalSentInput) =>
  createAction<MarkProposalSentAction>(
    "MARK_PROPOSAL_SENT",
    { ...input },
    undefined,
    MarkProposalSentInputSchema,
    "global",
  );

export const setSentCopy = (input: SetSentCopyInput) =>
  createAction<SetSentCopyAction>(
    "SET_SENT_COPY",
    { ...input },
    undefined,
    SetSentCopyInputSchema,
    "global",
  );

export const recordProposalAnswer = (input: RecordProposalAnswerInput) =>
  createAction<RecordProposalAnswerAction>(
    "RECORD_PROPOSAL_ANSWER",
    { ...input },
    undefined,
    RecordProposalAnswerInputSchema,
    "global",
  );

export const setSignedCopy = (input: SetSignedCopyInput) =>
  createAction<SetSignedCopyAction>(
    "SET_SIGNED_COPY",
    { ...input },
    undefined,
    SetSignedCopyInputSchema,
    "global",
  );

export const withdrawProposal = (input: WithdrawProposalInput) =>
  createAction<WithdrawProposalAction>(
    "WITHDRAW_PROPOSAL",
    { ...input },
    undefined,
    WithdrawProposalInputSchema,
    "global",
  );

export const supersedeProposal = (input: SupersedeProposalInput) =>
  createAction<SupersedeProposalAction>(
    "SUPERSEDE_PROPOSAL",
    { ...input },
    undefined,
    SupersedeProposalInputSchema,
    "global",
  );
