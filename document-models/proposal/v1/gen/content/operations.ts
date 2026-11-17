/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { ProposalGlobalState } from "../types.js";
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

export interface ProposalContentOperations {
  addSectionOperation: (
    state: ProposalGlobalState,
    action: AddSectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateSectionOperation: (
    state: ProposalGlobalState,
    action: UpdateSectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeSectionOperation: (
    state: ProposalGlobalState,
    action: RemoveSectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderSectionsOperation: (
    state: ProposalGlobalState,
    action: ReorderSectionsAction,
    dispatch?: SignalDispatch,
  ) => void;
  addClauseOperation: (
    state: ProposalGlobalState,
    action: AddClauseAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateClauseOperation: (
    state: ProposalGlobalState,
    action: UpdateClauseAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeClauseOperation: (
    state: ProposalGlobalState,
    action: RemoveClauseAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderClausesOperation: (
    state: ProposalGlobalState,
    action: ReorderClausesAction,
    dispatch?: SignalDispatch,
  ) => void;
  addAnnexOperation: (
    state: ProposalGlobalState,
    action: AddAnnexAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateAnnexOperation: (
    state: ProposalGlobalState,
    action: UpdateAnnexAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeAnnexOperation: (
    state: ProposalGlobalState,
    action: RemoveAnnexAction,
    dispatch?: SignalDispatch,
  ) => void;
  addFigureOperation: (
    state: ProposalGlobalState,
    action: AddFigureAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateFigureOperation: (
    state: ProposalGlobalState,
    action: UpdateFigureAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFigureOperation: (
    state: ProposalGlobalState,
    action: RemoveFigureAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderFiguresOperation: (
    state: ProposalGlobalState,
    action: ReorderFiguresAction,
    dispatch?: SignalDispatch,
  ) => void;
}
