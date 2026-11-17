/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddActorInputSchema,
  AddBoundaryInputSchema,
  AddUseCaseInputSchema,
  RemoveActorInputSchema,
  RemoveBoundaryInputSchema,
  RemoveUseCaseInputSchema,
  UpdateActorInputSchema,
  UpdateBoundaryInputSchema,
  UpdateUseCaseInputSchema,
} from "../schema/zod.js";
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
} from "./actions.js";

export const addActor = (input: AddActorInput) =>
  createAction<AddActorAction>(
    "ADD_ACTOR",
    { ...input },
    undefined,
    AddActorInputSchema,
    "global",
  );

export const updateActor = (input: UpdateActorInput) =>
  createAction<UpdateActorAction>(
    "UPDATE_ACTOR",
    { ...input },
    undefined,
    UpdateActorInputSchema,
    "global",
  );

export const removeActor = (input: RemoveActorInput) =>
  createAction<RemoveActorAction>(
    "REMOVE_ACTOR",
    { ...input },
    undefined,
    RemoveActorInputSchema,
    "global",
  );

export const addUseCase = (input: AddUseCaseInput) =>
  createAction<AddUseCaseAction>(
    "ADD_USE_CASE",
    { ...input },
    undefined,
    AddUseCaseInputSchema,
    "global",
  );

export const updateUseCase = (input: UpdateUseCaseInput) =>
  createAction<UpdateUseCaseAction>(
    "UPDATE_USE_CASE",
    { ...input },
    undefined,
    UpdateUseCaseInputSchema,
    "global",
  );

export const removeUseCase = (input: RemoveUseCaseInput) =>
  createAction<RemoveUseCaseAction>(
    "REMOVE_USE_CASE",
    { ...input },
    undefined,
    RemoveUseCaseInputSchema,
    "global",
  );

export const addBoundary = (input: AddBoundaryInput) =>
  createAction<AddBoundaryAction>(
    "ADD_BOUNDARY",
    { ...input },
    undefined,
    AddBoundaryInputSchema,
    "global",
  );

export const updateBoundary = (input: UpdateBoundaryInput) =>
  createAction<UpdateBoundaryAction>(
    "UPDATE_BOUNDARY",
    { ...input },
    undefined,
    UpdateBoundaryInputSchema,
    "global",
  );

export const removeBoundary = (input: RemoveBoundaryInput) =>
  createAction<RemoveBoundaryAction>(
    "REMOVE_BOUNDARY",
    { ...input },
    undefined,
    RemoveBoundaryInputSchema,
    "global",
  );
