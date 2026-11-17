/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { OpportunityGlobalState } from "../types.js";
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
} from "./actions.js";

export interface OpportunityRelationshipOperations {
  addNextStepOperation: (
    state: OpportunityGlobalState,
    action: AddNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateNextStepOperation: (
    state: OpportunityGlobalState,
    action: UpdateNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  completeNextStepOperation: (
    state: OpportunityGlobalState,
    action: CompleteNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  reopenNextStepOperation: (
    state: OpportunityGlobalState,
    action: ReopenNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeNextStepOperation: (
    state: OpportunityGlobalState,
    action: RemoveNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  addInteractionOperation: (
    state: OpportunityGlobalState,
    action: AddInteractionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateInteractionOperation: (
    state: OpportunityGlobalState,
    action: UpdateInteractionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeInteractionOperation: (
    state: OpportunityGlobalState,
    action: RemoveInteractionAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkContactOperation: (
    state: OpportunityGlobalState,
    action: LinkContactAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkContactOperation: (
    state: OpportunityGlobalState,
    action: UnlinkContactAction,
    dispatch?: SignalDispatch,
  ) => void;
  addReferenceOperation: (
    state: OpportunityGlobalState,
    action: AddReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeReferenceOperation: (
    state: OpportunityGlobalState,
    action: RemoveReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  addConfidentialItemOperation: (
    state: OpportunityGlobalState,
    action: AddConfidentialItemAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeConfidentialItemOperation: (
    state: OpportunityGlobalState,
    action: RemoveConfidentialItemAction,
    dispatch?: SignalDispatch,
  ) => void;
}
