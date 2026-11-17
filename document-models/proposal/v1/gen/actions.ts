/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { ProposalContentAction } from "./content/actions.js";
import type { ProposalDeliverablesAction } from "./deliverables/actions.js";
import type { ProposalDetailsAction } from "./details/actions.js";
import type { ProposalOptionsAction } from "./options/actions.js";
import type { ProposalPackagesAction } from "./packages/actions.js";
import type { ProposalPaymentAction } from "./payment/actions.js";
import type { ProposalReferencesAction } from "./references/actions.js";
import type { ProposalScopeAction } from "./scope/actions.js";
import type { ProposalStatusAction } from "./status/actions.js";

export * from "./content/actions.js";
export * from "./deliverables/actions.js";
export * from "./details/actions.js";
export * from "./options/actions.js";
export * from "./packages/actions.js";
export * from "./payment/actions.js";
export * from "./references/actions.js";
export * from "./scope/actions.js";
export * from "./status/actions.js";

export type ProposalAction =
  | ProposalDetailsAction
  | ProposalStatusAction
  | ProposalReferencesAction
  | ProposalPackagesAction
  | ProposalDeliverablesAction
  | ProposalOptionsAction
  | ProposalPaymentAction
  | ProposalScopeAction
  | ProposalContentAction;
