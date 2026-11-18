export type ErrorCode =
  | "AXIS_TEXT_REQUIRED"
  | "AXES_REQUIRED"
  | "POSITION_OUT_OF_RANGE"
  | "ORGANISATION_ALREADY_PLACED"
  | "DUPLICATE_PLAYER_ID"
  | "PLAYER_NOT_FOUND"
  | "EVIDENCE_ALREADY_LINKED"
  | "EVIDENCE_NOT_LINKED";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class AxisTextRequiredError extends Error implements ReducerError {
  errorCode = "AXIS_TEXT_REQUIRED" as ErrorCode;
  constructor(message = "AxisTextRequiredError") {
    super(message);
  }
}

export class AxesRequiredError extends Error implements ReducerError {
  errorCode = "AXES_REQUIRED" as ErrorCode;
  constructor(message = "AxesRequiredError") {
    super(message);
  }
}

export class PositionOutOfRangeError extends Error implements ReducerError {
  errorCode = "POSITION_OUT_OF_RANGE" as ErrorCode;
  constructor(message = "PositionOutOfRangeError") {
    super(message);
  }
}

export class OrganisationAlreadyPlacedError
  extends Error
  implements ReducerError
{
  errorCode = "ORGANISATION_ALREADY_PLACED" as ErrorCode;
  constructor(message = "OrganisationAlreadyPlacedError") {
    super(message);
  }
}

export class DuplicatePlayerIdError extends Error implements ReducerError {
  errorCode = "DUPLICATE_PLAYER_ID" as ErrorCode;
  constructor(message = "DuplicatePlayerIdError") {
    super(message);
  }
}

export class PlayerNotFoundError extends Error implements ReducerError {
  errorCode = "PLAYER_NOT_FOUND" as ErrorCode;
  constructor(message = "PlayerNotFoundError") {
    super(message);
  }
}

export class EvidenceAlreadyLinkedError extends Error implements ReducerError {
  errorCode = "EVIDENCE_ALREADY_LINKED" as ErrorCode;
  constructor(message = "EvidenceAlreadyLinkedError") {
    super(message);
  }
}

export class EvidenceNotLinkedError extends Error implements ReducerError {
  errorCode = "EVIDENCE_NOT_LINKED" as ErrorCode;
  constructor(message = "EvidenceNotLinkedError") {
    super(message);
  }
}

export const errors = {
  SetAxes: { AxisTextRequiredError },

  PlacePlayer: {
    AxesRequiredError,
    PositionOutOfRangeError,
    OrganisationAlreadyPlacedError,
    DuplicatePlayerIdError,
  },

  MovePlayer: { PlayerNotFoundError, PositionOutOfRangeError },

  SetPlayerNote: { PlayerNotFoundError },

  LinkPlayerEvidence: { PlayerNotFoundError, EvidenceAlreadyLinkedError },

  UnlinkPlayerEvidence: { PlayerNotFoundError, EvidenceNotLinkedError },

  RemovePlayer: { PlayerNotFoundError },

  SetOurPosition: { AxesRequiredError, PositionOutOfRangeError },
};
