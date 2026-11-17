import type { LeadStatusOperations } from "document-models/lead/v1";
import {
  InvestorLeadLimitError,
  LeadAlreadyParkedError,
  LeadClosedError,
  LeadNotParkedError,
  LeadParkedError,
  LostReasonRequiredError,
  OrganisationRequiredError,
  OwnerRequiredError,
  ParkLeadRequiredError,
  ParkReasonRequiredError,
} from "../../gen/status/error.js";

export const leadStatusOperations: LeadStatusOperations = {
  setLeadStatusOperation(state, action) {
    const { status, reason, changedAt } = action.input;
    if (state.status === "WON" || state.status === "LOST")
      throw new LeadClosedError("A won or lost lead is final");
    if (state.status === "PARKED")
      throw new LeadParkedError(
        "A parked lead is unparked before its status changes",
      );
    if (status === "PARKED")
      throw new ParkLeadRequiredError(
        "A lead is parked with PARK_LEAD, which takes the reason",
      );
    if (status !== "TO_CONTACT" && state.owner === null)
      throw new OwnerRequiredError("A lead past to contact needs an owner");
    if (status !== "TO_CONTACT" && state.organisationId === null)
      throw new OrganisationRequiredError(
        "A lead past to contact needs an organisation",
      );
    if (
      state.kind === "INVESTOR" &&
      (status === "PROPOSAL" || status === "WON")
    )
      throw new InvestorLeadLimitError(
        "An investor lead goes no further than met",
      );
    let statusReason: string | null = null;
    if (status === "LOST") {
      if (reason == null || reason.trim() === "")
        throw new LostReasonRequiredError("A lost lead needs a reason");
      statusReason = reason;
    }
    state.status = status;
    state.statusReason = statusReason;
    if (status === "WON" || status === "LOST") state.closedAt = changedAt;
  },
  parkLeadOperation(state, action) {
    const { reason } = action.input;
    if (state.status === "WON" || state.status === "LOST")
      throw new LeadClosedError("A won or lost lead is final");
    if (state.status === "PARKED")
      throw new LeadAlreadyParkedError("The lead is already parked");
    if (state.owner === null)
      throw new OwnerRequiredError("A lead past to contact needs an owner");
    if (state.organisationId === null)
      throw new OrganisationRequiredError(
        "A lead past to contact needs an organisation",
      );
    if (reason.trim() === "")
      throw new ParkReasonRequiredError("Parking a lead needs a reason");
    state.parkedFrom = state.status;
    state.status = "PARKED";
    state.statusReason = reason;
  },
  unparkLeadOperation(state) {
    const from = state.parkedFrom;
    if (state.status !== "PARKED" || from == null)
      throw new LeadNotParkedError("Only a parked lead can be unparked");
    state.status = from;
    state.parkedFrom = null;
    state.statusReason = null;
  },
};
