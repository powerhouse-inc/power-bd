import type { OpportunityConsortiumOperations } from "document-models/opportunity/v1";
import {
  DuplicatePartnerIdError,
  PartnerNotFoundError,
} from "../../gen/consortium/error.js";

export const opportunityConsortiumOperations: OpportunityConsortiumOperations =
  {
    setCoordinatorOperation(state, action) {
      state.coordinatorId = action.input.coordinatorId ?? null;
    },
    addPartnerOperation(state, action) {
      const { input } = action;
      if (state.partners.some((p) => p.id === input.id))
        throw new DuplicatePartnerIdError(`Partner ${input.id} already exists`);
      state.partners.push({
        id: input.id,
        organisationId: input.organisationId,
        role: input.role ?? null,
        country: input.country ?? null,
        status: input.status ?? "ASKED",
        leadId: input.leadId ?? null,
      });
    },
    updatePartnerOperation(state, action) {
      const { input } = action;
      const partner = state.partners.find((p) => p.id === input.id);
      if (!partner)
        throw new PartnerNotFoundError(`Partner ${input.id} not found`);
      if (input.organisationId != null)
        partner.organisationId = input.organisationId;
      if (input.role !== undefined) partner.role = input.role;
      if (input.country !== undefined) partner.country = input.country;
      if (input.status != null) partner.status = input.status;
      if (input.leadId !== undefined) partner.leadId = input.leadId;
    },
    removePartnerOperation(state, action) {
      const index = state.partners.findIndex((p) => p.id === action.input.id);
      if (index === -1)
        throw new PartnerNotFoundError(`Partner ${action.input.id} not found`);
      state.partners.splice(index, 1);
    },
  };
