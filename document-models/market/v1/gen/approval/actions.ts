/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type { ApproveSizeInput, ReopenSizeInput } from "../types.js";

export type ApproveSizeAction = Action & {
  type: "APPROVE_SIZE";
  input: ApproveSizeInput;
};
export type ReopenSizeAction = Action & {
  type: "REOPEN_SIZE";
  input: ReopenSizeInput;
};

export type MarketApprovalAction = ApproveSizeAction | ReopenSizeAction;
