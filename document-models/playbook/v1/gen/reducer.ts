import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { PlaybookPHState } from "document-models/playbook/v1";
import type {
  AddNeverClaimAction,
  RemoveNeverClaimAction,
  UpdateNeverClaimAction,
} from "./claims/actions.js";
import type {
  AddPositioningAction,
  ApprovePositioningAction,
  LinkPositioningComparableAction,
  LinkPositioningProofAction,
  RetirePositioningAction,
  UnlinkPositioningComparableAction,
  UnlinkPositioningProofAction,
  UpdatePositioningAction,
} from "./positioning/actions.js";
import type {
  AddProofCaseAction,
  AddProofEvidenceAction,
  LinkProofComparableAction,
  RemoveProofCaseAction,
  RemoveProofEvidenceAction,
  UnlinkProofComparableAction,
  UpdateProofCaseAction,
} from "./proofs/actions.js";

import { playbookClaimsOperations } from "../src/reducers/claims.js";
import { playbookPositioningOperations } from "../src/reducers/positioning.js";
import { playbookProofsOperations } from "../src/reducers/proofs.js";

import {
  AddNeverClaimInputSchema,
  AddPositioningInputSchema,
  AddProofCaseInputSchema,
  AddProofEvidenceInputSchema,
  ApprovePositioningInputSchema,
  LinkPositioningComparableInputSchema,
  LinkPositioningProofInputSchema,
  LinkProofComparableInputSchema,
  RemoveNeverClaimInputSchema,
  RemoveProofCaseInputSchema,
  RemoveProofEvidenceInputSchema,
  RetirePositioningInputSchema,
  UnlinkPositioningComparableInputSchema,
  UnlinkPositioningProofInputSchema,
  UnlinkProofComparableInputSchema,
  UpdateNeverClaimInputSchema,
  UpdatePositioningInputSchema,
  UpdateProofCaseInputSchema,
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

const stateReducer: StateReducer<PlaybookPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "ADD_POSITIONING": {
      memoizedSchema(AddPositioningInputSchema).parse(action.input);

      playbookPositioningOperations.addPositioningOperation(
        state.global,
        action as AddPositioningAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_POSITIONING": {
      memoizedSchema(UpdatePositioningInputSchema).parse(action.input);

      playbookPositioningOperations.updatePositioningOperation(
        state.global,
        action as UpdatePositioningAction,
        dispatch,
      );

      break;
    }

    case "APPROVE_POSITIONING": {
      memoizedSchema(ApprovePositioningInputSchema).parse(action.input);

      playbookPositioningOperations.approvePositioningOperation(
        state.global,
        action as ApprovePositioningAction,
        dispatch,
      );

      break;
    }

    case "RETIRE_POSITIONING": {
      memoizedSchema(RetirePositioningInputSchema).parse(action.input);

      playbookPositioningOperations.retirePositioningOperation(
        state.global,
        action as RetirePositioningAction,
        dispatch,
      );

      break;
    }

    case "LINK_POSITIONING_COMPARABLE": {
      memoizedSchema(LinkPositioningComparableInputSchema).parse(action.input);

      playbookPositioningOperations.linkPositioningComparableOperation(
        state.global,
        action as LinkPositioningComparableAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_POSITIONING_COMPARABLE": {
      memoizedSchema(UnlinkPositioningComparableInputSchema).parse(
        action.input,
      );

      playbookPositioningOperations.unlinkPositioningComparableOperation(
        state.global,
        action as UnlinkPositioningComparableAction,
        dispatch,
      );

      break;
    }

    case "LINK_POSITIONING_PROOF": {
      memoizedSchema(LinkPositioningProofInputSchema).parse(action.input);

      playbookPositioningOperations.linkPositioningProofOperation(
        state.global,
        action as LinkPositioningProofAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_POSITIONING_PROOF": {
      memoizedSchema(UnlinkPositioningProofInputSchema).parse(action.input);

      playbookPositioningOperations.unlinkPositioningProofOperation(
        state.global,
        action as UnlinkPositioningProofAction,
        dispatch,
      );

      break;
    }

    case "ADD_PROOF_CASE": {
      memoizedSchema(AddProofCaseInputSchema).parse(action.input);

      playbookProofsOperations.addProofCaseOperation(
        state.global,
        action as AddProofCaseAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_PROOF_CASE": {
      memoizedSchema(UpdateProofCaseInputSchema).parse(action.input);

      playbookProofsOperations.updateProofCaseOperation(
        state.global,
        action as UpdateProofCaseAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PROOF_CASE": {
      memoizedSchema(RemoveProofCaseInputSchema).parse(action.input);

      playbookProofsOperations.removeProofCaseOperation(
        state.global,
        action as RemoveProofCaseAction,
        dispatch,
      );

      break;
    }

    case "ADD_PROOF_EVIDENCE": {
      memoizedSchema(AddProofEvidenceInputSchema).parse(action.input);

      playbookProofsOperations.addProofEvidenceOperation(
        state.global,
        action as AddProofEvidenceAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PROOF_EVIDENCE": {
      memoizedSchema(RemoveProofEvidenceInputSchema).parse(action.input);

      playbookProofsOperations.removeProofEvidenceOperation(
        state.global,
        action as RemoveProofEvidenceAction,
        dispatch,
      );

      break;
    }

    case "LINK_PROOF_COMPARABLE": {
      memoizedSchema(LinkProofComparableInputSchema).parse(action.input);

      playbookProofsOperations.linkProofComparableOperation(
        state.global,
        action as LinkProofComparableAction,
        dispatch,
      );

      break;
    }

    case "UNLINK_PROOF_COMPARABLE": {
      memoizedSchema(UnlinkProofComparableInputSchema).parse(action.input);

      playbookProofsOperations.unlinkProofComparableOperation(
        state.global,
        action as UnlinkProofComparableAction,
        dispatch,
      );

      break;
    }

    case "ADD_NEVER_CLAIM": {
      memoizedSchema(AddNeverClaimInputSchema).parse(action.input);

      playbookClaimsOperations.addNeverClaimOperation(
        state.global,
        action as AddNeverClaimAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_NEVER_CLAIM": {
      memoizedSchema(UpdateNeverClaimInputSchema).parse(action.input);

      playbookClaimsOperations.updateNeverClaimOperation(
        state.global,
        action as UpdateNeverClaimAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_NEVER_CLAIM": {
      memoizedSchema(RemoveNeverClaimInputSchema).parse(action.input);

      playbookClaimsOperations.removeNeverClaimOperation(
        state.global,
        action as RemoveNeverClaimAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<PlaybookPHState> = createReducer(stateReducer);
