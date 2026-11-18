import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { OpportunityPHState } from "document-models/opportunity/v1";
import type {
  AddConditionAction,
  MarkConditionAction,
  RemoveConditionAction,
  UpdateConditionAction,
} from "./conditions/actions.js";
import type {
  AddPartnerAction,
  RemovePartnerAction,
  SetCoordinatorAction,
  UpdatePartnerAction,
} from "./consortium/actions.js";
import type {
  AddStepAction,
  RemoveStepAction,
  TargetCutOffAction,
  UpdateStepAction,
} from "./dates/actions.js";
import type {
  SetFitAction,
  SetOpportunityDetailsAction,
  SetOwnerAction,
} from "./details/actions.js";
import type {
  ClearAttemptLimitAction,
  SetApplyingEntityAction,
  SetAttemptLimitAction,
} from "./limits/actions.js";
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
  SetInteractionOutcomeAction,
  UnlinkContactAction,
  UpdateInteractionAction,
  UpdateNextStepAction,
} from "./relationship/actions.js";
import type {
  ClearBlockedAction,
  DecideGoNoGoAction,
  SetBlockedAction,
  SetDecideByAction,
  SetExpectedOpeningAction,
  SetOpportunityStatusAction,
} from "./status/actions.js";
import type {
  MarkSubmissionAction,
  RecordSubmissionOutcomeAction,
} from "./submissions/actions.js";

import { opportunityConditionsOperations } from "../src/reducers/conditions.js";
import { opportunityConsortiumOperations } from "../src/reducers/consortium.js";
import { opportunityDatesOperations } from "../src/reducers/dates.js";
import { opportunityDetailsOperations } from "../src/reducers/details.js";
import { opportunityLimitsOperations } from "../src/reducers/limits.js";
import { opportunityRelationshipOperations } from "../src/reducers/relationship.js";
import { opportunityStatusOperations } from "../src/reducers/status.js";
import { opportunitySubmissionsOperations } from "../src/reducers/submissions.js";

import {
  AddConditionInputSchema,
  AddConfidentialItemInputSchema,
  AddInteractionInputSchema,
  AddNextStepInputSchema,
  AddPartnerInputSchema,
  AddReferenceInputSchema,
  AddStepInputSchema,
  ClearAttemptLimitInputSchema,
  ClearBlockedInputSchema,
  CompleteNextStepInputSchema,
  DecideGoNoGoInputSchema,
  LinkContactInputSchema,
  MarkConditionInputSchema,
  MarkSubmissionInputSchema,
  RecordSubmissionOutcomeInputSchema,
  RemoveConditionInputSchema,
  RemoveConfidentialItemInputSchema,
  RemoveInteractionInputSchema,
  RemoveNextStepInputSchema,
  RemovePartnerInputSchema,
  RemoveReferenceInputSchema,
  RemoveStepInputSchema,
  ReopenNextStepInputSchema,
  SetApplyingEntityInputSchema,
  SetAttemptLimitInputSchema,
  SetBlockedInputSchema,
  SetCoordinatorInputSchema,
  SetDecideByInputSchema,
  SetExpectedOpeningInputSchema,
  SetFitInputSchema,
  SetInteractionOutcomeInputSchema,
  SetOpportunityDetailsInputSchema,
  SetOpportunityStatusInputSchema,
  SetOwnerInputSchema,
  TargetCutOffInputSchema,
  UnlinkContactInputSchema,
  UpdateConditionInputSchema,
  UpdateInteractionInputSchema,
  UpdateNextStepInputSchema,
  UpdatePartnerInputSchema,
  UpdateStepInputSchema,
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

const stateReducer: StateReducer<OpportunityPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_OPPORTUNITY_DETAILS": {
      memoizedSchema(SetOpportunityDetailsInputSchema).parse(action.input);

      opportunityDetailsOperations.setOpportunityDetailsOperation(
        state.global,
        action as SetOpportunityDetailsAction,
        dispatch,
      );

      break;
    }

    case "SET_OWNER": {
      memoizedSchema(SetOwnerInputSchema).parse(action.input);

      opportunityDetailsOperations.setOwnerOperation(
        state.global,
        action as SetOwnerAction,
        dispatch,
      );

      break;
    }

    case "SET_FIT": {
      memoizedSchema(SetFitInputSchema).parse(action.input);

      opportunityDetailsOperations.setFitOperation(
        state.global,
        action as SetFitAction,
        dispatch,
      );

      break;
    }

    case "SET_OPPORTUNITY_STATUS": {
      memoizedSchema(SetOpportunityStatusInputSchema).parse(action.input);

      opportunityStatusOperations.setOpportunityStatusOperation(
        state.global,
        action as SetOpportunityStatusAction,
        dispatch,
      );

      break;
    }

    case "DECIDE_GO_NO_GO": {
      memoizedSchema(DecideGoNoGoInputSchema).parse(action.input);

      opportunityStatusOperations.decideGoNoGoOperation(
        state.global,
        action as DecideGoNoGoAction,
        dispatch,
      );

      break;
    }

    case "SET_BLOCKED": {
      memoizedSchema(SetBlockedInputSchema).parse(action.input);

      opportunityStatusOperations.setBlockedOperation(
        state.global,
        action as SetBlockedAction,
        dispatch,
      );

      break;
    }

    case "CLEAR_BLOCKED": {
      memoizedSchema(ClearBlockedInputSchema).parse(action.input);

      opportunityStatusOperations.clearBlockedOperation(
        state.global,
        action as ClearBlockedAction,
        dispatch,
      );

      break;
    }

    case "SET_DECIDE_BY": {
      memoizedSchema(SetDecideByInputSchema).parse(action.input);

      opportunityStatusOperations.setDecideByOperation(
        state.global,
        action as SetDecideByAction,
        dispatch,
      );

      break;
    }

    case "SET_EXPECTED_OPENING": {
      memoizedSchema(SetExpectedOpeningInputSchema).parse(action.input);

      opportunityStatusOperations.setExpectedOpeningOperation(
        state.global,
        action as SetExpectedOpeningAction,
        dispatch,
      );

      break;
    }

    case "ADD_STEP": {
      memoizedSchema(AddStepInputSchema).parse(action.input);

      opportunityDatesOperations.addStepOperation(
        state.global,
        action as AddStepAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_STEP": {
      memoizedSchema(UpdateStepInputSchema).parse(action.input);

      opportunityDatesOperations.updateStepOperation(
        state.global,
        action as UpdateStepAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_STEP": {
      memoizedSchema(RemoveStepInputSchema).parse(action.input);

      opportunityDatesOperations.removeStepOperation(
        state.global,
        action as RemoveStepAction,
        dispatch,
      );

      break;
    }

    case "TARGET_CUT_OFF": {
      memoizedSchema(TargetCutOffInputSchema).parse(action.input);

      opportunityDatesOperations.targetCutOffOperation(
        state.global,
        action as TargetCutOffAction,
        dispatch,
      );

      break;
    }

    case "ADD_CONDITION": {
      memoizedSchema(AddConditionInputSchema).parse(action.input);

      opportunityConditionsOperations.addConditionOperation(
        state.global,
        action as AddConditionAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_CONDITION": {
      memoizedSchema(UpdateConditionInputSchema).parse(action.input);

      opportunityConditionsOperations.updateConditionOperation(
        state.global,
        action as UpdateConditionAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_CONDITION": {
      memoizedSchema(RemoveConditionInputSchema).parse(action.input);

      opportunityConditionsOperations.removeConditionOperation(
        state.global,
        action as RemoveConditionAction,
        dispatch,
      );

      break;
    }

    case "MARK_CONDITION": {
      memoizedSchema(MarkConditionInputSchema).parse(action.input);

      opportunityConditionsOperations.markConditionOperation(
        state.global,
        action as MarkConditionAction,
        dispatch,
      );

      break;
    }

    case "SET_ATTEMPT_LIMIT": {
      memoizedSchema(SetAttemptLimitInputSchema).parse(action.input);

      opportunityLimitsOperations.setAttemptLimitOperation(
        state.global,
        action as SetAttemptLimitAction,
        dispatch,
      );

      break;
    }

    case "CLEAR_ATTEMPT_LIMIT": {
      memoizedSchema(ClearAttemptLimitInputSchema).parse(action.input);

      opportunityLimitsOperations.clearAttemptLimitOperation(
        state.global,
        action as ClearAttemptLimitAction,
        dispatch,
      );

      break;
    }

    case "SET_APPLYING_ENTITY": {
      memoizedSchema(SetApplyingEntityInputSchema).parse(action.input);

      opportunityLimitsOperations.setApplyingEntityOperation(
        state.global,
        action as SetApplyingEntityAction,
        dispatch,
      );

      break;
    }

    case "MARK_SUBMISSION": {
      memoizedSchema(MarkSubmissionInputSchema).parse(action.input);

      opportunitySubmissionsOperations.markSubmissionOperation(
        state.global,
        action as MarkSubmissionAction,
        dispatch,
      );

      break;
    }

    case "RECORD_SUBMISSION_OUTCOME": {
      memoizedSchema(RecordSubmissionOutcomeInputSchema).parse(action.input);

      opportunitySubmissionsOperations.recordSubmissionOutcomeOperation(
        state.global,
        action as RecordSubmissionOutcomeAction,
        dispatch,
      );

      break;
    }

    case "SET_COORDINATOR": {
      memoizedSchema(SetCoordinatorInputSchema).parse(action.input);

      opportunityConsortiumOperations.setCoordinatorOperation(
        state.global,
        action as SetCoordinatorAction,
        dispatch,
      );

      break;
    }

    case "ADD_PARTNER": {
      memoizedSchema(AddPartnerInputSchema).parse(action.input);

      opportunityConsortiumOperations.addPartnerOperation(
        state.global,
        action as AddPartnerAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_PARTNER": {
      memoizedSchema(UpdatePartnerInputSchema).parse(action.input);

      opportunityConsortiumOperations.updatePartnerOperation(
        state.global,
        action as UpdatePartnerAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PARTNER": {
      memoizedSchema(RemovePartnerInputSchema).parse(action.input);

      opportunityConsortiumOperations.removePartnerOperation(
        state.global,
        action as RemovePartnerAction,
        dispatch,
      );

      break;
    }

    case "ADD_NEXT_STEP": {
      memoizedSchema(AddNextStepInputSchema).parse(action.input);

      opportunityRelationshipOperations.addNextStepOperation(
        state.global,
        action as AddNextStepAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_NEXT_STEP": {
      memoizedSchema(UpdateNextStepInputSchema).parse(action.input);

      opportunityRelationshipOperations.updateNextStepOperation(
        state.global,
        action as UpdateNextStepAction,
        dispatch,
      );

      break;
    }

    case "COMPLETE_NEXT_STEP": {
      memoizedSchema(CompleteNextStepInputSchema).parse(action.input);

      opportunityRelationshipOperations.completeNextStepOperation(
        state.global,
        action as CompleteNextStepAction,
        dispatch,
      );

      break;
    }

    case "REOPEN_NEXT_STEP": {
      memoizedSchema(ReopenNextStepInputSchema).parse(action.input);

      opportunityRelationshipOperations.reopenNextStepOperation(
        state.global,
        action as ReopenNextStepAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_NEXT_STEP": {
      memoizedSchema(RemoveNextStepInputSchema).parse(action.input);

      opportunityRelationshipOperations.removeNextStepOperation(
        state.global,
        action as RemoveNextStepAction,
        dispatch,
      );

      break;
    }

    case "ADD_INTERACTION": {
      memoizedSchema(AddInteractionInputSchema).parse(action.input);

      opportunityRelationshipOperations.addInteractionOperation(
        state.global,
        action as AddInteractionAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_INTERACTION": {
      memoizedSchema(UpdateInteractionInputSchema).parse(action.input);

      opportunityRelationshipOperations.updateInteractionOperation(
        state.global,
        action as UpdateInteractionAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_INTERACTION": {
      memoizedSchema(RemoveInteractionInputSchema).parse(action.input);

      opportunityRelationshipOperations.removeInteractionOperation(
        state.global,
        action as RemoveInteractionAction,
        dispatch,
      );

      break;
    }

    case "LINK_CONTACT": {
      memoizedSchema(LinkContactInputSchema).parse(action.input);

      opportunityRelationshipOperations.linkContactOperation(
        state.global,
        action as LinkContactAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_CONTACT": {
      memoizedSchema(UnlinkContactInputSchema).parse(action.input);

      opportunityRelationshipOperations.unlinkContactOperation(
        state.global,
        action as UnlinkContactAction,
        dispatch,
      );

      break;
    }

    case "ADD_REFERENCE": {
      memoizedSchema(AddReferenceInputSchema).parse(action.input);

      opportunityRelationshipOperations.addReferenceOperation(
        state.global,
        action as AddReferenceAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_REFERENCE": {
      memoizedSchema(RemoveReferenceInputSchema).parse(action.input);

      opportunityRelationshipOperations.removeReferenceOperation(
        state.global,
        action as RemoveReferenceAction,
        dispatch,
      );

      break;
    }

    case "ADD_CONFIDENTIAL_ITEM": {
      memoizedSchema(AddConfidentialItemInputSchema).parse(action.input);

      opportunityRelationshipOperations.addConfidentialItemOperation(
        state.global,
        action as AddConfidentialItemAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_CONFIDENTIAL_ITEM": {
      memoizedSchema(RemoveConfidentialItemInputSchema).parse(action.input);

      opportunityRelationshipOperations.removeConfidentialItemOperation(
        state.global,
        action as RemoveConfidentialItemAction,
        dispatch,
      );

      break;
    }

    case "SET_INTERACTION_OUTCOME": {
      memoizedSchema(SetInteractionOutcomeInputSchema).parse(action.input);

      opportunityRelationshipOperations.setInteractionOutcomeOperation(
        state.global,
        action as SetInteractionOutcomeAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<OpportunityPHState> = createReducer(stateReducer);
