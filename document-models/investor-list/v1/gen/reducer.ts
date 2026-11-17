import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { InvestorListPHState } from "document-models/investor-list/v1";
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
} from "./rows/actions.js";

import { investorListRowsOperations } from "../src/reducers/rows.js";

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
} from "./schema/zod.js";

const schemaMemo = new Map<() => unknown, unknown>();

function memoizedSchema<T>(makeSchema: () => T): T {
  let schema = schemaMemo.get(makeSchema) as T | undefined;
  if (schema === undefined) {
    schema = makeSchema();
    schemaMemo.set(makeSchema, schema);
  }
  return schema;
}

const stateReducer: StateReducer<InvestorListPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "ADD_ROWS": {
      memoizedSchema(AddRowsInputSchema).parse(action.input);

      investorListRowsOperations.addRowsOperation(
        state.global,
        action as AddRowsAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_ROW": {
      memoizedSchema(UpdateRowInputSchema).parse(action.input);

      investorListRowsOperations.updateRowOperation(
        state.global,
        action as UpdateRowAction,
        dispatch,
      );

      break;
    }

    case "SHORTLIST_ROW": {
      memoizedSchema(ShortlistRowInputSchema).parse(action.input);

      investorListRowsOperations.shortlistRowOperation(
        state.global,
        action as ShortlistRowAction,
        dispatch,
      );

      break;
    }

    case "EXCLUDE_ROW": {
      memoizedSchema(ExcludeRowInputSchema).parse(action.input);

      investorListRowsOperations.excludeRowOperation(
        state.global,
        action as ExcludeRowAction,
        dispatch,
      );

      break;
    }

    case "RELIST_ROW": {
      memoizedSchema(RelistRowInputSchema).parse(action.input);

      investorListRowsOperations.relistRowOperation(
        state.global,
        action as RelistRowAction,
        dispatch,
      );

      break;
    }

    case "SET_ROW_THESIS": {
      memoizedSchema(SetRowThesisInputSchema).parse(action.input);

      investorListRowsOperations.setRowThesisOperation(
        state.global,
        action as SetRowThesisAction,
        dispatch,
      );

      break;
    }

    case "LINK_ROW_COMPARABLE": {
      memoizedSchema(LinkRowComparableInputSchema).parse(action.input);

      investorListRowsOperations.linkRowComparableOperation(
        state.global,
        action as LinkRowComparableAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_ROW_COMPARABLE": {
      memoizedSchema(UnlinkRowComparableInputSchema).parse(action.input);

      investorListRowsOperations.unlinkRowComparableOperation(
        state.global,
        action as UnlinkRowComparableAction,
        dispatch,
      );

      break;
    }

    case "MARK_ROW_ENGAGED": {
      memoizedSchema(MarkRowEngagedInputSchema).parse(action.input);

      investorListRowsOperations.markRowEngagedOperation(
        state.global,
        action as MarkRowEngagedAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_ROW": {
      memoizedSchema(RemoveRowInputSchema).parse(action.input);

      investorListRowsOperations.removeRowOperation(
        state.global,
        action as RemoveRowAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<InvestorListPHState> =
  createReducer(stateReducer);
