/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { PlaybookClaimsAction } from "./claims/actions.js";
import type { PlaybookPositioningAction } from "./positioning/actions.js";
import type { PlaybookProofsAction } from "./proofs/actions.js";

export * from "./claims/actions.js";
export * from "./positioning/actions.js";
export * from "./proofs/actions.js";

export type PlaybookAction =
  | PlaybookPositioningAction
  | PlaybookProofsAction
  | PlaybookClaimsAction;
