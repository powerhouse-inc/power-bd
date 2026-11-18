/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { MarketGlobalState } from "../types.js";
import type { SetMarketDetailsAction } from "./actions.js";

export interface MarketDetailsOperations {
  setMarketDetailsOperation: (
    state: MarketGlobalState,
    action: SetMarketDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
}
