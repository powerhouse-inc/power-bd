/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddConfidentialItemInputSchema,
  AddInteractionInputSchema,
  AddNextStepInputSchema,
  AddReferenceInputSchema,
  CompleteNextStepInputSchema,
  LinkContactInputSchema,
  RemoveConfidentialItemInputSchema,
  RemoveInteractionInputSchema,
  RemoveNextStepInputSchema,
  RemoveReferenceInputSchema,
  ReopenNextStepInputSchema,
  SetInteractionOutcomeInputSchema,
  UnlinkContactInputSchema,
  UpdateInteractionInputSchema,
  UpdateNextStepInputSchema,
} from "../schema/zod.js";
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
} from "./actions.js";

export const addNextStep = (input: AddNextStepInput) =>
  createAction<AddNextStepAction>(
    "ADD_NEXT_STEP",
    { ...input },
    undefined,
    AddNextStepInputSchema,
    "global",
  );

export const updateNextStep = (input: UpdateNextStepInput) =>
  createAction<UpdateNextStepAction>(
    "UPDATE_NEXT_STEP",
    { ...input },
    undefined,
    UpdateNextStepInputSchema,
    "global",
  );

export const completeNextStep = (input: CompleteNextStepInput) =>
  createAction<CompleteNextStepAction>(
    "COMPLETE_NEXT_STEP",
    { ...input },
    undefined,
    CompleteNextStepInputSchema,
    "global",
  );

export const reopenNextStep = (input: ReopenNextStepInput) =>
  createAction<ReopenNextStepAction>(
    "REOPEN_NEXT_STEP",
    { ...input },
    undefined,
    ReopenNextStepInputSchema,
    "global",
  );

export const removeNextStep = (input: RemoveNextStepInput) =>
  createAction<RemoveNextStepAction>(
    "REMOVE_NEXT_STEP",
    { ...input },
    undefined,
    RemoveNextStepInputSchema,
    "global",
  );

export const addInteraction = (input: AddInteractionInput) =>
  createAction<AddInteractionAction>(
    "ADD_INTERACTION",
    { ...input },
    undefined,
    AddInteractionInputSchema,
    "global",
  );

export const updateInteraction = (input: UpdateInteractionInput) =>
  createAction<UpdateInteractionAction>(
    "UPDATE_INTERACTION",
    { ...input },
    undefined,
    UpdateInteractionInputSchema,
    "global",
  );

export const removeInteraction = (input: RemoveInteractionInput) =>
  createAction<RemoveInteractionAction>(
    "REMOVE_INTERACTION",
    { ...input },
    undefined,
    RemoveInteractionInputSchema,
    "global",
  );

export const linkContact = (input: LinkContactInput) =>
  createAction<LinkContactAction>(
    "LINK_CONTACT",
    { ...input },
    undefined,
    LinkContactInputSchema,
    "global",
  );

export const unlinkContact = (input: UnlinkContactInput) =>
  createAction<UnlinkContactAction>(
    "UNLINK_CONTACT",
    { ...input },
    undefined,
    UnlinkContactInputSchema,
    "global",
  );

export const addReference = (input: AddReferenceInput) =>
  createAction<AddReferenceAction>(
    "ADD_REFERENCE",
    { ...input },
    undefined,
    AddReferenceInputSchema,
    "global",
  );

export const removeReference = (input: RemoveReferenceInput) =>
  createAction<RemoveReferenceAction>(
    "REMOVE_REFERENCE",
    { ...input },
    undefined,
    RemoveReferenceInputSchema,
    "global",
  );

export const addConfidentialItem = (input: AddConfidentialItemInput) =>
  createAction<AddConfidentialItemAction>(
    "ADD_CONFIDENTIAL_ITEM",
    { ...input },
    undefined,
    AddConfidentialItemInputSchema,
    "global",
  );

export const removeConfidentialItem = (input: RemoveConfidentialItemInput) =>
  createAction<RemoveConfidentialItemAction>(
    "REMOVE_CONFIDENTIAL_ITEM",
    { ...input },
    undefined,
    RemoveConfidentialItemInputSchema,
    "global",
  );

export const setInteractionOutcome = (input: SetInteractionOutcomeInput) =>
  createAction<SetInteractionOutcomeAction>(
    "SET_INTERACTION_OUTCOME",
    { ...input },
    undefined,
    SetInteractionOutcomeInputSchema,
    "global",
  );
