/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
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

export type AddSectionAction = Action & {
  type: "ADD_SECTION";
  input: AddSectionInput;
};
export type UpdateSectionAction = Action & {
  type: "UPDATE_SECTION";
  input: UpdateSectionInput;
};
export type RemoveSectionAction = Action & {
  type: "REMOVE_SECTION";
  input: RemoveSectionInput;
};
export type ReorderSectionsAction = Action & {
  type: "REORDER_SECTIONS";
  input: ReorderSectionsInput;
};
export type AddClauseAction = Action & {
  type: "ADD_CLAUSE";
  input: AddClauseInput;
};
export type UpdateClauseAction = Action & {
  type: "UPDATE_CLAUSE";
  input: UpdateClauseInput;
};
export type RemoveClauseAction = Action & {
  type: "REMOVE_CLAUSE";
  input: RemoveClauseInput;
};
export type ReorderClausesAction = Action & {
  type: "REORDER_CLAUSES";
  input: ReorderClausesInput;
};
export type AddAnnexAction = Action & {
  type: "ADD_ANNEX";
  input: AddAnnexInput;
};
export type UpdateAnnexAction = Action & {
  type: "UPDATE_ANNEX";
  input: UpdateAnnexInput;
};
export type RemoveAnnexAction = Action & {
  type: "REMOVE_ANNEX";
  input: RemoveAnnexInput;
};
export type AddFigureAction = Action & {
  type: "ADD_FIGURE";
  input: AddFigureInput;
};
export type UpdateFigureAction = Action & {
  type: "UPDATE_FIGURE";
  input: UpdateFigureInput;
};
export type RemoveFigureAction = Action & {
  type: "REMOVE_FIGURE";
  input: RemoveFigureInput;
};
export type ReorderFiguresAction = Action & {
  type: "REORDER_FIGURES";
  input: ReorderFiguresInput;
};

export type ProposalContentAction =
  | AddSectionAction
  | UpdateSectionAction
  | RemoveSectionAction
  | ReorderSectionsAction
  | AddClauseAction
  | UpdateClauseAction
  | RemoveClauseAction
  | ReorderClausesAction
  | AddAnnexAction
  | UpdateAnnexAction
  | RemoveAnnexAction
  | AddFigureAction
  | UpdateFigureAction
  | RemoveFigureAction
  | ReorderFiguresAction;
