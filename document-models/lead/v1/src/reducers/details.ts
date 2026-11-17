import type { LeadDetailsOperations } from "document-models/lead/v1";
import {
  InvestorLeadLimitError,
  OrganisationRequiredError,
  OwnerRequiredError,
} from "../../gen/details/error.js";

export const leadDetailsOperations: LeadDetailsOperations = {
  setLeadDetailsOperation(state, action) {
    const { name, kind, organisationId } = action.input;
    if (organisationId === null && state.status !== "TO_CONTACT")
      throw new OrganisationRequiredError(
        "A lead past to contact needs an organisation",
      );
    const reached = state.status === "PARKED" ? state.parkedFrom : state.status;
    if (kind === "INVESTOR" && (reached === "PROPOSAL" || reached === "WON"))
      throw new InvestorLeadLimitError(
        "An investor lead goes no further than met",
      );
    if (name !== undefined) state.name = name;
    if (kind !== undefined) state.kind = kind;
    if (organisationId !== undefined) state.organisationId = organisationId;
  },
  setOwnerOperation(state, action) {
    const owner = action.input.owner ?? null;
    if (owner === null && state.status !== "TO_CONTACT")
      throw new OwnerRequiredError("A lead past to contact needs an owner");
    state.owner = owner;
  },
};
