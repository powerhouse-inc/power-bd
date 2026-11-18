import { actions as investorListActions } from "document-models/investor-list";
import { actions as leadActions } from "document-models/lead";
import { actions as opportunityActions } from "document-models/opportunity";
import { actions as proposalActions } from "document-models/proposal";
import { generateId } from "document-model";
import type { MoveOption } from "../../../kit/overview-view/index.js";
import { reminderStep } from "../../../kit/reminder/index.js";

/**
 * The action that reaches a move's status, as the record pages send it. A
 * row's move goes to its list document and names the row (`rowId`).
 */
export function moveAction(
  option: MoveOption,
  reason: string | undefined,
  rowId = "",
) {
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
    case "SHORTLIST_ROW":
      return investorListActions.shortlistRow({ id: rowId });
    case "RELIST_ROW":
      return investorListActions.relistRow({ id: rowId });
    case "EXCLUDE_ROW":
      return investorListActions.excludeRow({
        id: rowId,
        reason: reason ?? "",
      });
    case "REOPEN_PROPOSAL":
      return proposalActions.reopenProposal({});
    case "ACCEPT_PROPOSAL":
      return proposalActions.recordProposalAnswer({
        accepted: true,
        chosenOptionId: option.optionId,
        answeredAt: at,
      });
    case "DECLINE_PROPOSAL":
      return proposalActions.recordProposalAnswer({
        accepted: false,
        reason,
        answeredAt: at,
      });
    case "WITHDRAW_PROPOSAL":
      return proposalActions.withdrawProposal({ reason: reason ?? "" });
  }
}

/** The next step that brings a parked lead back on a day: "Check back: <reason>", for its owner. */
export function reminderAction(reason: string, day: string, owner: string | null) {
  return leadActions.addNextStep(reminderStep({ id: generateId(), reason, day, owner }));
}
