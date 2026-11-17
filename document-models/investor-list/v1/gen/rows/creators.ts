/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddRowsInputSchema,
  ExcludeRowInputSchema,
  LinkRowComparableInputSchema,
  MarkRowEngagedInputSchema,
  RelistRowInputSchema,
  RemoveRowInputSchema,
  SetRowThesisInputSchema,
  ShortlistRowInputSchema,
  UnlinkRowComparableInputSchema,
  UpdateRowInputSchema,
} from "../schema/zod.js";
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
import type {
  AddRowsAction,
  ExcludeRowAction,
  LinkRowComparableAction,
  MarkRowEngagedAction,
  RelistRowAction,
  RemoveRowAction,
  SetRowThesisAction,
  ShortlistRowAction,
  UnlinkRowComparableAction,
  UpdateRowAction,
} from "./actions.js";

export const addRows = (input: AddRowsInput) =>
  createAction<AddRowsAction>(
    "ADD_ROWS",
    { ...input },
    undefined,
    AddRowsInputSchema,
    "global",
  );

export const updateRow = (input: UpdateRowInput) =>
  createAction<UpdateRowAction>(
    "UPDATE_ROW",
    { ...input },
    undefined,
    UpdateRowInputSchema,
    "global",
  );

export const shortlistRow = (input: ShortlistRowInput) =>
  createAction<ShortlistRowAction>(
    "SHORTLIST_ROW",
    { ...input },
    undefined,
    ShortlistRowInputSchema,
    "global",
  );

export const excludeRow = (input: ExcludeRowInput) =>
  createAction<ExcludeRowAction>(
    "EXCLUDE_ROW",
    { ...input },
    undefined,
    ExcludeRowInputSchema,
    "global",
  );

export const relistRow = (input: RelistRowInput) =>
  createAction<RelistRowAction>(
    "RELIST_ROW",
    { ...input },
    undefined,
    RelistRowInputSchema,
    "global",
  );

export const setRowThesis = (input: SetRowThesisInput) =>
  createAction<SetRowThesisAction>(
    "SET_ROW_THESIS",
    { ...input },
    undefined,
    SetRowThesisInputSchema,
    "global",
  );

export const linkRowComparable = (input: LinkRowComparableInput) =>
  createAction<LinkRowComparableAction>(
    "LINK_ROW_COMPARABLE",
    { ...input },
    undefined,
    LinkRowComparableInputSchema,
    "global",
  );

export const unlinkRowComparable = (input: UnlinkRowComparableInput) =>
  createAction<UnlinkRowComparableAction>(
    "UNLINK_ROW_COMPARABLE",
    { ...input },
    undefined,
    UnlinkRowComparableInputSchema,
    "global",
  );

export const markRowEngaged = (input: MarkRowEngagedInput) =>
  createAction<MarkRowEngagedAction>(
    "MARK_ROW_ENGAGED",
    { ...input },
    undefined,
    MarkRowEngagedInputSchema,
    "global",
  );

export const removeRow = (input: RemoveRowInput) =>
  createAction<RemoveRowAction>(
    "REMOVE_ROW",
    { ...input },
    undefined,
    RemoveRowInputSchema,
    "global",
  );
