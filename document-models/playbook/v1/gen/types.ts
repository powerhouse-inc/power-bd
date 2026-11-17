/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PHBaseState, PHDocument } from "document-model";
import type { PlaybookAction } from "./actions.js";
import type { PlaybookState as PlaybookGlobalState } from "./schema/types.js";

type PlaybookLocalState = Record<PropertyKey, never>;

type PlaybookPHState = PHBaseState & {
  global: PlaybookGlobalState;
  local: PlaybookLocalState;
};
type PlaybookDocument = PHDocument<PlaybookPHState>;

export * from "./schema/types.js";

export type {
  PlaybookAction,
  PlaybookDocument,
  PlaybookGlobalState,
  PlaybookLocalState,
  PlaybookPHState,
};
