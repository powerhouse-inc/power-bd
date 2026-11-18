/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { MarketGlobalState } from "../types.js";
import type {
  AddPublishedFigureAction,
  RemovePublishedFigureAction,
} from "./actions.js";

export interface MarketFiguresOperations {
  addPublishedFigureOperation: (
    state: MarketGlobalState,
    action: AddPublishedFigureAction,
    dispatch?: SignalDispatch,
  ) => void;
  removePublishedFigureOperation: (
    state: MarketGlobalState,
    action: RemovePublishedFigureAction,
    dispatch?: SignalDispatch,
  ) => void;
}
