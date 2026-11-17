/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  ApproveMessageInputSchema,
  DiscardMessageInputSchema,
  DraftMessageInputSchema,
  MarkMessageSentInputSchema,
  ReopenMessageInputSchema,
  UpdateMessageInputSchema,
} from "../schema/zod.js";
import type {
  ApproveMessageInput,
  DiscardMessageInput,
  DraftMessageInput,
  MarkMessageSentInput,
  ReopenMessageInput,
  UpdateMessageInput,
} from "../types.js";
import type {
  ApproveMessageAction,
  DiscardMessageAction,
  DraftMessageAction,
  MarkMessageSentAction,
  ReopenMessageAction,
  UpdateMessageAction,
} from "./actions.js";

export const draftMessage = (input: DraftMessageInput) =>
  createAction<DraftMessageAction>(
    "DRAFT_MESSAGE",
    { ...input },
    undefined,
    DraftMessageInputSchema,
    "global",
  );

export const updateMessage = (input: UpdateMessageInput) =>
  createAction<UpdateMessageAction>(
    "UPDATE_MESSAGE",
    { ...input },
    undefined,
    UpdateMessageInputSchema,
    "global",
  );

export const approveMessage = (input: ApproveMessageInput) =>
  createAction<ApproveMessageAction>(
    "APPROVE_MESSAGE",
    { ...input },
    undefined,
    ApproveMessageInputSchema,
    "global",
  );

export const reopenMessage = (input: ReopenMessageInput) =>
  createAction<ReopenMessageAction>(
    "REOPEN_MESSAGE",
    { ...input },
    undefined,
    ReopenMessageInputSchema,
    "global",
  );

export const markMessageSent = (input: MarkMessageSentInput) =>
  createAction<MarkMessageSentAction>(
    "MARK_MESSAGE_SENT",
    { ...input },
    undefined,
    MarkMessageSentInputSchema,
    "global",
  );

export const discardMessage = (input: DiscardMessageInput) =>
  createAction<DiscardMessageAction>(
    "DISCARD_MESSAGE",
    { ...input },
    undefined,
    DiscardMessageInputSchema,
    "global",
  );
