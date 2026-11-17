/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddAnnexInputSchema,
  AddClauseInputSchema,
  AddFigureInputSchema,
  AddSectionInputSchema,
  RemoveAnnexInputSchema,
  RemoveClauseInputSchema,
  RemoveFigureInputSchema,
  RemoveSectionInputSchema,
  ReorderClausesInputSchema,
  ReorderFiguresInputSchema,
  ReorderSectionsInputSchema,
  UpdateAnnexInputSchema,
  UpdateClauseInputSchema,
  UpdateFigureInputSchema,
  UpdateSectionInputSchema,
} from "../schema/zod.js";
import type {
  AddAnnexInput,
  AddClauseInput,
  AddFigureInput,
  AddSectionInput,
  RemoveAnnexInput,
  RemoveClauseInput,
  RemoveFigureInput,
  RemoveSectionInput,
  ReorderClausesInput,
  ReorderFiguresInput,
  ReorderSectionsInput,
  UpdateAnnexInput,
  UpdateClauseInput,
  UpdateFigureInput,
  UpdateSectionInput,
} from "../types.js";
import type {
  AddAnnexAction,
  AddClauseAction,
  AddFigureAction,
  AddSectionAction,
  RemoveAnnexAction,
  RemoveClauseAction,
  RemoveFigureAction,
  RemoveSectionAction,
  ReorderClausesAction,
  ReorderFiguresAction,
  ReorderSectionsAction,
  UpdateAnnexAction,
  UpdateClauseAction,
  UpdateFigureAction,
  UpdateSectionAction,
} from "./actions.js";

export const addSection = (input: AddSectionInput) =>
  createAction<AddSectionAction>(
    "ADD_SECTION",
    { ...input },
    undefined,
    AddSectionInputSchema,
    "global",
  );

export const updateSection = (input: UpdateSectionInput) =>
  createAction<UpdateSectionAction>(
    "UPDATE_SECTION",
    { ...input },
    undefined,
    UpdateSectionInputSchema,
    "global",
  );

export const removeSection = (input: RemoveSectionInput) =>
  createAction<RemoveSectionAction>(
    "REMOVE_SECTION",
    { ...input },
    undefined,
    RemoveSectionInputSchema,
    "global",
  );

export const reorderSections = (input: ReorderSectionsInput) =>
  createAction<ReorderSectionsAction>(
    "REORDER_SECTIONS",
    { ...input },
    undefined,
    ReorderSectionsInputSchema,
    "global",
  );

export const addClause = (input: AddClauseInput) =>
  createAction<AddClauseAction>(
    "ADD_CLAUSE",
    { ...input },
    undefined,
    AddClauseInputSchema,
    "global",
  );

export const updateClause = (input: UpdateClauseInput) =>
  createAction<UpdateClauseAction>(
    "UPDATE_CLAUSE",
    { ...input },
    undefined,
    UpdateClauseInputSchema,
    "global",
  );

export const removeClause = (input: RemoveClauseInput) =>
  createAction<RemoveClauseAction>(
    "REMOVE_CLAUSE",
    { ...input },
    undefined,
    RemoveClauseInputSchema,
    "global",
  );

export const reorderClauses = (input: ReorderClausesInput) =>
  createAction<ReorderClausesAction>(
    "REORDER_CLAUSES",
    { ...input },
    undefined,
    ReorderClausesInputSchema,
    "global",
  );

export const addAnnex = (input: AddAnnexInput) =>
  createAction<AddAnnexAction>(
    "ADD_ANNEX",
    { ...input },
    undefined,
    AddAnnexInputSchema,
    "global",
  );

export const updateAnnex = (input: UpdateAnnexInput) =>
  createAction<UpdateAnnexAction>(
    "UPDATE_ANNEX",
    { ...input },
    undefined,
    UpdateAnnexInputSchema,
    "global",
  );

export const removeAnnex = (input: RemoveAnnexInput) =>
  createAction<RemoveAnnexAction>(
    "REMOVE_ANNEX",
    { ...input },
    undefined,
    RemoveAnnexInputSchema,
    "global",
  );

export const addFigure = (input: AddFigureInput) =>
  createAction<AddFigureAction>(
    "ADD_FIGURE",
    { ...input },
    undefined,
    AddFigureInputSchema,
    "global",
  );

export const updateFigure = (input: UpdateFigureInput) =>
  createAction<UpdateFigureAction>(
    "UPDATE_FIGURE",
    { ...input },
    undefined,
    UpdateFigureInputSchema,
    "global",
  );

export const removeFigure = (input: RemoveFigureInput) =>
  createAction<RemoveFigureAction>(
    "REMOVE_FIGURE",
    { ...input },
    undefined,
    RemoveFigureInputSchema,
    "global",
  );

export const reorderFigures = (input: ReorderFiguresInput) =>
  createAction<ReorderFiguresAction>(
    "REORDER_FIGURES",
    { ...input },
    undefined,
    ReorderFiguresInputSchema,
    "global",
  );
