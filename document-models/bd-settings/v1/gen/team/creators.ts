/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddTeamMemberInputSchema,
  DeactivateTeamMemberInputSchema,
  ReactivateTeamMemberInputSchema,
  UpdateTeamMemberInputSchema,
} from "../schema/zod.js";
import type {
  AddTeamMemberInput,
  DeactivateTeamMemberInput,
  ReactivateTeamMemberInput,
  UpdateTeamMemberInput,
} from "../types.js";
import type {
  AddTeamMemberAction,
  DeactivateTeamMemberAction,
  ReactivateTeamMemberAction,
  UpdateTeamMemberAction,
} from "./actions.js";

export const addTeamMember = (input: AddTeamMemberInput) =>
  createAction<AddTeamMemberAction>(
    "ADD_TEAM_MEMBER",
    { ...input },
    undefined,
    AddTeamMemberInputSchema,
    "global",
  );

export const updateTeamMember = (input: UpdateTeamMemberInput) =>
  createAction<UpdateTeamMemberAction>(
    "UPDATE_TEAM_MEMBER",
    { ...input },
    undefined,
    UpdateTeamMemberInputSchema,
    "global",
  );

export const deactivateTeamMember = (input: DeactivateTeamMemberInput) =>
  createAction<DeactivateTeamMemberAction>(
    "DEACTIVATE_TEAM_MEMBER",
    { ...input },
    undefined,
    DeactivateTeamMemberInputSchema,
    "global",
  );

export const reactivateTeamMember = (input: ReactivateTeamMemberInput) =>
  createAction<ReactivateTeamMemberAction>(
    "REACTIVATE_TEAM_MEMBER",
    { ...input },
    undefined,
    ReactivateTeamMemberInputSchema,
    "global",
  );
