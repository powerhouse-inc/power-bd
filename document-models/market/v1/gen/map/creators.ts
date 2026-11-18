/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  LinkPlayerEvidenceInputSchema,
  MovePlayerInputSchema,
  PlacePlayerInputSchema,
  RemovePlayerInputSchema,
  SetAxesInputSchema,
  SetOurPositionInputSchema,
  SetPlayerNoteInputSchema,
  UnlinkPlayerEvidenceInputSchema,
} from "../schema/zod.js";
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
import type {
  LinkPlayerEvidenceAction,
  MovePlayerAction,
  PlacePlayerAction,
  RemovePlayerAction,
  SetAxesAction,
  SetOurPositionAction,
  SetPlayerNoteAction,
  UnlinkPlayerEvidenceAction,
} from "./actions.js";

export const setAxes = (input: SetAxesInput) =>
  createAction<SetAxesAction>(
    "SET_AXES",
    { ...input },
    undefined,
    SetAxesInputSchema,
    "global",
  );

export const placePlayer = (input: PlacePlayerInput) =>
  createAction<PlacePlayerAction>(
    "PLACE_PLAYER",
    { ...input },
    undefined,
    PlacePlayerInputSchema,
    "global",
  );

export const movePlayer = (input: MovePlayerInput) =>
  createAction<MovePlayerAction>(
    "MOVE_PLAYER",
    { ...input },
    undefined,
    MovePlayerInputSchema,
    "global",
  );

export const setPlayerNote = (input: SetPlayerNoteInput) =>
  createAction<SetPlayerNoteAction>(
    "SET_PLAYER_NOTE",
    { ...input },
    undefined,
    SetPlayerNoteInputSchema,
    "global",
  );

export const linkPlayerEvidence = (input: LinkPlayerEvidenceInput) =>
  createAction<LinkPlayerEvidenceAction>(
    "LINK_PLAYER_EVIDENCE",
    { ...input },
    undefined,
    LinkPlayerEvidenceInputSchema,
    "global",
  );

export const unlinkPlayerEvidence = (input: UnlinkPlayerEvidenceInput) =>
  createAction<UnlinkPlayerEvidenceAction>(
    "UNLINK_PLAYER_EVIDENCE",
    { ...input },
    undefined,
    UnlinkPlayerEvidenceInputSchema,
    "global",
  );

export const removePlayer = (input: RemovePlayerInput) =>
  createAction<RemovePlayerAction>(
    "REMOVE_PLAYER",
    { ...input },
    undefined,
    RemovePlayerInputSchema,
    "global",
  );

export const setOurPosition = (input: SetOurPositionInput) =>
  createAction<SetOurPositionAction>(
    "SET_OUR_POSITION",
    { ...input },
    undefined,
    SetOurPositionInputSchema,
    "global",
  );
