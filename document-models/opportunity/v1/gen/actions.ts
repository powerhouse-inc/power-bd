/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { OpportunityConditionsAction } from "./conditions/actions.js";
import type { OpportunityConsortiumAction } from "./consortium/actions.js";
import type { OpportunityDatesAction } from "./dates/actions.js";
import type { OpportunityDetailsAction } from "./details/actions.js";
import type { OpportunityLimitsAction } from "./limits/actions.js";
import type { OpportunityRelationshipAction } from "./relationship/actions.js";
import type { OpportunityStatusAction } from "./status/actions.js";
import type { OpportunitySubmissionsAction } from "./submissions/actions.js";

export * from "./conditions/actions.js";
export * from "./consortium/actions.js";
export * from "./dates/actions.js";
export * from "./details/actions.js";
export * from "./limits/actions.js";
export * from "./relationship/actions.js";
export * from "./status/actions.js";
export * from "./submissions/actions.js";

export type OpportunityAction =
  | OpportunityDetailsAction
  | OpportunityStatusAction
  | OpportunityDatesAction
  | OpportunityConditionsAction
  | OpportunityLimitsAction
  | OpportunitySubmissionsAction
  | OpportunityConsortiumAction
  | OpportunityRelationshipAction;
