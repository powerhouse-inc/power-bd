import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { ProposalPHState } from "document-models/proposal/v1";
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
} from "./content/actions.js";
import type {
  AddDeliverableAction,
  RemoveDeliverableAction,
  ReorderDeliverablesAction,
  SetDeliverablePriceAction,
  UpdateDeliverableAction,
} from "./deliverables/actions.js";
import type {
  SetProposalDetailsAction,
  SetProposalPartiesAction,
} from "./details/actions.js";
import type {
  AddAdjustmentAction,
  AddOptionAction,
  RemoveAdjustmentAction,
  RemoveOptionAction,
  UpdateOptionAction,
} from "./options/actions.js";
import type {
  AddPackageAction,
  RemovePackageAction,
  ReorderPackagesAction,
  UpdatePackageAction,
} from "./packages/actions.js";
import type {
  AddPaymentStepAction,
  RemovePaymentStepAction,
  UpdatePaymentStepAction,
} from "./payment/actions.js";
import type {
  AddReferenceAction,
  RemoveReferenceAction,
} from "./references/actions.js";
import type {
  AddActorAction,
  AddBoundaryAction,
  AddUseCaseAction,
  RemoveActorAction,
  RemoveBoundaryAction,
  RemoveUseCaseAction,
  UpdateActorAction,
  UpdateBoundaryAction,
  UpdateUseCaseAction,
} from "./scope/actions.js";
import type {
  ApproveProposalAction,
  MarkProposalSentAction,
  RecordProposalAnswerAction,
  ReopenProposalAction,
  SetSentCopyAction,
  SetSignedCopyAction,
  SupersedeProposalAction,
  WithdrawProposalAction,
} from "./status/actions.js";

import { proposalContentOperations } from "../src/reducers/content.js";
import { proposalDeliverablesOperations } from "../src/reducers/deliverables.js";
import { proposalDetailsOperations } from "../src/reducers/details.js";
import { proposalOptionsOperations } from "../src/reducers/options.js";
import { proposalPackagesOperations } from "../src/reducers/packages.js";
import { proposalPaymentOperations } from "../src/reducers/payment.js";
import { proposalReferencesOperations } from "../src/reducers/references.js";
import { proposalScopeOperations } from "../src/reducers/scope.js";
import { proposalStatusOperations } from "../src/reducers/status.js";

import {
  AddActorInputSchema,
  AddAdjustmentInputSchema,
  AddAnnexInputSchema,
  AddBoundaryInputSchema,
  AddClauseInputSchema,
  AddDeliverableInputSchema,
  AddFigureInputSchema,
  AddOptionInputSchema,
  AddPackageInputSchema,
  AddPaymentStepInputSchema,
  AddReferenceInputSchema,
  AddSectionInputSchema,
  AddUseCaseInputSchema,
  ApproveProposalInputSchema,
  MarkProposalSentInputSchema,
  RecordProposalAnswerInputSchema,
  RemoveActorInputSchema,
  RemoveAdjustmentInputSchema,
  RemoveAnnexInputSchema,
  RemoveBoundaryInputSchema,
  RemoveClauseInputSchema,
  RemoveDeliverableInputSchema,
  RemoveFigureInputSchema,
  RemoveOptionInputSchema,
  RemovePackageInputSchema,
  RemovePaymentStepInputSchema,
  RemoveReferenceInputSchema,
  RemoveSectionInputSchema,
  RemoveUseCaseInputSchema,
  ReopenProposalInputSchema,
  ReorderClausesInputSchema,
  ReorderDeliverablesInputSchema,
  ReorderFiguresInputSchema,
  ReorderPackagesInputSchema,
  ReorderSectionsInputSchema,
  SetDeliverablePriceInputSchema,
  SetProposalDetailsInputSchema,
  SetProposalPartiesInputSchema,
  SetSentCopyInputSchema,
  SetSignedCopyInputSchema,
  SupersedeProposalInputSchema,
  UpdateActorInputSchema,
  UpdateAnnexInputSchema,
  UpdateBoundaryInputSchema,
  UpdateClauseInputSchema,
  UpdateDeliverableInputSchema,
  UpdateFigureInputSchema,
  UpdateOptionInputSchema,
  UpdatePackageInputSchema,
  UpdatePaymentStepInputSchema,
  UpdateSectionInputSchema,
  UpdateUseCaseInputSchema,
  WithdrawProposalInputSchema,
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

const stateReducer: StateReducer<ProposalPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_PROPOSAL_DETAILS": {
      memoizedSchema(SetProposalDetailsInputSchema).parse(action.input);

      proposalDetailsOperations.setProposalDetailsOperation(
        state.global,
        action as SetProposalDetailsAction,
        dispatch,
      );

      break;
    }

    case "SET_PROPOSAL_PARTIES": {
      memoizedSchema(SetProposalPartiesInputSchema).parse(action.input);

      proposalDetailsOperations.setProposalPartiesOperation(
        state.global,
        action as SetProposalPartiesAction,
        dispatch,
      );

      break;
    }

    case "APPROVE_PROPOSAL": {
      memoizedSchema(ApproveProposalInputSchema).parse(action.input);

      proposalStatusOperations.approveProposalOperation(
        state.global,
        action as ApproveProposalAction,
        dispatch,
      );

      break;
    }

    case "REOPEN_PROPOSAL": {
      memoizedSchema(ReopenProposalInputSchema).parse(action.input);

      proposalStatusOperations.reopenProposalOperation(
        state.global,
        action as ReopenProposalAction,
        dispatch,
      );

      break;
    }

    case "MARK_PROPOSAL_SENT": {
      memoizedSchema(MarkProposalSentInputSchema).parse(action.input);

      proposalStatusOperations.markProposalSentOperation(
        state.global,
        action as MarkProposalSentAction,
        dispatch,
      );

      break;
    }

    case "SET_SENT_COPY": {
      memoizedSchema(SetSentCopyInputSchema).parse(action.input);

      proposalStatusOperations.setSentCopyOperation(
        state.global,
        action as SetSentCopyAction,
        dispatch,
      );

      break;
    }

    case "RECORD_PROPOSAL_ANSWER": {
      memoizedSchema(RecordProposalAnswerInputSchema).parse(action.input);

      proposalStatusOperations.recordProposalAnswerOperation(
        state.global,
        action as RecordProposalAnswerAction,
        dispatch,
      );

      break;
    }

    case "SET_SIGNED_COPY": {
      memoizedSchema(SetSignedCopyInputSchema).parse(action.input);

      proposalStatusOperations.setSignedCopyOperation(
        state.global,
        action as SetSignedCopyAction,
        dispatch,
      );

      break;
    }

    case "WITHDRAW_PROPOSAL": {
      memoizedSchema(WithdrawProposalInputSchema).parse(action.input);

      proposalStatusOperations.withdrawProposalOperation(
        state.global,
        action as WithdrawProposalAction,
        dispatch,
      );

      break;
    }

    case "SUPERSEDE_PROPOSAL": {
      memoizedSchema(SupersedeProposalInputSchema).parse(action.input);

      proposalStatusOperations.supersedeProposalOperation(
        state.global,
        action as SupersedeProposalAction,
        dispatch,
      );

      break;
    }

    case "ADD_REFERENCE": {
      memoizedSchema(AddReferenceInputSchema).parse(action.input);

      proposalReferencesOperations.addReferenceOperation(
        state.global,
        action as AddReferenceAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_REFERENCE": {
      memoizedSchema(RemoveReferenceInputSchema).parse(action.input);

      proposalReferencesOperations.removeReferenceOperation(
        state.global,
        action as RemoveReferenceAction,
        dispatch,
      );

      break;
    }

    case "ADD_PACKAGE": {
      memoizedSchema(AddPackageInputSchema).parse(action.input);

      proposalPackagesOperations.addPackageOperation(
        state.global,
        action as AddPackageAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_PACKAGE": {
      memoizedSchema(UpdatePackageInputSchema).parse(action.input);

      proposalPackagesOperations.updatePackageOperation(
        state.global,
        action as UpdatePackageAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PACKAGE": {
      memoizedSchema(RemovePackageInputSchema).parse(action.input);

      proposalPackagesOperations.removePackageOperation(
        state.global,
        action as RemovePackageAction,
        dispatch,
      );

      break;
    }

    case "REORDER_PACKAGES": {
      memoizedSchema(ReorderPackagesInputSchema).parse(action.input);

      proposalPackagesOperations.reorderPackagesOperation(
        state.global,
        action as ReorderPackagesAction,
        dispatch,
      );

      break;
    }

    case "ADD_DELIVERABLE": {
      memoizedSchema(AddDeliverableInputSchema).parse(action.input);

      proposalDeliverablesOperations.addDeliverableOperation(
        state.global,
        action as AddDeliverableAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_DELIVERABLE": {
      memoizedSchema(UpdateDeliverableInputSchema).parse(action.input);

      proposalDeliverablesOperations.updateDeliverableOperation(
        state.global,
        action as UpdateDeliverableAction,
        dispatch,
      );

      break;
    }

    case "SET_DELIVERABLE_PRICE": {
      memoizedSchema(SetDeliverablePriceInputSchema).parse(action.input);

      proposalDeliverablesOperations.setDeliverablePriceOperation(
        state.global,
        action as SetDeliverablePriceAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_DELIVERABLE": {
      memoizedSchema(RemoveDeliverableInputSchema).parse(action.input);

      proposalDeliverablesOperations.removeDeliverableOperation(
        state.global,
        action as RemoveDeliverableAction,
        dispatch,
      );

      break;
    }

    case "REORDER_DELIVERABLES": {
      memoizedSchema(ReorderDeliverablesInputSchema).parse(action.input);

      proposalDeliverablesOperations.reorderDeliverablesOperation(
        state.global,
        action as ReorderDeliverablesAction,
        dispatch,
      );

      break;
    }

    case "ADD_OPTION": {
      memoizedSchema(AddOptionInputSchema).parse(action.input);

      proposalOptionsOperations.addOptionOperation(
        state.global,
        action as AddOptionAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_OPTION": {
      memoizedSchema(UpdateOptionInputSchema).parse(action.input);

      proposalOptionsOperations.updateOptionOperation(
        state.global,
        action as UpdateOptionAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_OPTION": {
      memoizedSchema(RemoveOptionInputSchema).parse(action.input);

      proposalOptionsOperations.removeOptionOperation(
        state.global,
        action as RemoveOptionAction,
        dispatch,
      );

      break;
    }

    case "ADD_ADJUSTMENT": {
      memoizedSchema(AddAdjustmentInputSchema).parse(action.input);

      proposalOptionsOperations.addAdjustmentOperation(
        state.global,
        action as AddAdjustmentAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_ADJUSTMENT": {
      memoizedSchema(RemoveAdjustmentInputSchema).parse(action.input);

      proposalOptionsOperations.removeAdjustmentOperation(
        state.global,
        action as RemoveAdjustmentAction,
        dispatch,
      );

      break;
    }

    case "ADD_PAYMENT_STEP": {
      memoizedSchema(AddPaymentStepInputSchema).parse(action.input);

      proposalPaymentOperations.addPaymentStepOperation(
        state.global,
        action as AddPaymentStepAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_PAYMENT_STEP": {
      memoizedSchema(UpdatePaymentStepInputSchema).parse(action.input);

      proposalPaymentOperations.updatePaymentStepOperation(
        state.global,
        action as UpdatePaymentStepAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PAYMENT_STEP": {
      memoizedSchema(RemovePaymentStepInputSchema).parse(action.input);

      proposalPaymentOperations.removePaymentStepOperation(
        state.global,
        action as RemovePaymentStepAction,
        dispatch,
      );

      break;
    }

    case "ADD_ACTOR": {
      memoizedSchema(AddActorInputSchema).parse(action.input);

      proposalScopeOperations.addActorOperation(
        state.global,
        action as AddActorAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_ACTOR": {
      memoizedSchema(UpdateActorInputSchema).parse(action.input);

      proposalScopeOperations.updateActorOperation(
        state.global,
        action as UpdateActorAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_ACTOR": {
      memoizedSchema(RemoveActorInputSchema).parse(action.input);

      proposalScopeOperations.removeActorOperation(
        state.global,
        action as RemoveActorAction,
        dispatch,
      );

      break;
    }

    case "ADD_USE_CASE": {
      memoizedSchema(AddUseCaseInputSchema).parse(action.input);

      proposalScopeOperations.addUseCaseOperation(
        state.global,
        action as AddUseCaseAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_USE_CASE": {
      memoizedSchema(UpdateUseCaseInputSchema).parse(action.input);

      proposalScopeOperations.updateUseCaseOperation(
        state.global,
        action as UpdateUseCaseAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_USE_CASE": {
      memoizedSchema(RemoveUseCaseInputSchema).parse(action.input);

      proposalScopeOperations.removeUseCaseOperation(
        state.global,
        action as RemoveUseCaseAction,
        dispatch,
      );

      break;
    }

    case "ADD_BOUNDARY": {
      memoizedSchema(AddBoundaryInputSchema).parse(action.input);

      proposalScopeOperations.addBoundaryOperation(
        state.global,
        action as AddBoundaryAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_BOUNDARY": {
      memoizedSchema(UpdateBoundaryInputSchema).parse(action.input);

      proposalScopeOperations.updateBoundaryOperation(
        state.global,
        action as UpdateBoundaryAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_BOUNDARY": {
      memoizedSchema(RemoveBoundaryInputSchema).parse(action.input);

      proposalScopeOperations.removeBoundaryOperation(
        state.global,
        action as RemoveBoundaryAction,
        dispatch,
      );

      break;
    }

    case "ADD_SECTION": {
      memoizedSchema(AddSectionInputSchema).parse(action.input);

      proposalContentOperations.addSectionOperation(
        state.global,
        action as AddSectionAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_SECTION": {
      memoizedSchema(UpdateSectionInputSchema).parse(action.input);

      proposalContentOperations.updateSectionOperation(
        state.global,
        action as UpdateSectionAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_SECTION": {
      memoizedSchema(RemoveSectionInputSchema).parse(action.input);

      proposalContentOperations.removeSectionOperation(
        state.global,
        action as RemoveSectionAction,
        dispatch,
      );

      break;
    }

    case "REORDER_SECTIONS": {
      memoizedSchema(ReorderSectionsInputSchema).parse(action.input);

      proposalContentOperations.reorderSectionsOperation(
        state.global,
        action as ReorderSectionsAction,
        dispatch,
      );

      break;
    }

    case "ADD_CLAUSE": {
      memoizedSchema(AddClauseInputSchema).parse(action.input);

      proposalContentOperations.addClauseOperation(
        state.global,
        action as AddClauseAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_CLAUSE": {
      memoizedSchema(UpdateClauseInputSchema).parse(action.input);

      proposalContentOperations.updateClauseOperation(
        state.global,
        action as UpdateClauseAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_CLAUSE": {
      memoizedSchema(RemoveClauseInputSchema).parse(action.input);

      proposalContentOperations.removeClauseOperation(
        state.global,
        action as RemoveClauseAction,
        dispatch,
      );

      break;
    }

    case "REORDER_CLAUSES": {
      memoizedSchema(ReorderClausesInputSchema).parse(action.input);

      proposalContentOperations.reorderClausesOperation(
        state.global,
        action as ReorderClausesAction,
        dispatch,
      );

      break;
    }

    case "ADD_ANNEX": {
      memoizedSchema(AddAnnexInputSchema).parse(action.input);

      proposalContentOperations.addAnnexOperation(
        state.global,
        action as AddAnnexAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_ANNEX": {
      memoizedSchema(UpdateAnnexInputSchema).parse(action.input);

      proposalContentOperations.updateAnnexOperation(
        state.global,
        action as UpdateAnnexAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_ANNEX": {
      memoizedSchema(RemoveAnnexInputSchema).parse(action.input);

      proposalContentOperations.removeAnnexOperation(
        state.global,
        action as RemoveAnnexAction,
        dispatch,
      );

      break;
    }

    case "ADD_FIGURE": {
      memoizedSchema(AddFigureInputSchema).parse(action.input);

      proposalContentOperations.addFigureOperation(
        state.global,
        action as AddFigureAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_FIGURE": {
      memoizedSchema(UpdateFigureInputSchema).parse(action.input);

      proposalContentOperations.updateFigureOperation(
        state.global,
        action as UpdateFigureAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_FIGURE": {
      memoizedSchema(RemoveFigureInputSchema).parse(action.input);

      proposalContentOperations.removeFigureOperation(
        state.global,
        action as RemoveFigureAction,
        dispatch,
      );

      break;
    }

    case "REORDER_FIGURES": {
      memoizedSchema(ReorderFiguresInputSchema).parse(action.input);

      proposalContentOperations.reorderFiguresOperation(
        state.global,
        action as ReorderFiguresAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<ProposalPHState> = createReducer(stateReducer);
