import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { MarketPHState } from "document-models/market/v1";
import type {
  ApproveSizeAction,
  ReopenSizeAction,
} from "./approval/actions.js";
import type { SetMarketDetailsAction } from "./details/actions.js";
import type {
  AddPublishedFigureAction,
  RemovePublishedFigureAction,
} from "./figures/actions.js";
import type {
  LinkPlayerEvidenceAction,
  MovePlayerAction,
  PlacePlayerAction,
  RemovePlayerAction,
  SetAxesAction,
  SetOurPositionAction,
  SetPlayerNoteAction,
  UnlinkPlayerEvidenceAction,
} from "./map/actions.js";
import type {
  AddSegmentAction,
  LinkSegmentOrganisationAction,
  RemoveSegmentAction,
  SetSegmentSourceAction,
  UnlinkSegmentOrganisationAction,
  UpdateSegmentAction,
} from "./segments/actions.js";

import { marketApprovalOperations } from "../src/reducers/approval.js";
import { marketDetailsOperations } from "../src/reducers/details.js";
import { marketFiguresOperations } from "../src/reducers/figures.js";
import { marketMapOperations } from "../src/reducers/map.js";
import { marketSegmentsOperations } from "../src/reducers/segments.js";

import {
  AddPublishedFigureInputSchema,
  AddSegmentInputSchema,
  ApproveSizeInputSchema,
  LinkPlayerEvidenceInputSchema,
  LinkSegmentOrganisationInputSchema,
  MovePlayerInputSchema,
  PlacePlayerInputSchema,
  RemovePlayerInputSchema,
  RemovePublishedFigureInputSchema,
  RemoveSegmentInputSchema,
  ReopenSizeInputSchema,
  SetAxesInputSchema,
  SetMarketDetailsInputSchema,
  SetOurPositionInputSchema,
  SetPlayerNoteInputSchema,
  SetSegmentSourceInputSchema,
  UnlinkPlayerEvidenceInputSchema,
  UnlinkSegmentOrganisationInputSchema,
  UpdateSegmentInputSchema,
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

const stateReducer: StateReducer<MarketPHState> = (state, action, dispatch) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_MARKET_DETAILS": {
      memoizedSchema(SetMarketDetailsInputSchema).parse(action.input);

      marketDetailsOperations.setMarketDetailsOperation(
        state.global,
        action as SetMarketDetailsAction,
        dispatch,
      );

      break;
    }

    case "ADD_SEGMENT": {
      memoizedSchema(AddSegmentInputSchema).parse(action.input);

      marketSegmentsOperations.addSegmentOperation(
        state.global,
        action as AddSegmentAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_SEGMENT": {
      memoizedSchema(UpdateSegmentInputSchema).parse(action.input);

      marketSegmentsOperations.updateSegmentOperation(
        state.global,
        action as UpdateSegmentAction,
        dispatch,
      );

      break;
    }

    case "SET_SEGMENT_SOURCE": {
      memoizedSchema(SetSegmentSourceInputSchema).parse(action.input);

      marketSegmentsOperations.setSegmentSourceOperation(
        state.global,
        action as SetSegmentSourceAction,
        dispatch,
      );

      break;
    }

    case "LINK_SEGMENT_ORGANISATION": {
      memoizedSchema(LinkSegmentOrganisationInputSchema).parse(action.input);

      marketSegmentsOperations.linkSegmentOrganisationOperation(
        state.global,
        action as LinkSegmentOrganisationAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_SEGMENT_ORGANISATION": {
      memoizedSchema(UnlinkSegmentOrganisationInputSchema).parse(action.input);

      marketSegmentsOperations.unlinkSegmentOrganisationOperation(
        state.global,
        action as UnlinkSegmentOrganisationAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_SEGMENT": {
      memoizedSchema(RemoveSegmentInputSchema).parse(action.input);

      marketSegmentsOperations.removeSegmentOperation(
        state.global,
        action as RemoveSegmentAction,
        dispatch,
      );

      break;
    }

    case "ADD_PUBLISHED_FIGURE": {
      memoizedSchema(AddPublishedFigureInputSchema).parse(action.input);

      marketFiguresOperations.addPublishedFigureOperation(
        state.global,
        action as AddPublishedFigureAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PUBLISHED_FIGURE": {
      memoizedSchema(RemovePublishedFigureInputSchema).parse(action.input);

      marketFiguresOperations.removePublishedFigureOperation(
        state.global,
        action as RemovePublishedFigureAction,
        dispatch,
      );

      break;
    }

    case "SET_AXES": {
      memoizedSchema(SetAxesInputSchema).parse(action.input);

      marketMapOperations.setAxesOperation(
        state.global,
        action as SetAxesAction,
        dispatch,
      );

      break;
    }

    case "PLACE_PLAYER": {
      memoizedSchema(PlacePlayerInputSchema).parse(action.input);

      marketMapOperations.placePlayerOperation(
        state.global,
        action as PlacePlayerAction,
        dispatch,
      );

      break;
    }

    case "MOVE_PLAYER": {
      memoizedSchema(MovePlayerInputSchema).parse(action.input);

      marketMapOperations.movePlayerOperation(
        state.global,
        action as MovePlayerAction,
        dispatch,
      );

      break;
    }

    case "SET_PLAYER_NOTE": {
      memoizedSchema(SetPlayerNoteInputSchema).parse(action.input);

      marketMapOperations.setPlayerNoteOperation(
        state.global,
        action as SetPlayerNoteAction,
        dispatch,
      );

      break;
    }

    case "LINK_PLAYER_EVIDENCE": {
      memoizedSchema(LinkPlayerEvidenceInputSchema).parse(action.input);

      marketMapOperations.linkPlayerEvidenceOperation(
        state.global,
        action as LinkPlayerEvidenceAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_PLAYER_EVIDENCE": {
      memoizedSchema(UnlinkPlayerEvidenceInputSchema).parse(action.input);

      marketMapOperations.unlinkPlayerEvidenceOperation(
        state.global,
        action as UnlinkPlayerEvidenceAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PLAYER": {
      memoizedSchema(RemovePlayerInputSchema).parse(action.input);

      marketMapOperations.removePlayerOperation(
        state.global,
        action as RemovePlayerAction,
        dispatch,
      );

      break;
    }

    case "SET_OUR_POSITION": {
      memoizedSchema(SetOurPositionInputSchema).parse(action.input);

      marketMapOperations.setOurPositionOperation(
        state.global,
        action as SetOurPositionAction,
        dispatch,
      );

      break;
    }

    case "APPROVE_SIZE": {
      memoizedSchema(ApproveSizeInputSchema).parse(action.input);

      marketApprovalOperations.approveSizeOperation(
        state.global,
        action as ApproveSizeAction,
        dispatch,
      );

      break;
    }

    case "REOPEN_SIZE": {
      memoizedSchema(ReopenSizeInputSchema).parse(action.input);

      marketApprovalOperations.reopenSizeOperation(
        state.global,
        action as ReopenSizeAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<MarketPHState> = createReducer(stateReducer);
