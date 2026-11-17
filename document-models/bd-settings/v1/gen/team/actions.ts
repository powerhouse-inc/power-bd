/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddTeamMemberInput,
  DeactivateTeamMemberInput,
  ReactivateTeamMemberInput,
  UpdateTeamMemberInput,
} from "../types.js";

export type AddTeamMemberAction = Action & {
  type: "ADD_TEAM_MEMBER";
  input: AddTeamMemberInput;
};
export type UpdateTeamMemberAction = Action & {
  type: "UPDATE_TEAM_MEMBER";
  input: UpdateTeamMemberInput;
};
export type DeactivateTeamMemberAction = Action & {
  type: "DEACTIVATE_TEAM_MEMBER";
  input: DeactivateTeamMemberInput;
};
export type ReactivateTeamMemberAction = Action & {
  type: "REACTIVATE_TEAM_MEMBER";
  input: ReactivateTeamMemberInput;
};

export type BdSettingsTeamAction =
  | AddTeamMemberAction
  | UpdateTeamMemberAction
  | DeactivateTeamMemberAction
  | ReactivateTeamMemberAction;
