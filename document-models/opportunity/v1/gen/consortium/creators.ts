/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddPartnerInputSchema,
  RemovePartnerInputSchema,
  SetCoordinatorInputSchema,
  UpdatePartnerInputSchema,
} from "../schema/zod.js";
import type {
  AddPartnerInput,
  RemovePartnerInput,
  SetCoordinatorInput,
  UpdatePartnerInput,
} from "../types.js";
import type {
  AddPartnerAction,
  RemovePartnerAction,
  SetCoordinatorAction,
  UpdatePartnerAction,
} from "./actions.js";

export const setCoordinator = (input: SetCoordinatorInput) =>
  createAction<SetCoordinatorAction>(
    "SET_COORDINATOR",
    { ...input },
    undefined,
    SetCoordinatorInputSchema,
    "global",
  );

export const addPartner = (input: AddPartnerInput) =>
  createAction<AddPartnerAction>(
    "ADD_PARTNER",
    { ...input },
    undefined,
    AddPartnerInputSchema,
    "global",
  );

export const updatePartner = (input: UpdatePartnerInput) =>
  createAction<UpdatePartnerAction>(
    "UPDATE_PARTNER",
    { ...input },
    undefined,
    UpdatePartnerInputSchema,
    "global",
  );

export const removePartner = (input: RemovePartnerInput) =>
  createAction<RemovePartnerAction>(
    "REMOVE_PARTNER",
    { ...input },
    undefined,
    RemovePartnerInputSchema,
    "global",
  );
