/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  proposalContentActions,
  proposalDeliverablesActions,
  proposalDetailsActions,
  proposalOptionsActions,
  proposalPackagesActions,
  proposalPaymentActions,
  proposalReferencesActions,
  proposalScopeActions,
  proposalStatusActions,
} from "./gen/creators.js";

/** Actions for the Proposal document model */

export const actions = {
  ...baseActions,
  ...proposalDetailsActions,
  ...proposalStatusActions,
  ...proposalReferencesActions,
  ...proposalPackagesActions,
  ...proposalDeliverablesActions,
  ...proposalOptionsActions,
  ...proposalPaymentActions,
  ...proposalScopeActions,
  ...proposalContentActions,
};
