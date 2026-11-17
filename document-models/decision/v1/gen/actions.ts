/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DecisionDetailsAction } from "./details/actions.js";
import type { DecisionReferencesAction } from "./references/actions.js";
import type { DecisionStatusAction } from "./status/actions.js";

export * from "./details/actions.js";
export * from "./references/actions.js";
export * from "./status/actions.js";

export type DecisionAction =
  | DecisionDetailsAction
  | DecisionStatusAction
  | DecisionReferencesAction;
