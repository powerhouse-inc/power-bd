import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { Board, CommonStage, OverviewInput } from "./types.js";

const LEAD_STAGE: Record<LeadState["status"], CommonStage> = {
  TO_CONTACT: "NEW",
  IN_TOUCH: "ACTIVE",
  MEETING_SET: "ACTIVE",
  MET: "ACTIVE",
  PROPOSAL: "ACTIVE",
  PARKED: "PARKED",
  WON: "CLOSED",
  LOST: "CLOSED",
};

const OPPORTUNITY_STAGE: Record<OpportunityState["status"], CommonStage> = {
  TO_EVALUATE: "NEW",
  DECIDING: "NEW",
  PREPARING: "ACTIVE",
  SUBMITTED: "ACTIVE",
  NEXT_STAGE: "ACTIVE",
  WATCHING: "PARKED",
  AWARDED: "CLOSED",
  REJECTED: "CLOSED",
  WITHDRAWN: "CLOSED",
  NO_GO: "CLOSED",
};

export const leadStage = (status: LeadState["status"]) => LEAD_STAGE[status];
export const opportunityStage = (status: OpportunityState["status"]) =>
  OPPORTUNITY_STAGE[status];

/** Each lead, opportunity and shortlisted investor row under its common stage. */
export function buildBoard(input: OverviewInput): Board {
  const board: Board = { NEW: [], ACTIVE: [], PARKED: [], CLOSED: [] };
  for (const l of input.leads) {
    const stage = leadStage(l.state.status);
    board[stage].push({
      kind: "lead",
      id: l.id,
      name: l.state.name ?? "",
      stage,
    });
  }
  for (const o of input.opportunities) {
    const stage = opportunityStage(o.state.status);
    board[stage].push({
      kind: "opportunity",
      id: o.id,
      name: o.state.name ?? "",
      stage,
    });
  }
  // Listed and excluded rows are not shown; engaged rows appear as their lead.
  for (const list of input.investorLists) {
    for (const row of list.state.rows) {
      if (row.state === "SHORTLISTED") {
        board.NEW.push({
          kind: "investor-row",
          id: list.id,
          rowId: row.id,
          name: row.name,
          stage: "NEW",
        });
      }
    }
  }
  return board;
}
