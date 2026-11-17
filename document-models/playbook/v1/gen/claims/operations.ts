/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { PlaybookGlobalState } from "../types.js";
import type {
  AddNeverClaimAction,
  RemoveNeverClaimAction,
  UpdateNeverClaimAction,
} from "./actions.js";

export interface PlaybookClaimsOperations {
  addNeverClaimOperation: (
    state: PlaybookGlobalState,
    action: AddNeverClaimAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateNeverClaimOperation: (
    state: PlaybookGlobalState,
    action: UpdateNeverClaimAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeNeverClaimOperation: (
    state: PlaybookGlobalState,
    action: RemoveNeverClaimAction,
    dispatch?: SignalDispatch,
  ) => void;
}
