/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { LeadAnglesAction } from "./angles/actions.js";
import type { LeadDetailsAction } from "./details/actions.js";
import type { LeadMessagesAction } from "./messages/actions.js";
import type { LeadRelationshipAction } from "./relationship/actions.js";
import type { LeadStatusAction } from "./status/actions.js";

export * from "./angles/actions.js";
export * from "./details/actions.js";
export * from "./messages/actions.js";
export * from "./relationship/actions.js";
export * from "./status/actions.js";

export type LeadAction =
  | LeadDetailsAction
  | LeadStatusAction
  | LeadAnglesAction
  | LeadMessagesAction
  | LeadRelationshipAction;
