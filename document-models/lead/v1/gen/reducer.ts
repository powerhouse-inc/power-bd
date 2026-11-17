import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { LeadPHState } from "document-models/lead/v1";
import type {
  AddAngleAction,
  RemoveAngleAction,
  UpdateAngleAction,
} from "./angles/actions.js";
import type {
  SetLeadDetailsAction,
  SetOwnerAction,
} from "./details/actions.js";
import type {
  ApproveMessageAction,
  DiscardMessageAction,
  DraftMessageAction,
  MarkMessageSentAction,
  ReopenMessageAction,
  UpdateMessageAction,
} from "./messages/actions.js";
import type {
  AddConfidentialItemAction,
  AddInteractionAction,
  AddNextStepAction,
  AddReferenceAction,
  CompleteNextStepAction,
  LinkContactAction,
  RemoveConfidentialItemAction,
  RemoveInteractionAction,
  RemoveNextStepAction,
  RemoveReferenceAction,
  ReopenNextStepAction,
  UnlinkContactAction,
  UpdateInteractionAction,
  UpdateNextStepAction,
} from "./relationship/actions.js";
import type {
  ParkLeadAction,
  SetLeadStatusAction,
  UnparkLeadAction,
} from "./status/actions.js";

import { leadAnglesOperations } from "../src/reducers/angles.js";
import { leadDetailsOperations } from "../src/reducers/details.js";
import { leadMessagesOperations } from "../src/reducers/messages.js";
import { leadRelationshipOperations } from "../src/reducers/relationship.js";
import { leadStatusOperations } from "../src/reducers/status.js";

import {
  AddAngleInputSchema,
  AddConfidentialItemInputSchema,
  AddInteractionInputSchema,
  AddNextStepInputSchema,
  AddReferenceInputSchema,
  ApproveMessageInputSchema,
  CompleteNextStepInputSchema,
  DiscardMessageInputSchema,
  DraftMessageInputSchema,
  LinkContactInputSchema,
  MarkMessageSentInputSchema,
  ParkLeadInputSchema,
  RemoveAngleInputSchema,
  RemoveConfidentialItemInputSchema,
  RemoveInteractionInputSchema,
  RemoveNextStepInputSchema,
  RemoveReferenceInputSchema,
  ReopenMessageInputSchema,
  ReopenNextStepInputSchema,
  SetLeadDetailsInputSchema,
  SetLeadStatusInputSchema,
  SetOwnerInputSchema,
  UnlinkContactInputSchema,
  UnparkLeadInputSchema,
  UpdateAngleInputSchema,
  UpdateInteractionInputSchema,
  UpdateMessageInputSchema,
  UpdateNextStepInputSchema,
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

const stateReducer: StateReducer<LeadPHState> = (state, action, dispatch) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_LEAD_DETAILS": {
      memoizedSchema(SetLeadDetailsInputSchema).parse(action.input);

      leadDetailsOperations.setLeadDetailsOperation(
        state.global,
        action as SetLeadDetailsAction,
        dispatch,
      );

      break;
    }

    case "SET_OWNER": {
      memoizedSchema(SetOwnerInputSchema).parse(action.input);

      leadDetailsOperations.setOwnerOperation(
        state.global,
        action as SetOwnerAction,
        dispatch,
      );

      break;
    }

    case "SET_LEAD_STATUS": {
      memoizedSchema(SetLeadStatusInputSchema).parse(action.input);

      leadStatusOperations.setLeadStatusOperation(
        state.global,
        action as SetLeadStatusAction,
        dispatch,
      );

      break;
    }

    case "PARK_LEAD": {
      memoizedSchema(ParkLeadInputSchema).parse(action.input);

      leadStatusOperations.parkLeadOperation(
        state.global,
        action as ParkLeadAction,
        dispatch,
      );

      break;
    }

    case "UNPARK_LEAD": {
      memoizedSchema(UnparkLeadInputSchema).parse(action.input);

      leadStatusOperations.unparkLeadOperation(
        state.global,
        action as UnparkLeadAction,
        dispatch,
      );

      break;
    }

    case "ADD_ANGLE": {
      memoizedSchema(AddAngleInputSchema).parse(action.input);

      leadAnglesOperations.addAngleOperation(
        state.global,
        action as AddAngleAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_ANGLE": {
      memoizedSchema(UpdateAngleInputSchema).parse(action.input);

      leadAnglesOperations.updateAngleOperation(
        state.global,
        action as UpdateAngleAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_ANGLE": {
      memoizedSchema(RemoveAngleInputSchema).parse(action.input);

      leadAnglesOperations.removeAngleOperation(
        state.global,
        action as RemoveAngleAction,
        dispatch,
      );

      break;
    }

    case "DRAFT_MESSAGE": {
      memoizedSchema(DraftMessageInputSchema).parse(action.input);

      leadMessagesOperations.draftMessageOperation(
        state.global,
        action as DraftMessageAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_MESSAGE": {
      memoizedSchema(UpdateMessageInputSchema).parse(action.input);

      leadMessagesOperations.updateMessageOperation(
        state.global,
        action as UpdateMessageAction,
        dispatch,
      );

      break;
    }

    case "APPROVE_MESSAGE": {
      memoizedSchema(ApproveMessageInputSchema).parse(action.input);

      leadMessagesOperations.approveMessageOperation(
        state.global,
        action as ApproveMessageAction,
        dispatch,
      );

      break;
    }

    case "REOPEN_MESSAGE": {
      memoizedSchema(ReopenMessageInputSchema).parse(action.input);

      leadMessagesOperations.reopenMessageOperation(
        state.global,
        action as ReopenMessageAction,
        dispatch,
      );

      break;
    }

    case "MARK_MESSAGE_SENT": {
      memoizedSchema(MarkMessageSentInputSchema).parse(action.input);

      leadMessagesOperations.markMessageSentOperation(
        state.global,
        action as MarkMessageSentAction,
        dispatch,
      );

      break;
    }

    case "DISCARD_MESSAGE": {
      memoizedSchema(DiscardMessageInputSchema).parse(action.input);

      leadMessagesOperations.discardMessageOperation(
        state.global,
        action as DiscardMessageAction,
        dispatch,
      );

      break;
    }

    case "ADD_NEXT_STEP": {
      memoizedSchema(AddNextStepInputSchema).parse(action.input);

      leadRelationshipOperations.addNextStepOperation(
        state.global,
        action as AddNextStepAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_NEXT_STEP": {
      memoizedSchema(UpdateNextStepInputSchema).parse(action.input);

      leadRelationshipOperations.updateNextStepOperation(
        state.global,
        action as UpdateNextStepAction,
        dispatch,
      );

      break;
    }

    case "COMPLETE_NEXT_STEP": {
      memoizedSchema(CompleteNextStepInputSchema).parse(action.input);

      leadRelationshipOperations.completeNextStepOperation(
        state.global,
        action as CompleteNextStepAction,
        dispatch,
      );

      break;
    }

    case "REOPEN_NEXT_STEP": {
      memoizedSchema(ReopenNextStepInputSchema).parse(action.input);

      leadRelationshipOperations.reopenNextStepOperation(
        state.global,
        action as ReopenNextStepAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_NEXT_STEP": {
      memoizedSchema(RemoveNextStepInputSchema).parse(action.input);

      leadRelationshipOperations.removeNextStepOperation(
        state.global,
        action as RemoveNextStepAction,
        dispatch,
      );

      break;
    }

    case "ADD_INTERACTION": {
      memoizedSchema(AddInteractionInputSchema).parse(action.input);

      leadRelationshipOperations.addInteractionOperation(
        state.global,
        action as AddInteractionAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_INTERACTION": {
      memoizedSchema(UpdateInteractionInputSchema).parse(action.input);

      leadRelationshipOperations.updateInteractionOperation(
        state.global,
        action as UpdateInteractionAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_INTERACTION": {
      memoizedSchema(RemoveInteractionInputSchema).parse(action.input);

      leadRelationshipOperations.removeInteractionOperation(
        state.global,
        action as RemoveInteractionAction,
        dispatch,
      );

      break;
    }

    case "LINK_CONTACT": {
      memoizedSchema(LinkContactInputSchema).parse(action.input);

      leadRelationshipOperations.linkContactOperation(
        state.global,
        action as LinkContactAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_CONTACT": {
      memoizedSchema(UnlinkContactInputSchema).parse(action.input);

      leadRelationshipOperations.unlinkContactOperation(
        state.global,
        action as UnlinkContactAction,
        dispatch,
      );

      break;
    }

    case "ADD_REFERENCE": {
      memoizedSchema(AddReferenceInputSchema).parse(action.input);

      leadRelationshipOperations.addReferenceOperation(
        state.global,
        action as AddReferenceAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_REFERENCE": {
      memoizedSchema(RemoveReferenceInputSchema).parse(action.input);

      leadRelationshipOperations.removeReferenceOperation(
        state.global,
        action as RemoveReferenceAction,
        dispatch,
      );

      break;
    }

    case "ADD_CONFIDENTIAL_ITEM": {
      memoizedSchema(AddConfidentialItemInputSchema).parse(action.input);

      leadRelationshipOperations.addConfidentialItemOperation(
        state.global,
        action as AddConfidentialItemAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_CONFIDENTIAL_ITEM": {
      memoizedSchema(RemoveConfidentialItemInputSchema).parse(action.input);

      leadRelationshipOperations.removeConfidentialItemOperation(
        state.global,
        action as RemoveConfidentialItemAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<LeadPHState> = createReducer(stateReducer);
