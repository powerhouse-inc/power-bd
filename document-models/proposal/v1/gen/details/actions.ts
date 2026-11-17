/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  SetProposalDetailsInput,
  SetProposalPartiesInput,
} from "../types.js";

export type SetProposalDetailsAction = Action & {
  type: "SET_PROPOSAL_DETAILS";
  input: SetProposalDetailsInput;
};
export type SetProposalPartiesAction = Action & {
  type: "SET_PROPOSAL_PARTIES";
  input: SetProposalPartiesInput;
};

export type ProposalDetailsAction =
  | SetProposalDetailsAction
  | SetProposalPartiesAction;
