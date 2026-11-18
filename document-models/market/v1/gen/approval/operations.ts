/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { MarketGlobalState } from "../types.js";
import type { ApproveSizeAction, ReopenSizeAction } from "./actions.js";

export interface MarketApprovalOperations {
  approveSizeOperation: (
    state: MarketGlobalState,
    action: ApproveSizeAction,
    dispatch?: SignalDispatch,
  ) => void;
  reopenSizeOperation: (
    state: MarketGlobalState,
    action: ReopenSizeAction,
    dispatch?: SignalDispatch,
  ) => void;
}
