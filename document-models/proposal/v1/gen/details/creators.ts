/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  SetProposalDetailsInputSchema,
  SetProposalPartiesInputSchema,
} from "../schema/zod.js";
import type {
  SetProposalDetailsInput,
  SetProposalPartiesInput,
} from "../types.js";
import type {
  SetProposalDetailsAction,
  SetProposalPartiesAction,
} from "./actions.js";

export const setProposalDetails = (input: SetProposalDetailsInput) =>
  createAction<SetProposalDetailsAction>(
    "SET_PROPOSAL_DETAILS",
    { ...input },
    undefined,
    SetProposalDetailsInputSchema,
    "global",
  );

export const setProposalParties = (input: SetProposalPartiesInput) =>
  createAction<SetProposalPartiesAction>(
    "SET_PROPOSAL_PARTIES",
    { ...input },
    undefined,
    SetProposalPartiesInputSchema,
    "global",
  );
