/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  ApproveMessageInput,
  DiscardMessageInput,
  DraftMessageInput,
  MarkMessageSentInput,
  ReopenMessageInput,
  UpdateMessageInput,
} from "../types.js";

export type DraftMessageAction = Action & {
  type: "DRAFT_MESSAGE";
  input: DraftMessageInput;
};
export type UpdateMessageAction = Action & {
  type: "UPDATE_MESSAGE";
  input: UpdateMessageInput;
};
export type ApproveMessageAction = Action & {
  type: "APPROVE_MESSAGE";
  input: ApproveMessageInput;
};
export type ReopenMessageAction = Action & {
  type: "REOPEN_MESSAGE";
  input: ReopenMessageInput;
};
export type MarkMessageSentAction = Action & {
  type: "MARK_MESSAGE_SENT";
  input: MarkMessageSentInput;
};
export type DiscardMessageAction = Action & {
  type: "DISCARD_MESSAGE";
  input: DiscardMessageInput;
};

export type LeadMessagesAction =
  | DraftMessageAction
  | UpdateMessageAction
  | ApproveMessageAction
  | ReopenMessageAction
  | MarkMessageSentAction
  | DiscardMessageAction;
