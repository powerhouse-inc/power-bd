/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddSegmentInputSchema,
  LinkSegmentOrganisationInputSchema,
  RemoveSegmentInputSchema,
  SetSegmentSourceInputSchema,
  UnlinkSegmentOrganisationInputSchema,
  UpdateSegmentInputSchema,
} from "../schema/zod.js";
import type {
  AddSegmentInput,
  LinkSegmentOrganisationInput,
  RemoveSegmentInput,
  SetSegmentSourceInput,
  UnlinkSegmentOrganisationInput,
  UpdateSegmentInput,
} from "../types.js";
import type {
  AddSegmentAction,
  LinkSegmentOrganisationAction,
  RemoveSegmentAction,
  SetSegmentSourceAction,
  UnlinkSegmentOrganisationAction,
  UpdateSegmentAction,
} from "./actions.js";

export const addSegment = (input: AddSegmentInput) =>
  createAction<AddSegmentAction>(
    "ADD_SEGMENT",
    { ...input },
    undefined,
    AddSegmentInputSchema,
    "global",
  );

export const updateSegment = (input: UpdateSegmentInput) =>
  createAction<UpdateSegmentAction>(
    "UPDATE_SEGMENT",
    { ...input },
    undefined,
    UpdateSegmentInputSchema,
    "global",
  );

export const setSegmentSource = (input: SetSegmentSourceInput) =>
  createAction<SetSegmentSourceAction>(
    "SET_SEGMENT_SOURCE",
    { ...input },
    undefined,
    SetSegmentSourceInputSchema,
    "global",
  );

export const linkSegmentOrganisation = (input: LinkSegmentOrganisationInput) =>
  createAction<LinkSegmentOrganisationAction>(
    "LINK_SEGMENT_ORGANISATION",
    { ...input },
    undefined,
    LinkSegmentOrganisationInputSchema,
    "global",
  );

export const unlinkSegmentOrganisation = (
  input: UnlinkSegmentOrganisationInput,
) =>
  createAction<UnlinkSegmentOrganisationAction>(
    "UNLINK_SEGMENT_ORGANISATION",
    { ...input },
    undefined,
    UnlinkSegmentOrganisationInputSchema,
    "global",
  );

export const removeSegment = (input: RemoveSegmentInput) =>
  createAction<RemoveSegmentAction>(
    "REMOVE_SEGMENT",
    { ...input },
    undefined,
    RemoveSegmentInputSchema,
    "global",
  );
