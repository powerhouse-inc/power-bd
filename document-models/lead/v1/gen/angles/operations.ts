/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { LeadGlobalState } from "../types.js";
import type {
  AddAngleAction,
  RemoveAngleAction,
  UpdateAngleAction,
} from "./actions.js";

export interface LeadAnglesOperations {
  addAngleOperation: (
    state: LeadGlobalState,
    action: AddAngleAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateAngleOperation: (
    state: LeadGlobalState,
    action: UpdateAngleAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAngleOperation: (
    state: LeadGlobalState,
    action: RemoveAngleAction,
    dispatch?: SignalDispatch,
  ) => void;
}
