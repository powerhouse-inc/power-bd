import { actions as leadActions } from "document-models/lead";
import { actions as opportunityActions } from "document-models/opportunity";
import type { MoveOption } from "../../../kit/overview-view/index.js";

/** The action that reaches a move's status, as the record pages send it. */
export function moveAction(option: MoveOption, reason: string | undefined) {
  const at = new Date().toISOString();
  switch (option.act) {
    case "LEAD_STATUS":
      return leadActions.setLeadStatus({
        status: option.status,
        reason,
        changedAt: at,
      });
    case "PARK_LEAD":
      return leadActions.parkLead({ reason: reason ?? "", parkedAt: at });
    case "UNPARK_LEAD":
      return leadActions.unparkLead({});
    case "OPPORTUNITY_STATUS":
      return opportunityActions.setOpportunityStatus({
        status: option.status,
        reason,
        changedAt: at,
      });
  }
}
