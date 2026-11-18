/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { type SignalDispatch } from "document-model";
import type { LeadGlobalState } from "../types.js";
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
  SetContactLinkDealRoleAction,
  SetInteractionOutcomeAction,
  UnlinkContactAction,
  UpdateInteractionAction,
  UpdateNextStepAction,
} from "./actions.js";

export interface LeadRelationshipOperations {
  addNextStepOperation: (
    state: LeadGlobalState,
    action: AddNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateNextStepOperation: (
    state: LeadGlobalState,
    action: UpdateNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  completeNextStepOperation: (
    state: LeadGlobalState,
    action: CompleteNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  reopenNextStepOperation: (
    state: LeadGlobalState,
    action: ReopenNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeNextStepOperation: (
    state: LeadGlobalState,
    action: RemoveNextStepAction,
    dispatch?: SignalDispatch,
  ) => void;
  addInteractionOperation: (
    state: LeadGlobalState,
    action: AddInteractionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateInteractionOperation: (
    state: LeadGlobalState,
    action: UpdateInteractionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeInteractionOperation: (
    state: LeadGlobalState,
    action: RemoveInteractionAction,
    dispatch?: SignalDispatch,
  ) => void;
  linkContactOperation: (
    state: LeadGlobalState,
    action: LinkContactAction,
    dispatch?: SignalDispatch,
  ) => void;
  unlinkContactOperation: (
    state: LeadGlobalState,
    action: UnlinkContactAction,
    dispatch?: SignalDispatch,
  ) => void;
  addReferenceOperation: (
    state: LeadGlobalState,
    action: AddReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeReferenceOperation: (
    state: LeadGlobalState,
    action: RemoveReferenceAction,
    dispatch?: SignalDispatch,
  ) => void;
  addConfidentialItemOperation: (
    state: LeadGlobalState,
    action: AddConfidentialItemAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeConfidentialItemOperation: (
    state: LeadGlobalState,
    action: RemoveConfidentialItemAction,
    dispatch?: SignalDispatch,
  ) => void;
  setContactLinkDealRoleOperation: (
    state: LeadGlobalState,
    action: SetContactLinkDealRoleAction,
    dispatch?: SignalDispatch,
  ) => void;
  setInteractionOutcomeOperation: (
    state: LeadGlobalState,
    action: SetInteractionOutcomeAction,
    dispatch?: SignalDispatch,
  ) => void;
}
