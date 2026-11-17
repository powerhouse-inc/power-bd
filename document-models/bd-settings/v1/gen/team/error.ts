export type ErrorCode =
  | "DUPLICATE_TEAM_MEMBER_ID"
  | "DUPLICATE_TEAM_MEMBER_ADDRESS"
  | "TEAM_MEMBER_NAME_REQUIRED"
  | "TEAM_MEMBER_NOT_FOUND";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateTeamMemberIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_TEAM_MEMBER_ID" as ErrorCode;
  constructor(message = "DuplicateTeamMemberIdError") {
    super(message);
  }
}

export class DuplicateTeamMemberAddressError
  extends Error
  implements ReducerError
{
  errorCode = "DUPLICATE_TEAM_MEMBER_ADDRESS" as ErrorCode;
  constructor(message = "DuplicateTeamMemberAddressError") {
    super(message);
  }
}

export class TeamMemberNameRequiredError extends Error implements ReducerError {
  errorCode = "TEAM_MEMBER_NAME_REQUIRED" as ErrorCode;
  constructor(message = "TeamMemberNameRequiredError") {
    super(message);
  }
}

export class TeamMemberNotFoundError extends Error implements ReducerError {
  errorCode = "TEAM_MEMBER_NOT_FOUND" as ErrorCode;
  constructor(message = "TeamMemberNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddTeamMember: {
    DuplicateTeamMemberIdError,
    DuplicateTeamMemberAddressError,
    TeamMemberNameRequiredError,
  },

  UpdateTeamMember: {
    TeamMemberNotFoundError,
    DuplicateTeamMemberAddressError,
    TeamMemberNameRequiredError,
  },

  DeactivateTeamMember: { TeamMemberNotFoundError },

  ReactivateTeamMember: { TeamMemberNotFoundError },
};
