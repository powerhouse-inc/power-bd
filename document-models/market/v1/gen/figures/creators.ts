/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  AddPublishedFigureInputSchema,
  RemovePublishedFigureInputSchema,
} from "../schema/zod.js";
import type {
  AddPublishedFigureInput,
  RemovePublishedFigureInput,
} from "../types.js";
import type {
  AddPublishedFigureAction,
  RemovePublishedFigureAction,
} from "./actions.js";

export const addPublishedFigure = (input: AddPublishedFigureInput) =>
  createAction<AddPublishedFigureAction>(
    "ADD_PUBLISHED_FIGURE",
    { ...input },
    undefined,
    AddPublishedFigureInputSchema,
    "global",
  );

export const removePublishedFigure = (input: RemovePublishedFigureInput) =>
  createAction<RemovePublishedFigureAction>(
    "REMOVE_PUBLISHED_FIGURE",
    { ...input },
    undefined,
    RemovePublishedFigureInputSchema,
    "global",
  );
