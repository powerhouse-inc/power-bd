/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddSegmentInput,
  LinkSegmentOrganisationInput,
  RemoveSegmentInput,
  SetSegmentSourceInput,
  UnlinkSegmentOrganisationInput,
  UpdateSegmentInput,
} from "../types.js";

export type AddSegmentAction = Action & {
  type: "ADD_SEGMENT";
  input: AddSegmentInput;
};
export type UpdateSegmentAction = Action & {
  type: "UPDATE_SEGMENT";
  input: UpdateSegmentInput;
};
export type SetSegmentSourceAction = Action & {
  type: "SET_SEGMENT_SOURCE";
  input: SetSegmentSourceInput;
};
export type LinkSegmentOrganisationAction = Action & {
  type: "LINK_SEGMENT_ORGANISATION";
  input: LinkSegmentOrganisationInput;
};
export type UnlinkSegmentOrganisationAction = Action & {
  type: "UNLINK_SEGMENT_ORGANISATION";
  input: UnlinkSegmentOrganisationInput;
};
export type RemoveSegmentAction = Action & {
  type: "REMOVE_SEGMENT";
  input: RemoveSegmentInput;
};

export type MarketSegmentsAction =
  | AddSegmentAction
  | UpdateSegmentAction
  | SetSegmentSourceAction
  | LinkSegmentOrganisationAction
  | UnlinkSegmentOrganisationAction
  | RemoveSegmentAction;
