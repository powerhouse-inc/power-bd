/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddActorInput,
  AddBoundaryInput,
  AddUseCaseInput,
  RemoveActorInput,
  RemoveBoundaryInput,
  RemoveUseCaseInput,
  UpdateActorInput,
  UpdateBoundaryInput,
  UpdateUseCaseInput,
} from "../types.js";

export type AddActorAction = Action & {
  type: "ADD_ACTOR";
  input: AddActorInput;
};
export type UpdateActorAction = Action & {
  type: "UPDATE_ACTOR";
  input: UpdateActorInput;
};
export type RemoveActorAction = Action & {
  type: "REMOVE_ACTOR";
  input: RemoveActorInput;
};
export type AddUseCaseAction = Action & {
  type: "ADD_USE_CASE";
  input: AddUseCaseInput;
};
export type UpdateUseCaseAction = Action & {
  type: "UPDATE_USE_CASE";
  input: UpdateUseCaseInput;
};
export type RemoveUseCaseAction = Action & {
  type: "REMOVE_USE_CASE";
  input: RemoveUseCaseInput;
};
export type AddBoundaryAction = Action & {
  type: "ADD_BOUNDARY";
  input: AddBoundaryInput;
};
export type UpdateBoundaryAction = Action & {
  type: "UPDATE_BOUNDARY";
  input: UpdateBoundaryInput;
};
export type RemoveBoundaryAction = Action & {
  type: "REMOVE_BOUNDARY";
  input: RemoveBoundaryInput;
};

export type ProposalScopeAction =
  | AddActorAction
  | UpdateActorAction
  | RemoveActorAction
  | AddUseCaseAction
  | UpdateUseCaseAction
  | RemoveUseCaseAction
  | AddBoundaryAction
  | UpdateBoundaryAction
  | RemoveBoundaryAction;
