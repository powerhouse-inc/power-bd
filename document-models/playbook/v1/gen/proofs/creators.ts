/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddProofCaseInputSchema,
  AddProofEvidenceInputSchema,
  LinkProofComparableInputSchema,
  RemoveProofCaseInputSchema,
  RemoveProofEvidenceInputSchema,
  UnlinkProofComparableInputSchema,
  UpdateProofCaseInputSchema,
} from "../schema/zod.js";
import type {
  AddProofCaseInput,
  AddProofEvidenceInput,
  LinkProofComparableInput,
  RemoveProofCaseInput,
  RemoveProofEvidenceInput,
  UnlinkProofComparableInput,
  UpdateProofCaseInput,
} from "../types.js";
import type {
  AddProofCaseAction,
  AddProofEvidenceAction,
  LinkProofComparableAction,
  RemoveProofCaseAction,
  RemoveProofEvidenceAction,
  UnlinkProofComparableAction,
  UpdateProofCaseAction,
} from "./actions.js";

export const addProofCase = (input: AddProofCaseInput) =>
  createAction<AddProofCaseAction>(
    "ADD_PROOF_CASE",
    { ...input },
    undefined,
    AddProofCaseInputSchema,
    "global",
  );

export const updateProofCase = (input: UpdateProofCaseInput) =>
  createAction<UpdateProofCaseAction>(
    "UPDATE_PROOF_CASE",
    { ...input },
    undefined,
    UpdateProofCaseInputSchema,
    "global",
  );

export const removeProofCase = (input: RemoveProofCaseInput) =>
  createAction<RemoveProofCaseAction>(
    "REMOVE_PROOF_CASE",
    { ...input },
    undefined,
    RemoveProofCaseInputSchema,
    "global",
  );

export const addProofEvidence = (input: AddProofEvidenceInput) =>
  createAction<AddProofEvidenceAction>(
    "ADD_PROOF_EVIDENCE",
    { ...input },
    undefined,
    AddProofEvidenceInputSchema,
    "global",
  );

export const removeProofEvidence = (input: RemoveProofEvidenceInput) =>
  createAction<RemoveProofEvidenceAction>(
    "REMOVE_PROOF_EVIDENCE",
    { ...input },
    undefined,
    RemoveProofEvidenceInputSchema,
    "global",
  );

export const linkProofComparable = (input: LinkProofComparableInput) =>
  createAction<LinkProofComparableAction>(
    "LINK_PROOF_COMPARABLE",
    { ...input },
    undefined,
    LinkProofComparableInputSchema,
    "global",
  );

export const unlinkProofComparable = (input: UnlinkProofComparableInput) =>
  createAction<UnlinkProofComparableAction>(
    "UNLINK_PROOF_COMPARABLE",
    { ...input },
    undefined,
    UnlinkProofComparableInputSchema,
    "global",
  );
