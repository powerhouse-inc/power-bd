/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { LeadGlobalState } from "../types.js";
import type {
  ApproveMessageAction,
  DiscardMessageAction,
  DraftMessageAction,
  MarkMessageSentAction,
  ReopenMessageAction,
  UpdateMessageAction,
} from "./actions.js";

export interface LeadMessagesOperations {
  draftMessageOperation: (
    state: LeadGlobalState,
    action: DraftMessageAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateMessageOperation: (
    state: LeadGlobalState,
    action: UpdateMessageAction,
    dispatch?: SignalDispatch,
  ) => void;
  approveMessageOperation: (
    state: LeadGlobalState,
    action: ApproveMessageAction,
    dispatch?: SignalDispatch,
  ) => void;
  reopenMessageOperation: (
    state: LeadGlobalState,
    action: ReopenMessageAction,
    dispatch?: SignalDispatch,
  ) => void;
  markMessageSentOperation: (
    state: LeadGlobalState,
    action: MarkMessageSentAction,
    dispatch?: SignalDispatch,
  ) => void;
  discardMessageOperation: (
    state: LeadGlobalState,
    action: DiscardMessageAction,
    dispatch?: SignalDispatch,
  ) => void;
}
