/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { InvestorListGlobalState } from "../types.js";
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

export interface InvestorListRowsOperations {
  addRowsOperation: (
    state: InvestorListGlobalState,
    action: AddRowsAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateRowOperation: (
    state: InvestorListGlobalState,
    action: UpdateRowAction,
    dispatch?: SignalDispatch,
  ) => void;
  shortlistRowOperation: (
    state: InvestorListGlobalState,
    action: ShortlistRowAction,
    dispatch?: SignalDispatch,
  ) => void;
  excludeRowOperation: (
    state: InvestorListGlobalState,
    action: ExcludeRowAction,
    dispatch?: SignalDispatch,
  ) => void;
  relistRowOperation: (
    state: InvestorListGlobalState,
    action: RelistRowAction,
    dispatch?: SignalDispatch,
  ) => void;
  setRowThesisOperation: (
    state: InvestorListGlobalState,
    action: SetRowThesisAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkRowComparableOperation: (
    state: InvestorListGlobalState,
    action: LinkRowComparableAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkRowComparableOperation: (
    state: InvestorListGlobalState,
    action: UnlinkRowComparableAction,
    dispatch?: SignalDispatch,
  ) => void;
  markRowEngagedOperation: (
    state: InvestorListGlobalState,
    action: MarkRowEngagedAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeRowOperation: (
    state: InvestorListGlobalState,
    action: RemoveRowAction,
    dispatch?: SignalDispatch,
  ) => void;
}
