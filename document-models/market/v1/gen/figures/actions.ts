/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { Action } from "document-model";
import type {
  AddPublishedFigureInput,
  RemovePublishedFigureInput,
} from "../types.js";

export type AddPublishedFigureAction = Action & {
  type: "ADD_PUBLISHED_FIGURE";
  input: AddPublishedFigureInput;
};
export type RemovePublishedFigureAction = Action & {
  type: "REMOVE_PUBLISHED_FIGURE";
  input: RemovePublishedFigureInput;
};

export type MarketFiguresAction =
  | AddPublishedFigureAction
  | RemovePublishedFigureAction;
