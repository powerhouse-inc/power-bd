/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
import type {
  SetProposalDetailsAction,
  SetProposalPartiesAction,
} from "./actions.js";

export interface ProposalDetailsOperations {
  setProposalDetailsOperation: (
    state: ProposalGlobalState,
    action: SetProposalDetailsAction,
    dispatch?: SignalDispatch,
  ) => void;
  setProposalPartiesOperation: (
    state: ProposalGlobalState,
    action: SetProposalPartiesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
