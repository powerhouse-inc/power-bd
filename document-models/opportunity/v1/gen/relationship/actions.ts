/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddConfidentialItemInput,
  AddInteractionInput,
  AddNextStepInput,
  AddReferenceInput,
  CompleteNextStepInput,
  LinkContactInput,
  RemoveConfidentialItemInput,
  RemoveInteractionInput,
  RemoveNextStepInput,
  RemoveReferenceInput,
  ReopenNextStepInput,
  SetInteractionOutcomeInput,
  UnlinkContactInput,
  UpdateInteractionInput,
  UpdateNextStepInput,
} from "../types.js";

export type AddNextStepAction = Action & {
  type: "ADD_NEXT_STEP";
  input: AddNextStepInput;
};
export type UpdateNextStepAction = Action & {
  type: "UPDATE_NEXT_STEP";
  input: UpdateNextStepInput;
};
export type CompleteNextStepAction = Action & {
  type: "COMPLETE_NEXT_STEP";
  input: CompleteNextStepInput;
};
export type ReopenNextStepAction = Action & {
  type: "REOPEN_NEXT_STEP";
  input: ReopenNextStepInput;
};
export type RemoveNextStepAction = Action & {
  type: "REMOVE_NEXT_STEP";
  input: RemoveNextStepInput;
};
export type AddInteractionAction = Action & {
  type: "ADD_INTERACTION";
  input: AddInteractionInput;
};
export type UpdateInteractionAction = Action & {
  type: "UPDATE_INTERACTION";
  input: UpdateInteractionInput;
};
export type RemoveInteractionAction = Action & {
  type: "REMOVE_INTERACTION";
  input: RemoveInteractionInput;
};
export type LinkContactAction = Action & {
  type: "LINK_CONTACT";
  input: LinkContactInput;
};
export type UnlinkContactAction = Action & {
  type: "UNLINK_CONTACT";
  input: UnlinkContactInput;
};
export type AddReferenceAction = Action & {
  type: "ADD_REFERENCE";
  input: AddReferenceInput;
};
export type RemoveReferenceAction = Action & {
  type: "REMOVE_REFERENCE";
  input: RemoveReferenceInput;
};
export type AddConfidentialItemAction = Action & {
  type: "ADD_CONFIDENTIAL_ITEM";
  input: AddConfidentialItemInput;
};
export type RemoveConfidentialItemAction = Action & {
  type: "REMOVE_CONFIDENTIAL_ITEM";
  input: RemoveConfidentialItemInput;
};
export type SetInteractionOutcomeAction = Action & {
  type: "SET_INTERACTION_OUTCOME";
  input: SetInteractionOutcomeInput;
};

export type OpportunityRelationshipAction =
  | AddNextStepAction
  | UpdateNextStepAction
  | CompleteNextStepAction
  | ReopenNextStepAction
  | RemoveNextStepAction
  | AddInteractionAction
  | UpdateInteractionAction
  | RemoveInteractionAction
  | LinkContactAction
  | UnlinkContactAction
  | AddReferenceAction
  | RemoveReferenceAction
  | AddConfidentialItemAction
  | RemoveConfidentialItemAction
  | SetInteractionOutcomeAction;
