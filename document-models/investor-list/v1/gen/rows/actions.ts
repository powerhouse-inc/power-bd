/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddRowsInput,
  ExcludeRowInput,
  LinkRowComparableInput,
  MarkRowEngagedInput,
  RelistRowInput,
  RemoveRowInput,
  SetRowThesisInput,
  ShortlistRowInput,
  UnlinkRowComparableInput,
  UpdateRowInput,
} from "../types.js";

export type AddRowsAction = Action & { type: "ADD_ROWS"; input: AddRowsInput };
export type UpdateRowAction = Action & {
  type: "UPDATE_ROW";
  input: UpdateRowInput;
};
export type ShortlistRowAction = Action & {
  type: "SHORTLIST_ROW";
  input: ShortlistRowInput;
};
export type ExcludeRowAction = Action & {
  type: "EXCLUDE_ROW";
  input: ExcludeRowInput;
};
export type RelistRowAction = Action & {
  type: "RELIST_ROW";
  input: RelistRowInput;
};
export type SetRowThesisAction = Action & {
  type: "SET_ROW_THESIS";
  input: SetRowThesisInput;
};
export type LinkRowComparableAction = Action & {
  type: "LINK_ROW_COMPARABLE";
  input: LinkRowComparableInput;
};
export type UnlinkRowComparableAction = Action & {
  type: "UNLINK_ROW_COMPARABLE";
  input: UnlinkRowComparableInput;
};
export type MarkRowEngagedAction = Action & {
  type: "MARK_ROW_ENGAGED";
  input: MarkRowEngagedInput;
};
export type RemoveRowAction = Action & {
  type: "REMOVE_ROW";
  input: RemoveRowInput;
};

export type InvestorListRowsAction =
  | AddRowsAction
  | UpdateRowAction
  | ShortlistRowAction
  | ExcludeRowAction
  | RelistRowAction
  | SetRowThesisAction
  | LinkRowComparableAction
  | UnlinkRowComparableAction
  | MarkRowEngagedAction
  | RemoveRowAction;
