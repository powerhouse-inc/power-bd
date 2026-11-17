/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddPositioningInputSchema,
  ApprovePositioningInputSchema,
  LinkPositioningComparableInputSchema,
  LinkPositioningProofInputSchema,
  RetirePositioningInputSchema,
  UnlinkPositioningComparableInputSchema,
  UnlinkPositioningProofInputSchema,
  UpdatePositioningInputSchema,
} from "../schema/zod.js";
import type {
  AddPositioningInput,
  ApprovePositioningInput,
  LinkPositioningComparableInput,
  LinkPositioningProofInput,
  RetirePositioningInput,
  UnlinkPositioningComparableInput,
  UnlinkPositioningProofInput,
  UpdatePositioningInput,
} from "../types.js";
import type {
  AddPositioningAction,
  ApprovePositioningAction,
  LinkPositioningComparableAction,
  LinkPositioningProofAction,
  RetirePositioningAction,
  UnlinkPositioningComparableAction,
  UnlinkPositioningProofAction,
  UpdatePositioningAction,
} from "./actions.js";

export const addPositioning = (input: AddPositioningInput) =>
  createAction<AddPositioningAction>(
    "ADD_POSITIONING",
    { ...input },
    undefined,
    AddPositioningInputSchema,
    "global",
  );

export const updatePositioning = (input: UpdatePositioningInput) =>
  createAction<UpdatePositioningAction>(
    "UPDATE_POSITIONING",
    { ...input },
    undefined,
    UpdatePositioningInputSchema,
    "global",
  );

export const approvePositioning = (input: ApprovePositioningInput) =>
  createAction<ApprovePositioningAction>(
    "APPROVE_POSITIONING",
    { ...input },
    undefined,
    ApprovePositioningInputSchema,
    "global",
  );

export const retirePositioning = (input: RetirePositioningInput) =>
  createAction<RetirePositioningAction>(
    "RETIRE_POSITIONING",
    { ...input },
    undefined,
    RetirePositioningInputSchema,
    "global",
  );

export const linkPositioningComparable = (
  input: LinkPositioningComparableInput,
) =>
  createAction<LinkPositioningComparableAction>(
    "LINK_POSITIONING_COMPARABLE",
    { ...input },
    undefined,
    LinkPositioningComparableInputSchema,
    "global",
  );

export const unlinkPositioningComparable = (
  input: UnlinkPositioningComparableInput,
) =>
  createAction<UnlinkPositioningComparableAction>(
    "UNLINK_POSITIONING_COMPARABLE",
    { ...input },
    undefined,
    UnlinkPositioningComparableInputSchema,
    "global",
  );

export const linkPositioningProof = (input: LinkPositioningProofInput) =>
  createAction<LinkPositioningProofAction>(
    "LINK_POSITIONING_PROOF",
    { ...input },
    undefined,
    LinkPositioningProofInputSchema,
    "global",
  );

export const unlinkPositioningProof = (input: UnlinkPositioningProofInput) =>
  createAction<UnlinkPositioningProofAction>(
    "UNLINK_POSITIONING_PROOF",
    { ...input },
    undefined,
    UnlinkPositioningProofInputSchema,
    "global",
  );
