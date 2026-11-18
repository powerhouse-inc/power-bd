/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  LinkPlayerEvidenceInput,
  MovePlayerInput,
  PlacePlayerInput,
  RemovePlayerInput,
  SetAxesInput,
  SetOurPositionInput,
  SetPlayerNoteInput,
  UnlinkPlayerEvidenceInput,
} from "../types.js";

export type SetAxesAction = Action & { type: "SET_AXES"; input: SetAxesInput };
export type PlacePlayerAction = Action & {
  type: "PLACE_PLAYER";
  input: PlacePlayerInput;
};
export type MovePlayerAction = Action & {
  type: "MOVE_PLAYER";
  input: MovePlayerInput;
};
export type SetPlayerNoteAction = Action & {
  type: "SET_PLAYER_NOTE";
  input: SetPlayerNoteInput;
};
export type LinkPlayerEvidenceAction = Action & {
  type: "LINK_PLAYER_EVIDENCE";
  input: LinkPlayerEvidenceInput;
};
export type UnlinkPlayerEvidenceAction = Action & {
  type: "UNLINK_PLAYER_EVIDENCE";
  input: UnlinkPlayerEvidenceInput;
};
export type RemovePlayerAction = Action & {
  type: "REMOVE_PLAYER";
  input: RemovePlayerInput;
};
export type SetOurPositionAction = Action & {
  type: "SET_OUR_POSITION";
  input: SetOurPositionInput;
};

export type MarketMapAction =
  | SetAxesAction
  | PlacePlayerAction
  | MovePlayerAction
  | SetPlayerNoteAction
  | LinkPlayerEvidenceAction
  | UnlinkPlayerEvidenceAction
  | RemovePlayerAction
  | SetOurPositionAction;
